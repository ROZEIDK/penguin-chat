import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all profiles
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username');

      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };

    fetchProfiles();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProfiles(prev => [...prev, payload.new as Profile]);
          } else if (payload.eventType === 'UPDATE') {
            setProfiles(prev => 
              prev.map(profile => 
                profile.id === payload.new.id ? payload.new as Profile : profile
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setProfiles(prev => 
              prev.filter(profile => profile.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-chat-online';
      case 'idle':
        return 'bg-chat-idle';
      case 'dnd':
        return 'bg-chat-dnd';
      default:
        return 'bg-muted-foreground';
    }
  };

  return {
    profiles,
    loading,
    getStatusColor,
  };
};