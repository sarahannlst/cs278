import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import pizzaIcon from '../icons/pizza.png';
import mouthIcon from '../icons/mouth.png';
import chefIcon from '../icons/chef.png';

const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
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
      <Link to="/home" style={{ position: 'relative' }}>
        <img
          src={pizzaIcon}
          alt="Home"
          style={{
            width: 36,
            height: 36,
            filter: location.pathname === '/home' ? 'drop-shadow(2px 2px 2px gray)' : 'none',
          }}
        />
      </Link>

      <Link to="/chat" style={{ position: 'relative' }}>
        <img
          src={mouthIcon}
          alt="Chat"
          style={{
            width: 36,
            height: 36,
          }}
        />
      </Link>

      <Link to="/profile" style={{ position: 'relative' }}>
        <img
          src={chefIcon}
          alt="Profile"
          style={{
            width: 36,
            height: 36,
            filter: location.pathname === '/profile' ? 'drop-shadow(2px 2px 2px gray)' : 'none',
          }}
        />
      </Link>
    </nav>
  );
};

export default BottomNav;
