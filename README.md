# microsoft-rag-hack-2024

## California Health Services RAG Chatbot

A chatbot using Retrieval-Augmented Generation (RAG) to provide information about Medi-Cal and Covered California.

## Background

Healthcare in the United States can be expensive and complex to navigate. This Retrieval-Augmented Generation (RAG) chatbot focused on California Health Services is built to assist California residents to understand and query their rights and eligibility for programs like Medi-Cal and Covered California. This AI-powered solution aims to:

1. Provide easy access to accurate information about Medi-Cal and Covered California
2. Offer personalized responses and improve accessibility to healthcare information for all California residents
3. Reduce the burden on government resources by automating common inquiries

## Tech Stack

- Frontend: React
- Backend: Node.js with Express
- RAG Implementation: Langchain
- Database: PostgreSQL

## Installation

1. Clone the repository: `git clone https://github.com/seneyu/microsoft-rag-hack-2024.git`
2. Install dependencies for both client and server directories.
3. Set up environment variables eg. OPENAI_API_KEY in .env file.
4. Navigate to the server directory and start the server with: `npm run start`.

## Future Improvements

- Add reference citations to AI's answers
- Language support
- Expand the knowledge base to cover more specific health programs

## Disclaimer

This chatbot utilizes information from the California Health Care Services (HCS) and Covered California websites. While I strive to provide accurate and up-to-date information, some content may not be current. This chatbot is not an official service of HCS or Covered California and should not be considered a substitute for professional advice or assistance.
