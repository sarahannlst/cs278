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
    <NavLink to="/home" label="Home" />
    <NavLink to="/chat" label="Chat" />
    <NavLink to="/profile" label="Profile" />
  </nav>
);

export default BottomNav;