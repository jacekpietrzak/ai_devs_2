import dotenv from 'dotenv';
// dotenv.config({ path: '../.env' });
dotenv.config();

import * as fs from 'fs';

import {
  authorize,
  getTaskData,
  postTaskData,
  sendQuestion,
} from './api/aidevsApi.js';

import { downloadAxios } from './api/download.js';

import {
  createChatCompletion,
  createModeration,
  createEmbedding,
} from './api/openaiApiLangchain.js';

import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from '@qdrant/js-client-rest';
import { sleep } from './helpers/sleep.js';

const TASKNAME = process.env.TASK_NAME;
const MEMORY_PATH = './data/archiwum_aidevs.json';
const COLLECTION_NAME = 'aidevs_c03l04_search';

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const embeddings = new OpenAIEmbeddings({
  maxConcurrency: 5,
  apiKey: process.env.OPENAI_API_KEY,
});

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);
  const query = exerciseData.question;

  console.log('query: ', query);

  const queryEmbedding = await embeddings.embedQuery(query);
  const result = await qdrant.getCollections();
  const indexed = result.collections.find(
    (collection) => collection.name === COLLECTION_NAME
  );
  console.log('collections result: ', result);

  // Create collection if not exists
  if (!indexed) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: { size: 1536, distance: 'Cosine', on_disk: true },
    });
  }
  const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);

  // Index documents if not indexed
  if (!collectionInfo.points_count) {
    // Read File

    const fileName = exerciseData.msg.split('/').pop();

    await downloadAxios(
      'https://unknow.news/archiwum_aidevs.json',
      `data/${fileName}`,
      0
    );

    const loader = new TextLoader(`data/${fileName}`);
    // const [memory] = await loader.load();

    // const loader = new TextLoader(MEMORY_PATH);
    let [memory] = await loader.load();

    let documents = JSON.parse(memory.pageContent).map(
      (document) =>
        new Document({
          pageContent: document.info,
          metadata: {
            url: document.url,
            title: document.title,
            date: document.date,
          },
        })
    );

    // return console.log('documents: ', documents);

    // let documents = memory.pageContent
    //   .split('},')
    //   .map((content) => new Document({ pageContent: content }));

    // return console.log('documents: ', documents);

    // Add metadata
    documents = documents.map((document) => {
      document.metadata.source = COLLECTION_NAME;
      document.metadata.content = document.pageContent;
      document.metadata.uuid = uuidv4();
      return document;
    });

    // Generate embeddings
    const points = [];
    for (const document of documents) {
      const [embedding] = await embeddings.embedDocuments([
        document.pageContent,
      ]);
      points.push({
        id: document.metadata.uuid,
        payload: document.metadata,
        vector: embedding,
      });
    }

    // Index
    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      batch: {
        ids: points.map((point) => point.id),
        vectors: points.map((point) => point.vector),
        payloads: points.map((point) => point.payload),
      },
    });
  }

  // Search
  const search = await qdrant.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: 1,
    filter: {
      must: [
        {
          key: 'source',
          match: {
            value: COLLECTION_NAME,
          },
        },
      ],
    },
  });

  console.log('search: ', search[0].payload.url);

  await postTaskData(search[0].payload.url, authToken);
}

postExerciseAnswer(TASKNAME);
