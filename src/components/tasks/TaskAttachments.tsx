import { useRef } from 'react';
import { Download, X, FileText, Image, Paperclip, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AttachedFile } from '@/types';

interface TaskAttachmentsProps {
  attachments?: AttachedFile[];
  onAttach: (file: AttachedFile) => void;
  onRemove: (fileId: string) => void;
  compact?: boolean;
}

export function TaskAttachments({
  attachments = [],
  onAttach,
  onRemove,
  compact = false,
}: TaskAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const attachedFile: AttachedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: getFileType(file.type, file.name),
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        uploadedBy: 'Current User',
      };
      onAttach(attachedFile);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (mimeType: string, fileName: string): 'pdf' | 'image' | 'doc' | 'other' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf';
    if (
      mimeType.includes('word') ||
      mimeType.includes('document') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx')
    )
      return 'doc';
    return 'other';
  };

  const getFileIcon = (type: 'pdf' | 'image' | 'doc' | 'other') => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
      case 'doc':
        return <FileText className="h-4 w-4" />;
      default:
        return <Paperclip className="h-4 w-4" />;
    }
  };

  if (attachments.length === 0 && compact) {
    return null;
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {attachments.length > 0 && (
        <div className={cn(
          "grid gap-2",
          compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}>
          {attachments.map((file) => (
            <div
              key={file.id}
              className="group relative flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 text-muted-foreground">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size}</p>
                </div>
                <button
                  onClick={() => onRemove(file.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-muted-foreground hover:text-destructive"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-1">
                <a
                  href={file.url}
                  download={file.name}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {attachments.length === 0 ? 'Add Attachment' : 'Add More'}
      </Button>
    </div>
  );
}
