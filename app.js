// Initialize Supabase client properly
const supabase = window.supabase.createClient(
  'https://bvcbuwfhagsewfnpkmtg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Y2J1d2ZoYWdzZXdmbnBrbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU5ODgsImV4cCI6MjA2MTc5MTk4OH0.GEmQ6QjKff1AB57ja4vs1X9V67SKTr5Cc4UkYZt5sgA'
);
const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room') || 'default';
document.getElementById('room-label').textContent = `Room: ${room}`;

// Load existing messages
async function loadMessages() {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('room', room)
    .order('created_at', { ascending: true });
  data.forEach(addMessageToDOM);
}

// Subscribe to new messages
const channel = supabase.channel('public:messages');

channel
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages', filter: `room=eq.${room}`},
    payload => {
      addMessageToDOM(payload.new);
    }
  )
  .subscribe();


// Add message to chat
function addMessageToDOM(msg) {
  const div = document.createElement('div');
  div.textContent = `${msg.user_name}: ${msg.content}`;
  document.getElementById('chat-box').appendChild(div);
}

// Send message
async function sendMessage() {
  const name = document.getElementById('name').value;
  const content = document.getElementById('message').value;
  await supabase.from('messages').insert([{ user_name: name, content, room }]);
  document.getElementById('message').value = ''; // Clear input after sending
}

loadMessages();
