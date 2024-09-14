import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { retriever } from './utils/retriever.js';
import combineDocs from './utils/combineDocs.js';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import 'dotenv/config';

const openAIApiKey = process.env.OPENAI_API_KEY;
const llm = new ChatOpenAI({ openAIApiKey });

const botController = {};

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
  const standaloneTemplate = `Convert this to a standalone question. 
    User Input: {question}
    Standalone Quetsion:`;

  const standalonePrompt = PromptTemplate.fromTemplate(standaloneTemplate);

  // create answer template
  const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given 
  question about Manulife Health and Dental insurance plan based on the context provided. Try to 
  find the answer in the context. If you really don't know the answer, say 'I'm sorry, I don't 
  know the answer to that.' Do not try to make up an answer. Always speak as if you were chatting 
  to a friend.
  context: {context}
  question: {question}
  answer:
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
    {
      context: retrieverChain,
      question: ({ original_input }) => original_input.question,
    },
    answerChain,
  ]);

  // example input:
  // I am interested in getting a dental plan but was wondering what options I have? I am jobless now and would like to find the cheapest and most valuable deal. And does it cover any prescriptions?

  try {
    const response = await chain.invoke({ question: message });

    console.log('Response: ', response);

    res.locals.response = response;

    return next();
  } catch (error) {
    console.error('Error in standaloneQuestion middleware: ', error);
    return next({
      log: 'Error in standaloneQuestion middleware.',
      status: 500,
      message: { err: 'An error occurred in generating standalone question.' },
    });
  }
};

export default botController;
