import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { loadDocuments } from './loadDocuments.js';
import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import 'dotenv/config';

async function createAndStoreEmbeddings() {
  try {
    // load documents
    const docs = await loadDocuments();
    console.log(`Loaded ${docs.length} documents`);

    // initialize text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    // split documents
    const splitDocs = await textSplitter.splitDocuments(docs);
    // console.log(`Split into ${splitDocs.length} chunks`);
    // console.log(splitDocs);

    const supabaseApiKey = process.env.SUPABASE_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    const client = createClient(supabaseUrl, supabaseApiKey);

    const embeddings = new OpenAIEmbeddings({ openAIApiKey });

    await SupabaseVectorStore.fromDocuments(splitDocs, embeddings, {
      client,
      tableName: 'documents',
    });

    console.log('Embeddings created and stored successfully');
  } catch (error) {
    console.error('Error in splitting text: ', error);
  }
}

createAndStoreEmbeddings();
