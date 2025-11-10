import { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ChecklistItem } from '@/types';

interface TaskChecklistsProps {
  checklistItems?: ChecklistItem[];
  onToggle: (itemId: string) => void;
  onAdd: (label: string) => void;
  onDelete: (itemId: string) => void;
}

export function TaskChecklists({
  checklistItems = [],
  onToggle,
  onAdd,
  onDelete,
}: TaskChecklistsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    onAdd(newLabel.trim());
    setNewLabel('');
    setIsAdding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setNewLabel('');
      setIsAdding(false);
    }
  };

  if (checklistItems.length === 0 && !isAdding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAdding(true)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <PlusCircle className="h-4 w-4" />
        Add Checklist Item
      </Button>
    );
  }

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Checklist Progress</span>
            <span>
              {completedCount}/{totalCount} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="space-y-2">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className="group flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => onToggle(item.id)}
              className="mt-0.5"
            />
            <span
              className={`flex-1 text-sm ${
                item.completed
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              }`}
            >
              {item.label}
            </span>
            <button
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              title="Delete checklist item"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex items-center gap-2">
          <Checkbox disabled className="opacity-50" />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter checklist item..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleAdd}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewLabel('');
                setIsAdding(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <PlusCircle className="h-4 w-4" />
          Add Item
        </Button>
      )}
    </div>
  );
}
