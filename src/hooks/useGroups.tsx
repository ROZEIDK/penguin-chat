import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Group {
  id: string;
  name: string;
  created_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  content: string;
  username: string;
  created_at: string;
  message_type?: 'text' | 'image' | 'sticker';
  image_url?: string;
  sticker_name?: string;
}

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, password: string) => {
    try {
      // Simple password hashing (in production, use proper bcrypt)
      const passwordHash = btoa(password);
      
      const { data, error } = await supabase
        .from('groups')
        .insert([{ name, password_hash: passwordHash }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to create group');
      
      await fetchGroups();
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const joinGroup = async (groupId: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('password_hash')
        .eq('id', groupId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Group not found');
      
      const passwordHash = btoa(password);
      if (data.password_hash !== passwordHash) {
        throw new Error('Invalid password');
      }
      
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  };

  return {
    groups,
    loading,
    createGroup,
    joinGroup,
    refetch: fetchGroups,
  };
};

export const useGroupMessages = (groupId: string | null) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('group_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        (payload) => {
          const newMessage = payload.new as GroupMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const fetchMessages = async () => {
    if (!groupId) return;
    
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as GroupMessage[]);
    } catch (error) {
      console.error('Error fetching group messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, username: string, messageType: 'text' | 'image' | 'sticker' = 'text', imageUrl?: string, stickerName?: string) => {
    if (!groupId) return;
    
    try {
      const messageData: any = {
        group_id: groupId,
        content,
        username,
        message_type: messageType,
      };
      
      if (messageType === 'image' && imageUrl) {
        messageData.image_url = imageUrl;
      }
      
      if (messageType === 'sticker' && stickerName) {
        messageData.sticker_name = stickerName;
      }

      const { error } = await supabase
        .from('group_messages')
        .insert([messageData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};