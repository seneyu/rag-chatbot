import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';

export async function loadDocuments() {
  try {
    const loader = new DirectoryLoader('../data', {
      '.md': (path) => new TextLoader(path),
    });
    console.log('Starting to load documents...');
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} documents`);
    return docs;
  } catch (error) {
    console.error('Error loading documents: ', error);
    throw error;
  }
}

// try {
//   const load = await loadDocuments();
//   console.log('Documents loaded successfully: ', load);
// } catch (error) {
//   console.error('Failed to load documents: ', error);
// }
