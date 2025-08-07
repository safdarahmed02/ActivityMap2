import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Topic } from "@shared/schema";

interface SidebarProps {
  topics: Topic[];
  currentTopicId: string;
  onTopicSelect: (topicId: string) => void;
  onAddTopic: () => void;
  onQuickAdd: (date: string, value: number) => void;
  currentTopic?: Topic;
}

export default function Sidebar({
  topics,
  currentTopicId,
  onTopicSelect,
  onAddTopic,
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
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
          <Button
            onClick={onAddTopic}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2"
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
                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 border border-emerald-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onClick={() => onTopicSelect(topic.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{topic.name}</h3>
                    <p className="text-sm text-gray-600">{topic.unit}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-emerald-700' : 'text-gray-700'
                    }`}>
                      {weekTotal}{topic.unit.charAt(0)}
                    </div>
                    <div className="text-xs text-gray-500">this week</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {currentTopic && (
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Add</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="quickValue" className="text-sm font-medium text-gray-700">
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
              />
            </div>
            <div>
              <Label htmlFor="quickDate" className="text-sm font-medium text-gray-700">
                Date
              </Label>
              <Input
                id="quickDate"
                type="date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleQuickSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
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
