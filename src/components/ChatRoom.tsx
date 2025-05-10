import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface ChatRoomProps {
  userName: string;
  room: string;
}

interface Message {
  id?: number;
  user_name: string;
  content: string;
  room: string;
  created_at?: string;
}

function ChatRoom({ userName, room }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [channel, setChannel] = useState<any>(null);
  const [roomExists, setRoomExists] = useState<boolean>(true);

  useEffect(() => {
    // Check if the room exists, and create if not
    checkRoomExists(room);

    loadMessages();

    const ch = supabase
      .channel(`room-${room}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room=eq.${room}`,
        },
        (payload: { new: Message }) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    setChannel(ch);

    return () => {
      supabase.removeChannel(ch);
    };
  }, [room]);

  // Function to check if the room exists by checking messages in that room
  async function checkRoomExists(room: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('room', room)
      .limit(1);

    if (error || !data || data.length === 0) {
      // Room does not exist, insert a placeholder message to create the room
      const { error: insertError } = await supabase.from('messages').insert([
        {
          user_name: 'System',
          content: `Room "${room}" created!`,
          room,
        },
      ]);

      if (insertError) {
        console.error(insertError.message);
      } else {
        setRoomExists(false);
        console.log(`New room "${room}" created`);
      }
    } else {
      setRoomExists(true);
    }
  }

  // Function to load messages for the room
  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('room', room)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data as Message[]);
    }
  }

  // Function to send a new message to the room
  async function sendMessage() {
    if (newMsg.trim()) {
      await supabase.from('messages').insert([
        {
          user_name: userName,
          content: newMsg,
          room,
        },
      ]);
      setNewMsg('');
    }
  }

  return (
    <div>
      <h2>Room: {room}</h2>
      {!roomExists && <p style={{ color: 'green' }}>New room created!</p>}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.user_name}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMsg}
        onChange={e => setNewMsg(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatRoom;
