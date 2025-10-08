// src/pages/AdminMessages.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/AdminSidebar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, MessageCircle, Inbox } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const AdminMessages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== "admin") {
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchConversations();
      
      // Connect to Socket.IO
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('register', 'admin');

      // Listen for new messages
      socketRef.current.on('newMessage', (message: Message) => {
        // Update conversations list
        fetchConversations();
        
        // If viewing this conversation, add message
        if (selectedUser && message.senderId === selectedUser.userId) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/messages/conversations');
      const data = await res.json();
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedUser(conversation);
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${conversation.userId}`);
      const data = await res.json();
      setMessages(data || []);
      
      // Mark as read - wait for it to complete (pass isAdmin=true)
      if (conversation.unreadCount > 0) {
        await fetch(`http://localhost:5000/api/messages/read/${conversation.userId}?isAdmin=true`, {
          method: 'PUT'
        });
        
        // Refresh conversations to update unread count immediately
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'admin',
          receiverId: selectedUser.userId,
          message: newMessage.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();
      setMessages(prev => [...prev, data.data]);
      setNewMessage('');
      scrollToBottom();
      fetchConversations(); // Update last message in list
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
        />
        <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="container mx-auto px-4 py-20">
            <p className="text-center">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
      />
      
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Inbox className="h-8 w-8 text-accent" />
                Message Inbox
              </h1>
              <p className="text-muted-foreground mt-2">Manage customer conversations</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Conversations List */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    {conversations.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No conversations yet</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {conversations.map((conv) => (
                          <button
                            key={conv.userId}
                            onClick={() => selectConversation(conv)}
                            className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                              selectedUser?.userId === conv.userId ? 'bg-muted' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-secondary text-accent-foreground text-xs">
                                    {conv.userName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{conv.userName}</p>
                                  <p className="text-xs text-muted-foreground truncate">{conv.userEmail}</p>
                                </div>
                              </div>
                              {conv.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTime(conv.lastMessageTime)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="md:col-span-2 h-[680px] flex flex-col">
                {selectedUser ? (
                  <>
                    <CardHeader className="border-b">
                      <CardTitle className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary text-accent-foreground">
                            {selectedUser.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-base">{selectedUser.userName}</p>
                          <p className="text-xs text-muted-foreground font-normal">{selectedUser.userEmail}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden">
                      <ScrollArea className="h-full p-4" ref={scrollRef}>
                        <div className="space-y-4">
                          {messages.map((msg) => {
                            const isAdmin = msg.senderId === 'admin';
                            return (
                              <div
                                key={msg._id}
                                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[70%]`}>
                                  <div
                                    className={`rounded-lg px-4 py-2 ${
                                      isAdmin
                                        ? 'bg-secondary text-accent-foreground'
                                        : 'bg-muted text-foreground'
                                    }`}
                                  >
                                    <p className="text-sm">{msg.message}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 px-1">
                                    {formatTime(msg.createdAt)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    
                    <div className="border-t p-4">
                      <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your reply..."
                          disabled={sending}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={sending || !newMessage.trim()} variant="hero">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-8">
                    <div>
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground">Select a conversation</p>
                      <p className="text-sm text-muted-foreground">Choose a user from the list to view messages</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminMessages;