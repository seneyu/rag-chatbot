const ChatMessage = ({ message }) => {
  return (
    <div
      className={`message-container ${
        message.isUser ? 'user-container' : 'bot-container'
      }`}>
      <div className={`message ${message.isUser ? 'user' : 'bot'}`}>
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;
