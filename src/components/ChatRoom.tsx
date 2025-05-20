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

  async function checkRoomExists(room: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('room', room)
      .limit(1);

    if (error || !data || data.length === 0) {
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
    <div style={{
      fontFamily: 'Comic Sans MS, sans-serif',
      padding: '1rem',
      background: '#fffbee',
      minHeight: '100vh'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>💬</span>
        <h2 style={{ fontWeight: '700', fontSize: '1.2rem', color: '#5b3926' }}>
          room: {room}
        </h2>
      </div>

      {!roomExists && (
        <p style={{ background: '#d4edda', color: '#155724', padding: '0.5rem 1rem', borderRadius: '12px', marginBottom: '1rem' }}>
          🎉 New room created!
        </p>
      )}

      <div style={{
        overflowY: 'auto',
        padding: '0.5rem',
        background: '#fff6d5',
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.95rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <strong style={{ color: '#5b3926', marginRight: '0.5rem' }}>{msg.user_name}:</strong>
            <span dangerouslySetInnerHTML={{ __html: msg.content }} style={{ flex: 1 }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type your message"
          style={{
            flex: 1,
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            border: '1px solid #ccc',
            outline: 'none',
            fontSize: '1rem'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: '#ffb347',
            border: 'none',
            borderRadius: '999px',
            padding: '0.5rem 1rem',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
