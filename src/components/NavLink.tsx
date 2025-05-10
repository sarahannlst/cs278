import React from 'react';
import { Link } from 'react-router-dom';

const NavLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link
    to={to}
    style={{
      textDecoration: 'none',
      color: '#333',
      fontWeight: 'bold',
    }}
  >
    {label}
  </Link>
);

export default NavLink;