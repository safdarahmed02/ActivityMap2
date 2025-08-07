import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, Plus, Upload, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Topic } from "@shared/schema";
import Heatmap from "@/components/heatmap";
import Sidebar from "@/components/sidebar";
import { AddTopicModal, EditEntryModal } from "@/components/modals";

export default function Home() {
  const [currentTopicId, setCurrentTopicId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEntry, setEditEntry] = useState<{ date: string; value: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch all topics
  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  // Set default topic when topics load
  useEffect(() => {
    if (topics.length > 0 && !currentTopicId) {
      setCurrentTopicId(topics[0].id);
    }
  }, [topics, currentTopicId]);

  // Update topic mutation
  const updateTopicMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/topics/${id}`, { data });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({ title: "Entry updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update entry", variant: "destructive" });
    },
  });

  // Delete topic mutation
  const deleteTopicMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({ title: "Topic deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete topic", variant: "destructive" });
    },
  });

  // Import data mutation
  const importDataMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Import failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({ title: `Successfully imported ${data.topics.length} topics` });
      // Set first topic as current if any exist
      if (data.topics.length > 0) {
        setCurrentTopicId(data.topics[0].id);
      }
    },
    onError: () => {
      toast({ title: "Failed to import data", variant: "destructive" });
    },
  });

  const currentTopic = topics.find(t => t.id === currentTopicId);

  const handleEntryEdit = (date: string, currentValue: number) => {
    setEditEntry({ date, value: currentValue });
    setShowEditModal(true);
  };

  const handleEntrySave = (date: string, value: number) => {
    if (!currentTopic) return;

    const currentData = currentTopic.data as Record<string, number> || {};
    const newData = { ...currentData };
    if (value === 0) {
      delete newData[date];
    } else {
      newData[date] = value;
    }

    updateTopicMutation.mutate({ id: currentTopic.id, data: newData });
    setShowEditModal(false);
    setEditEntry(null);
  };

  const handleQuickAdd = (date: string, value: number) => {
    if (!currentTopic) return;

    const currentData = currentTopic.data as Record<string, number> || {};
    const newData = { ...currentData };
    if (value === 0) {
      delete newData[date];
    } else {
      newData[date] = value;
    }

    updateTopicMutation.mutate({ id: currentTopic.id, data: newData });
  };

  const handleDeleteTopic = (topicId: string) => {
    if (topics.length <= 1) {
      toast({ title: "Cannot delete the last topic", variant: "destructive" });
      return;
    }
    
    if (topicId === currentTopicId) {
      // Switch to another topic before deleting
      const remainingTopic = topics.find(t => t.id !== topicId);
      if (remainingTopic) {
        setCurrentTopicId(remainingTopic.id);
      }
    }
    
    deleteTopicMutation.mutate(topicId);
  };

  const handleDownloadJSON = async () => {
    try {
      const response = await fetch('/api/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'heatmap-data.json';
      link.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Data exported successfully" });
    } catch (error) {
      toast({ title: "Failed to export data", variant: "destructive" });
    }
  };

  const handleUploadJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      importDataMutation.mutate(file);
    } else {
      toast({ title: "Please select a valid JSON file", variant: "destructive" });
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
