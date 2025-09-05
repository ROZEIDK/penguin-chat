import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DevGroup {
  id: string;
  name: string;
  is_public: boolean;
  password_hash?: string;
  created_at: string;
}

interface DevMessage {
  id: string;
  group_id: string;
  content: string;
  username: string;
  message_type: string;
  created_at: string;
  image_url?: string;
  sticker_name?: string;
}

interface GlobalMessage {
  id: string;
  content: string;
  username: string;
  message_type: string;
  created_at: string;
  image_url?: string;
  sticker_name?: string;
}

export const DevMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState<DevGroup[]>([]);
  const [groupMessages, setGroupMessages] = useState<DevMessage[]>([]);
  const [globalMessages, setGlobalMessages] = useState<GlobalMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'G') {
        event.preventDefault();
        setIsOpen(true);
        if (!isOpen) {
          fetchDevData();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const fetchDevData = async () => {
    setLoading(true);
    try {
      // Fetch all groups
      const { data: groupsData } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all group messages
      const { data: groupMessagesData } = await supabase
        .from('group_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      // Fetch all global messages
      const { data: globalMessagesData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      setGroups(groupsData || []);
      setGroupMessages(groupMessagesData || []);
      setGlobalMessages(globalMessagesData || []);
    } catch (error) {
      console.error('Error fetching dev data:', error);
    } finally {
      setLoading(false);
    }
  };

  const decodePassword = (passwordHash?: string) => {
    if (!passwordHash) return 'No password (Public)';
    try {
      return atob(passwordHash);
    } catch {
      return 'Invalid hash';
    }
  };

  const getGroupMembers = (groupId: string) => {
    const members = groupMessages
      .filter(msg => msg.group_id === groupId)
      .reduce((acc, msg) => {
        if (!acc.find(member => member.username === msg.username)) {
          acc.push({
            username: msg.username,
            messageCount: groupMessages.filter(m => m.group_id === groupId && m.username === msg.username).length,
            lastActive: msg.created_at
          });
        }
        return acc;
      }, [] as { username: string; messageCount: number; lastActive: string }[]);

    return members.sort((a, b) => b.messageCount - a.messageCount);
  };

  const getGlobalUsers = () => {
    const users = globalMessages
      .reduce((acc, msg) => {
        if (!acc.find(user => user.username === msg.username)) {
          acc.push({
            username: msg.username,
            messageCount: globalMessages.filter(m => m.username === msg.username).length,
            lastActive: msg.created_at
          });
        }
        return acc;
      }, [] as { username: string; messageCount: number; lastActive: string }[]);

    return users.sort((a, b) => b.messageCount - a.messageCount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>🔧 Developer Menu</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="group-messages">Group Messages</TabsTrigger>
            <TabsTrigger value="global-messages">Global Messages</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="flex justify-center p-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <Card key={group.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <Badge variant={group.is_public ? "secondary" : "destructive"}>
                            {group.is_public ? "Public" : "Private"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><strong>ID:</strong> {group.id}</div>
                        <div><strong>Password:</strong> {decodePassword(group.password_hash)}</div>
                        <div><strong>Created:</strong> {new Date(group.created_at).toLocaleString()}</div>
                        <div><strong>Members:</strong></div>
                        <div className="ml-4 space-y-1">
                          {getGroupMembers(group.id).map((member) => (
                            <div key={member.username} className="text-sm">
                              {member.username} ({member.messageCount} messages)
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group-messages" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="flex justify-center p-4">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {groupMessages.map((message) => {
                    const group = groups.find(g => g.id === message.group_id);
                    return (
                      <Card key={message.id} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge variant="outline" className="mr-2">
                              {group?.name || 'Unknown Group'}
                            </Badge>
                            <strong>{message.username}</strong>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm">
                          {message.message_type === 'sticker' ? (
                            <span>🏷️ Sticker: {message.sticker_name}</span>
                          ) : message.message_type === 'image' ? (
                            <span>🖼️ Image: {message.image_url}</span>
                          ) : (
                            message.content
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="global-messages" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="flex justify-center p-4">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {globalMessages.map((message) => (
                    <Card key={message.id} className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="secondary" className="mr-2">Global</Badge>
                          <strong>{message.username}</strong>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm">
                        {message.message_type === 'sticker' ? (
                          <span>🏷️ Sticker: {message.sticker_name}</span>
                        ) : message.message_type === 'image' ? (
                          <span>🖼️ Image: {message.image_url}</span>
                        ) : (
                          message.content
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Groups Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>Total Groups: {groups.length}</div>
                    <div>Public Groups: {groups.filter(g => g.is_public).length}</div>
                    <div>Private Groups: {groups.filter(g => !g.is_public).length}</div>
                    <div>Total Group Messages: {groupMessages.length}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Global Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>Total Messages: {globalMessages.length}</div>
                    <div>Unique Users: {getGlobalUsers().length}</div>
                    <div>Most Active User: {getGlobalUsers()[0]?.username || 'None'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Global Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getGlobalUsers().slice(0, 10).map((user, index) => (
                      <div key={user.username} className="flex justify-between">
                        <span>#{index + 1} {user.username}</span>
                        <span>{user.messageCount} messages</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};