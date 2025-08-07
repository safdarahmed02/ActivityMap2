import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (topicId: string) => void;
}

export function AddTopicModal({ isOpen, onClose, onSuccess }: AddTopicModalProps) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const { toast } = useToast();

  const createTopicMutation = useMutation({
    mutationFn: async (data: { name: string; unit: string }) => {
      const response = await apiRequest("POST", "/api/topics", {
        name: data.name,
        unit: data.unit,
        data: {}
      });
      return response.json();
    },
    onSuccess: (topic) => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({ title: "Topic created successfully" });
      onSuccess(topic.id);
      setName("");
      setUnit("");
    },
    onError: () => {
      toast({ title: "Failed to create topic", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && unit.trim()) {
      createTopicMutation.mutate({ name: name.trim(), unit: unit.trim() });
    }
  };

  const handleClose = () => {
    setName("");
    setUnit("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="topicName" className="text-foreground">Topic Name</Label>
            <Input
              id="topicName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Meditation, Writing"
              className="bg-input border-border text-foreground"
              required
            />
          </div>
          <div>
            <Label htmlFor="unit" className="text-foreground">Unit of Measurement</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., hours, minutes, pages, reps"
              className="bg-input border-border text-foreground"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={createTopicMutation.isPending || !name.trim() || !unit.trim()}
            >
              {createTopicMutation.isPending ? "Creating..." : "Create Topic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: { date: string; value: number } | null;
  onSave: (date: string, value: number) => void;
}

export function EditEntryModal({ isOpen, onClose, entry, onSave }: EditEntryModalProps) {
  const [value, setValue] = useState("");

  // Update value when entry changes
  useEffect(() => {
    if (entry) {
      setValue(entry.value.toString());
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entry) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onSave(entry.date, numValue);
      }
    }
  };

  const handleClose = () => {
    setValue("");
    onClose();
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="entryDate" className="text-foreground">Date</Label>
            <Input
              id="entryDate"
              type="date"
              value={entry.date}
              readOnly
              className="bg-muted border-border text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="entryValue" className="text-foreground">Value</Label>
            <Input
              id="entryValue"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="bg-input border-border text-foreground"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!value || isNaN(parseFloat(value))}
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
