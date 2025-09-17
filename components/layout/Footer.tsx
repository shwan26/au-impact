import React from 'react';

const teamMembers = [
  "Lucas",
  "Tulip",
  "Shwan"
];

const Footer: React.FC = () => (
  <footer style={{
    padding: '1rem',
    background: '#f0f0f0',
    textAlign: 'center',
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
  }}>
    <div>
      Team Members: {teamMembers.join(', ')}
    </div>
  </footer>
);

export default Footer;