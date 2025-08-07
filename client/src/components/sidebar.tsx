import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Topic } from "@shared/schema";

interface SidebarProps {
  topics: Topic[];
  currentTopicId: string;
  onTopicSelect: (topicId: string) => void;
  onAddTopic: () => void;
  onDeleteTopic: (topicId: string) => void;
  onQuickAdd: (date: string, value: number) => void;
  currentTopic?: Topic;
}

export default function Sidebar({
  topics,
  currentTopicId,
  onTopicSelect,
  onAddTopic,
  onDeleteTopic,
  onQuickAdd,
  currentTopic
}: SidebarProps) {
  const [quickValue, setQuickValue] = useState("");
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);

  const getWeekTotal = (topic: Topic): number => {
    const data = topic.data as Record<string, number>;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return Object.entries(data)
      .filter(([date]) => new Date(date) >= weekAgo)
      .reduce((sum, [, val]) => sum + val, 0);
  };

  const handleQuickSubmit = () => {
    const value = parseFloat(quickValue);
    if (!isNaN(value) && value >= 0 && quickDate) {
      onQuickAdd(quickDate, value);
      setQuickValue("");
    }
  };

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Topics</h2>
          <Button
            onClick={onAddTopic}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {topics.map((topic) => {
            const weekTotal = getWeekTotal(topic);
            const isActive = topic.id === currentTopicId;
            
            return (
              <div
                key={topic.id}
                className={`p-3 rounded-lg hover:bg-accent transition-colors ${
                  isActive 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-muted border border-border'
                } group`}
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => onTopicSelect(topic.id)}
                  >
                    <h3 className="font-medium text-foreground">{topic.name}</h3>
                    <p className="text-sm text-muted-foreground">{topic.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-primary' : 'text-foreground'
                      }`}>
                        {weekTotal}{topic.unit.charAt(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">this week</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteTopic(topic.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {currentTopic && (
        <div className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Add</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="quickValue" className="text-sm font-medium text-foreground">
                Value ({currentTopic.unit})
              </Label>
              <Input
                id="quickValue"
                type="number"
                value={quickValue}
                onChange={(e) => setQuickValue(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="quickDate" className="text-sm font-medium text-foreground">
                Date
              </Label>
              <Input
                id="quickDate"
                type="date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <Button
              onClick={handleQuickSubmit}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!quickValue || isNaN(parseFloat(quickValue))}
            >
              Add Entry
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
