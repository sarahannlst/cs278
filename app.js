// Initialize Supabase
const supabase = window.supabase.createClient(
  'https://bvcbuwfhagsewfnpkmtg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Y2J1d2ZoYWdzZXdmbnBrbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU5ODgsImV4cCI6MjA2MTc5MTk4OH0.GEmQ6QjKff1AB57ja4vs1X9V67SKTr5Cc4UkYZt5sgA'
);

let currentRoom = new URLSearchParams(window.location.search).get('room') || 'default';
let userName = '';
let channel = null;

document.getElementById('room-label').textContent = `Room: ${currentRoom}`;

// Switch between sections
function switchTab(tabId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');
}

// Join chat
function joinChat() {
  const nameInput = document.getElementById('name');
  const name = nameInput.value.trim();
  if (!name) return alert('Please enter your name');

  userName = name;
  document.getElementById('room-label').textContent = `Room: ${currentRoom}`;

  switchTab('chat');
  loadMessages();
  subscribeToRoom();
}

// Load messages for the room
async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room', currentRoom)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading messages:', error);
    return;
  }

  document.getElementById('chat-box').innerHTML = '';
  data.forEach(addMessageToDOM);
}

// Subscribe to messages in currentRoom
function subscribeToRoom() {
  if (channel) {
    supabase.removeChannel(channel);
  }

  channel = supabase
    .channel(`room-${currentRoom}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room=eq.${currentRoom}`
      },
      payload => {
        addMessageToDOM(payload.new);
      }
    )
    .subscribe();
}

// Add message to DOM
function addMessageToDOM(msg) {
  const div = document.createElement('div');
  div.textContent = `${msg.user_name}: ${msg.content}`;
  document.getElementById('chat-box').appendChild(div);
}

// Send a new message
async function sendMessage() {
  const content = document.getElementById('message').value.trim();
  if (!content) return;

  const { error } = await supabase.from('messages').insert([
    { user_name: userName, content, room: currentRoom }
  ]);

  if (error) {
    console.error('Send error:', error);
  }

  document.getElementById('message').value = '';
}
