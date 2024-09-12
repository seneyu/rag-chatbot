const ChatMessage = ({ message }) => {
  return (
    <div className={`message ${message.isUser ? 'user' : 'bot'}`}>
      {message.text}
    </div>
  );
};

export default ChatMessage;
