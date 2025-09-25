import React from 'react';

const teamMembers = [
  "Lucas",
  "Tulip",
  "Shwan"
];

const Footer: React.FC = () => (
  <footer
    style={{
      padding: '1rem',
      background: '#b40000',
      color: 'white',
      textAlign: 'center',
      marginTop: '2rem',
      width: '100vw',        // full viewport width
      marginLeft: 'calc(-50vw + 50%)', // center align if parent has max-width
    }}
  >
    <div>
      Developed by {teamMembers.join(', ')}
    </div>
  </footer>

);

export default Footer;
