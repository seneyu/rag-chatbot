import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { retriever } from './utils/retriever.js';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import combineDocs from './utils/combineDocs.js';
import formatConvoHistory from './utils/formatConvoHistory.js';
import 'dotenv/config';

const openAIApiKey = process.env.OPENAI_API_KEY;
const llm = new ChatOpenAI({ openAIApiKey });

const botController = {};
const convoHistory = [];

// convert user's message to a standalone question
botController.llmMiddleware = async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return next({
      log: 'Missing message in request body.',
      status: 400,
      message: { err: 'Message is required in the request body.' },
    });
  }

  // create standalone question template
  const standaloneTemplate = `Convert user's input to a standalone question. 
  User the conversation history for context if available.
  Conversation History: {convo_history}
  User Input: {question}
  Standalone Quetsion:`;

  const standalonePrompt = PromptTemplate.fromTemplate(standaloneTemplate);

  // create answer template
  const answerTemplate = `You are a helpful and enthusiastic support bot who can answer questions 
  about Manulife Health and Dental insurance plans. Use the provided context and conversation 
  history to inform your answers. If the answer is in the conversation history, use that information.
  If the answer is not in the context or conversation history, say 'I'm sorry, I don't know the 
  answer to that.' Do not try to make up an answer. Always speak as if you were chatting to a friend.
  Context: {context}
  Conversation History: {convo_history}
  Question: {question}
  Answer:
  `;

  const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

  // standalone question chain
  // pipe the prompt to llm to genearte a string type standalone question
  const standaloneChain = standalonePrompt
    .pipe(llm)
    .pipe(new StringOutputParser());

  // retriever chain
  // pipe the standalone question to retriever, return the nearest chunks from vector store
  // combineDocs to extract pageContent and join docs into string
  const retrieverChain = RunnableSequence.from([
    (prevResult) => prevResult.standalone_question,
    retriever,
    combineDocs,
  ]);

  // answer chain
  // pipe answer prompt to llm and convert answer to string
  const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

  const chain = RunnableSequence.from([
    {
      standalone_question: standaloneChain,
      original_input: new RunnablePassthrough(),
    },
    // (input) => {
    //   console.log('Standalone Question: ', input.standalone_question);
    //   return input;
    // },
    {
      context: retrieverChain,
      question: ({ original_input }) => original_input.question,
      convo_history: ({ original_input }) => original_input.convo_history,
    },
    // (input) => {
    //   console.log('Retrieved Context: ', input.context);
    //   return input;
    // },
    {
      answerChain,
    },
  ]);

  // example input:
  // I am interested in getting a dental plan but was wondering what options I have? I am jobless now and would like to find the cheapest and most valuable deal. And does it cover any prescriptions?

  try {
    const response = await chain.invoke({
      question: message,
      convo_history: formatConvoHistory(convoHistory),
    });

    // console.log('Response: ', response.answerChain);

    // store conversation history for better answers
    convoHistory.push({ role: 'Human', content: message });
    convoHistory.push({ role: 'AI', content: response.answerChain });

    // console.log(
    //   'Formatted Conversation History:',
    //   formatConvoHistory(convoHistory)
    // );
    // console.log('Final Answer: ', response.answerChain);
    // console.log('Conversation History: ', convoHistory);

    res.locals.response = response.answerChain;

    return next();
  } catch (error) {
    console.error('Error in standaloneQuestion middleware: ', error);
    return next({
      log: 'Error in llmMiddleware middleware.',
      status: 500,
      message: { err: 'An error occurred in processing llmMiddleware.' },
    });
  }
};

export default botController;
