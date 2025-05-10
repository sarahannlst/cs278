import React from 'react';
import NavLink from './NavLink';

const BottomNav: React.FC = () => (
  <nav
    style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-around',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #ccc',
      padding: '10px 0',
    }}
  >
    <NavLink to="/cs278/home" label="Home" />
    <NavLink to="/cs278/chat" label="Chat" />
    <NavLink to="/cs278/profile" label="Profile" />
  </nav>
);

export default BottomNav;