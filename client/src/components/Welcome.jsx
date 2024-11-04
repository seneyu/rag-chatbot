import React from 'react';

const Welcome = ({ onButtonClick }) => {
  const welcomeButtons = [
    { title: 'Am I eligible for Medi-Cal?' },
    { title: 'How to renew my Medi-Cal?' },
    {
      title: 'What are the different options for Covered California?',
    },
  ];

  return (
    <div className="welcome-container">
      <h2>Welcome! How can I help you today?</h2>
      <div className="welcome-buttons">
        {welcomeButtons.map((button, index) => (
          <button key={index} onClick={() => onButtonClick(button)}>
            {button.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Welcome;
