import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatbotConversation } from './ChatbotConversation';

export const ChatbotQualif = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bubble flottante */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform z-50 bg-primary hover:bg-primary/90"
          aria-label="Ouvrir le chatbot"
        >
          <MessageCircle className="h-8 w-8 text-background" />
        </Button>
      )}

      {/* Fenêtre de conversation */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-background rounded-lg shadow-2xl flex flex-col z-50 border border-secondary/20">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-background rounded-t-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Assistant IA</h3>
                <p className="text-xs opacity-90">Qualifiez votre besoin en 2 min</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-background/20 text-background"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Contenu */}
          <ChatbotConversation onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};
