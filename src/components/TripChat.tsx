import { useEffect, useState, useRef, FormEvent } from 'react';
import { useStore } from '../lib/store';
import { mockSupabase, Message } from '../lib/mock-supabase';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface TripChatProps {
  tripId: string;
}

export default function TripChat({ tripId }: TripChatProps) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const setMessages = useStore((state) => state.setMessages);
  const addMessage = useStore((state) => state.addMessage);

  useEffect(() => {
    loadMessages();
  }, [tripId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const tripMessages = await mockSupabase.getMessages(tripId);
      setMessages(tripMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    setSending(true);
    const text = messageText;
    setMessageText('');

    try {
      const message = await mockSupabase.sendMessage({
        trip_id: tripId,
        user_id: user.id,
        content: text,
        message_type: 'text',
      });

      addMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(text); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: '600px' }}>
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Trip Chat</h3>
        <p className="text-sm text-gray-600">Discuss plans with your travel companions</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.user_id === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {!isOwnMessage && (
                    <div className="flex items-center mb-1">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user_id}`}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-xs font-medium text-gray-600">
                        {message.user_id === user?.id ? 'You' : 'Travel Companion'}
                      </span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {format(new Date(message.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
