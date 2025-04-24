import { Upload } from '@phosphor-icons/react';
import { useState, useRef } from 'react';
import type { MessageAsset } from '~/types/chat';

interface ChatInputProps {
  message: string;
  onChange: (message: string) => void;
  onSubmit: (e: React.FormEvent, assets: string[]) => void;
  isSending?: boolean;
  channelId: string;
  sessionId: string;
}

export function ChatInput({ 
  message, 
  onChange, 
  onSubmit, 
  isSending = false,
  channelId,
  sessionId 
}: ChatInputProps) {
  const [pendingAssets, setPendingAssets] = useState<MessageAsset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    const uploads = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://group-chat.brayden-b8b.workers.dev/channel/upload', {
        method: 'POST',
        headers: {
          'X-Channel-Id': channelId,
          'X-Session-Id': sessionId,
        },
        body: formData
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error('Upload failed');
      }
      
      return {
        url: data.url,
        filename: file.name,
        contentType: file.type,
        size: file.size
      };
    });

    try {
      const assets = await Promise.all(uploads);
      setPendingAssets([...pendingAssets, ...assets]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';  // Reset the file input
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = e.clipboardData.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e, pendingAssets.map(asset => asset.url));
        setPendingAssets([]); // Clear assets after sending
      }} className="p-4 border-t border-neutral-300 dark:border-neutral-800">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 rounded-lg p-2">
          <textarea 
            value={message}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Message #channel-name"
            className="w-full resize-none bg-transparent focus:outline-none"
            rows={3}
            disabled={isSending}
          />

          {pendingAssets.length > 0 && (
            <div className="flex gap-2 mt-2">
              {pendingAssets.map((asset) => (
                <div 
                  key={asset.url} 
                  className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800"
                >
                  <span>{asset.filename}</span>
                  <button
                    onClick={() => setPendingAssets(
                      pendingAssets.filter(a => a.url !== asset.url)
                    )}
                    className="hover:text-neutral-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded"
            >
              <Upload size={16} />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files!)}
            />

            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 