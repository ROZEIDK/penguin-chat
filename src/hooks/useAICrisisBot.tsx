import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CHECK_IN_MESSAGE } from './useActivityTracker';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const getInitialMessages = (): AIChatMessage[] => {
  const shouldShowCheckIn = localStorage.getItem('showCheckInMessage');
  
  if (shouldShowCheckIn === 'true') {
    localStorage.removeItem('showCheckInMessage');
    return [
      {
        id: 'checkin',
        role: 'assistant',
        content: CHECK_IN_MESSAGE,
        created_at: new Date().toISOString(),
      }
    ];
  }
  
  return [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi, I'm here to support you. If you're going through a difficult time, you can talk to me. I'm here to listen without judgment. How are you feeling right now?",
      created_at: new Date().toISOString(),
    }
  ];
};

export const useAICrisisBot = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>(getInitialMessages);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string, senderUsername: string) => {
    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Convert messages to the format expected by the AI
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke('crisis-bot', {
        body: { messages: conversationHistory },
      });

      if (error) throw error;

      const botMessage: AIChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error communicating with crisis bot:', error);
      
      // Fallback message
      const errorMessage: AIChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. If you're in crisis, please reach out to:\n\n🆘 988 Suicide & Crisis Lifeline (call or text 988)\n🚨 Emergency Services (911)\n\nYou're not alone, and help is available.",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};
