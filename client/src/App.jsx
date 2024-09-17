import { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import Welcome from './components/Welcome';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatMessagesRef = useRef(null);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText, isButtonPayload = false) => {
    const userMessage = { text: messageText, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: isButtonPayload ? messageText : messageText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('data: ', data);

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data, isUser: false },
      ]);
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const handleSend = async () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleButtonClick = async (button) => {
    sendMessage(button.title, true);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatMessagesRef}>
        <Welcome onButtonClick={handleButtonClick} />
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
