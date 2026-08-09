import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatbotConversation } from './ChatbotConversation';
export const ChatbotQualif = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <>
      {/* Bubble flottante */}
      {!isOpen && <Button onClick={() => setIsOpen(true)} aria-label="Ouvrir le chatbot" className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform z-50 bg-tech">
          <MessageCircle className="h-8 w-8 text-tech-foreground" />
        </Button>}

      {/* Fenêtre de conversation */}
      {isOpen && <div className="fixed bottom-4 right-4 left-4 md:left-auto md:right-6 md:w-[400px] w-auto h-[85vh] md:h-[600px] max-h-[600px] bg-background rounded-lg shadow-raised flex flex-col z-50 border border-tech-line">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-tech-line bg-tech text-tech-foreground rounded-t-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Assistant IA</h3>
                <p className="text-xs opacity-90">Qualifiez votre besoin en 2 min</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-background/20 text-background">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Contenu */}
          <ChatbotConversation onClose={() => setIsOpen(false)} />
        </div>}
    </>;
};