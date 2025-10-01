import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image';
  image_url?: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}

export const useDirectMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();
    
    const channel = supabase
      .channel(`dm-${conversationId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMessage = payload.new as DirectMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as DirectMessage[]);
    } catch (error) {
      console.error('Error fetching DMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, senderId: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!conversationId) return;
    
    try {
      const messageData: any = {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
      };
      
      if (messageType === 'image' && imageUrl) {
        messageData.image_url = imageUrl;
      }

      const { error } = await supabase
        .from('direct_messages')
        .insert([messageData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending DM:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};

export const useConversations = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    fetchConversations();
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('direct_conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations((data || []) as Conversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUserId: string) => {
    if (!userId) return null;
    
    try {
      const [user1, user2] = [userId, otherUserId].sort();
      
      const { data: existing } = await supabase
        .from('direct_conversations')
        .select('*')
        .eq('user1_id', user1)
        .eq('user2_id', user2)
        .single();

      if (existing) {
        return existing as Conversation;
      }

      const { data, error } = await supabase
        .from('direct_conversations')
        .insert([{ user1_id: user1, user2_id: user2 }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchConversations();
      return data as Conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  return {
    conversations,
    loading,
    createConversation,
    refetch: fetchConversations,
  };
};