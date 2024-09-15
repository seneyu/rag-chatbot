const formatConvoHistory = (messages) => {
  return messages
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');
};

export default formatConvoHistory;
