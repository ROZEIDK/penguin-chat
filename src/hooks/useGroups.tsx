import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Group {
  id: string;
  name: string;
  created_at: string;
  is_public: boolean;
  password_hash?: string;
  owner_id?: string;
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
  avatar_url?: string;
}

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
    fetchJoinedGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, created_at, is_public, password_hash, owner_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedGroups = async () => {
    try {
      const username = localStorage.getItem('chat-username');
      if (!username) return;

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups!inner(id, name, created_at, is_public, password_hash, owner_id)
        `)
        .eq('username', username)
        .eq('is_active', true);

      if (error) throw error;
      
      const joinedGroupsData = data?.map(item => item.groups).filter(Boolean) || [];
      setJoinedGroups(joinedGroupsData as Group[]);
    } catch (error) {
      console.error('Error fetching joined groups:', error);
    }
  };

  const createGroup = async (name: string, password: string | null, isPublic: boolean = false) => {
    try {
      const username = localStorage.getItem('chat-username');
      if (!username) throw new Error('Username required');

      const groupData: any = { 
        name, 
        is_public: isPublic,
        owner_id: username
      };
      
      if (password && !isPublic) {
        // Simple password hashing (in production, use proper bcrypt)
        groupData.password_hash = btoa(password);
      }
      
      const { data, error } = await supabase
        .from('groups')
        .insert([groupData])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to create group');
      
      // Automatically join the creator to the group
      await supabase
        .from('group_members')
        .insert([{
          group_id: data.id,
          user_id: username,
          username: username
        }]);
      
      await fetchGroups();
      await fetchJoinedGroups();
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const joinGroup = async (groupId: string, password?: string) => {
    try {
      const username = localStorage.getItem('chat-username');
      if (!username) throw new Error('Username required');

      const { data, error } = await supabase
        .from('groups')
        .select('password_hash, is_public')
        .eq('id', groupId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Group not found');
      
      // Public groups don't require password
      if (data.is_public) {
        // Add user to group members
        await supabase
          .from('group_members')
          .upsert([{
            group_id: groupId,
            user_id: username,
            username: username,
            is_active: true
          }], { onConflict: 'group_id,user_id' });
        
        await fetchJoinedGroups();
        return true;
      }
      
      // Private groups require password
      if (!password) {
        throw new Error('Password required for private group');
      }
      
      const passwordHash = btoa(password);
      if (data.password_hash !== passwordHash) {
        throw new Error('Invalid password');
      }
      
      // Add user to group members
      await supabase
        .from('group_members')
        .upsert([{
          group_id: groupId,
          user_id: username,
          username: username,
          is_active: true
        }], { onConflict: 'group_id,user_id' });
      
      await fetchJoinedGroups();
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      const username = localStorage.getItem('chat-username');
      if (!username) throw new Error('Username required');

      await supabase
        .from('group_members')
        .update({ is_active: false })
        .eq('group_id', groupId)
        .eq('user_id', username);
      
      await fetchJoinedGroups();
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  };

  return {
    groups,
    joinedGroups,
    loading,
    createGroup,
    joinGroup,
    leaveGroup,
    refetch: () => {
      fetchGroups();
      fetchJoinedGroups();
    },
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
      // Get user profile for avatar
      const userProfile = localStorage.getItem('user-profile');
      let avatarUrl = null;
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        avatarUrl = profile.avatarUrl;
      }

      const messageData: any = {
        group_id: groupId,
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