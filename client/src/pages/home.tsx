import { useState, useEffect, useRef } from "react";
import { Download, Plus, Upload, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Topic } from "@shared/schema";
import Heatmap from "@/components/heatmap";
import Sidebar from "@/components/sidebar";
import { AddTopicModal, EditEntryModal } from "@/components/modals";
import { clientStorage } from "@/lib/localStorage";

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEntry, setEditEntry] = useState<{ date: string; value: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load topics from localStorage on component mount
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const loadedTopics = await clientStorage.getAllTopics();
        setTopics(loadedTopics);
        if (loadedTopics.length > 0 && !currentTopicId) {
          setCurrentTopicId(loadedTopics[0].id);
        }
      } catch (error) {
        console.error('Failed to load topics:', error);
        toast({ title: "Failed to load topics", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, [currentTopicId, toast]);

  const refreshTopics = async () => {
    try {
      const loadedTopics = await clientStorage.getAllTopics();
      setTopics(loadedTopics);
    } catch (error) {
      console.error('Failed to refresh topics:', error);
    }
  };

  const currentTopic = topics.find(t => t.id === currentTopicId);

  const handleCreateTopic = async (topicData: { name: string; unit: string }) => {
    try {
      const newTopic = await clientStorage.createTopic({
        name: topicData.name,
        unit: topicData.unit,
        data: {}
      });
      await refreshTopics();
      setCurrentTopicId(newTopic.id);
      toast({ title: "Topic created successfully" });
      return newTopic;
    } catch (error) {
      console.error('Failed to create topic:', error);
      toast({ title: "Failed to create topic", variant: "destructive" });
      throw error;
    }
  };

  const handleUpdateTopic = async (id: string, data: any) => {
    try {
      await clientStorage.updateTopic(id, { data });
      await refreshTopics();
      toast({ title: "Entry updated successfully" });
    } catch (error) {
      console.error('Failed to update topic:', error);
      toast({ title: "Failed to update entry", variant: "destructive" });
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (topics.length <= 1) {
      toast({ title: "Cannot delete the last topic", variant: "destructive" });
      return;
    }
    
    try {
      await clientStorage.deleteTopic(topicId);
      
      if (topicId === currentTopicId) {
        // Switch to another topic before deleting
        const remainingTopics = topics.filter(t => t.id !== topicId);
        if (remainingTopics.length > 0) {
          setCurrentTopicId(remainingTopics[0].id);
        }
      }
      
      await refreshTopics();
      toast({ title: "Topic deleted successfully" });
    } catch (error) {
      console.error('Failed to delete topic:', error);
      toast({ title: "Failed to delete topic", variant: "destructive" });
    }
  };

  const handleEntryEdit = (date: string, currentValue: number) => {
    setEditEntry({ date, value: currentValue });
    setShowEditModal(true);
  };

  const handleEntrySave = async (date: string, value: number) => {
    if (!currentTopic) return;

    const currentData = currentTopic.data as Record<string, number> || {};
    const newData = { ...currentData };
    if (value === 0) {
      delete newData[date];
    } else {
      newData[date] = value;
    }

    await handleUpdateTopic(currentTopic.id, newData);
    setShowEditModal(false);
    setEditEntry(null);
  };

  const handleQuickAdd = async (date: string, value: number) => {
    if (!currentTopic) return;

    const currentData = currentTopic.data as Record<string, number> || {};
    const newData = { ...currentData };
    if (value === 0) {
      delete newData[date];
    } else {
      newData[date] = value;
    }

    await handleUpdateTopic(currentTopic.id, newData);
  };

  const handleDownloadJSON = async () => {
    try {
      const exportData = await clientStorage.exportData();
      
      // Generate datetime filename: heatmap-data-DDMMYYHHMM.json
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const datetime = `${day}${month}${year}${hour}${minute}`;
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `heatmap-data-${datetime}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Data exported successfully" });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({ title: "Failed to export data", variant: "destructive" });
    }
  };

  const handleUploadJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/json') {
      toast({ title: "Please select a valid JSON file", variant: "destructive" });
      return;
    }

    try {
      const text = await file.text();
      const importedTopics: Topic[] = JSON.parse(text);
      
      const result = await clientStorage.importData(importedTopics);
      await refreshTopics();
      
      toast({ title: `Successfully imported ${result.topics.length} topics` });
      
      // Set first topic as current if any exist
      if (result.topics.length > 0) {
        setCurrentTopicId(result.topics[0].id);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      toast({ title: "Failed to import data", variant: "destructive" });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = () => {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;

    // @ts-ignore - html2canvas is loaded via CDN
    html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2
    }).then((canvas: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.download = `${currentTopic?.name || 'heatmap'}_heatmap.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Heatmap Tracker</h1>
            <p className="text-muted-foreground text-sm">Track your daily progress across different areas</p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={handleUploadJSON} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import JSON
            </Button>
            <Button onClick={handleDownloadJSON} variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button onClick={handleDownload} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-81px)]">
        {/* Sidebar */}
        <Sidebar
          topics={topics}
          currentTopicId={currentTopicId}
          onTopicSelect={setCurrentTopicId}
          onAddTopic={() => setShowAddModal(true)}
          onDeleteTopic={handleDeleteTopic}
          onQuickAdd={handleQuickAdd}
          currentTopic={currentTopic}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {currentTopic ? (
              <Heatmap
                topic={currentTopic}
                onEntryEdit={handleEntryEdit}
              />
            ) : (
              <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">No topics available</h2>
                <p className="text-muted-foreground mb-4">Import existing data or create your first topic to get started</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleUploadJSON} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Topic
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddTopicModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(topicId) => {
          setCurrentTopicId(topicId);
          setShowAddModal(false);
        }}
        onCreateTopic={handleCreateTopic}
      />

      <EditEntryModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        entry={editEntry}
        onSave={handleEntrySave}
      />
    </div>
  );
}