import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  content: string;
  username: string;
  created_at: string;
  message_type?: 'text' | 'image' | 'sticker';
  image_url?: string;
  sticker_name?: string;
  avatar_url?: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, username: string, messageType: 'text' | 'image' | 'sticker' = 'text', imageUrl?: string, stickerName?: string) => {
    try {
      // Get user profile for avatar
      const userProfile = localStorage.getItem('user-profile');
      let avatarUrl = null;
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        avatarUrl = profile.avatarUrl;
      }

      const messageData: any = {
        content,
        username,
        message_type: messageType,
        avatar_url: avatarUrl,
      };
      
      if (messageType === 'image' && imageUrl) {
        messageData.image_url = imageUrl;
      }
      
      if (messageType === 'sticker' && stickerName) {
        messageData.sticker_name = stickerName;
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};