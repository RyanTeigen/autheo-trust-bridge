
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip } from 'lucide-react';

interface MessageComposerProps {
  newMessage: string;
  attachments: File[];
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onAttachmentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  newMessage,
  attachments,
  onMessageChange,
  onSendMessage,
  onAttachmentUpload,
  onRemoveAttachment
}) => {
  return (
    <div className="p-3 border-t border-slate-700">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex items-center gap-1 bg-slate-900/50 text-slate-300 border-slate-700"
            >
              <Paperclip className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                onClick={() => onRemoveAttachment(index)}
                className="ml-1 text-slate-400 hover:text-slate-300"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full flex-shrink-0 border-slate-700"
          type="button"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Paperclip className="h-4 w-4 text-slate-300" />
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={onAttachmentUpload}
            multiple
          />
        </Button>
        
        <Textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          className="min-h-10 bg-slate-900/50 border-slate-700 text-slate-100 flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
        />
        
        <Button
          className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900 flex-shrink-0"
          onClick={onSendMessage}
          disabled={newMessage.trim() === '' && attachments.length === 0}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageComposer;
