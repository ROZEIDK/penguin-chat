import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_username: string;
  content: string;
  message_type: 'text' | 'image';
  image_url?: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  user1_username: string;
  user2_username: string;
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

  const sendMessage = async (content: string, senderUsername: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!conversationId) return;
    
    try {
      const messageData: any = {
        conversation_id: conversationId,
        sender_username: senderUsername,
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

export interface ConversationWithUnread extends Conversation {
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

export const useConversations = (username: string | null) => {
  const [conversations, setConversations] = useState<ConversationWithUnread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setConversations([]);
      setLoading(false);
      return;
    }

    fetchConversations();

    // Listen for new messages in all conversations
    const channel = supabase
      .channel('all-dms')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        () => {
          fetchConversations(); // Refresh conversations when any new message arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const fetchConversations = async () => {
    if (!username) return;
    
    try {
      const { data: convData, error } = await supabase
        .from('direct_conversations')
        .select('*')
        .or(`user1_username.eq.${username},user2_username.eq.${username}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get unread counts and last messages for each conversation
      const conversationsWithUnread = await Promise.all(
        (convData || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('direct_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { count } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_username', username);

          const lastMessage = messages?.[0];

          return {
            ...conv,
            unreadCount: count || 0,
            lastMessage: lastMessage?.content,
            lastMessageAt: lastMessage?.created_at,
          } as ConversationWithUnread;
        })
      );

      setConversations(conversationsWithUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUsername: string) => {
    if (!username) return null;
    
    try {
      const [user1, user2] = [username, otherUsername].sort();
      
      const { data: existing } = await supabase
        .from('direct_conversations')
        .select('*')
        .eq('user1_username', user1)
        .eq('user2_username', user2)
        .maybeSingle();

      if (existing) {
        return existing as Conversation;
      }

      const { data, error } = await supabase
        .from('direct_conversations')
        .insert([{ user1_username: user1, user2_username: user2 }])
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