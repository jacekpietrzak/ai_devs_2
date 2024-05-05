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

const TASKNAME = process.env.TASK_NAME;
const COLLECTION_NAME = 'aidevs_c03l05_people';

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

    const fileName = exerciseData.data.split('/').pop();

    await downloadAxios(exerciseData.data, `data/${fileName}`, 0);

    const loader = new TextLoader(`data/${fileName}`);
    let [memory] = await loader.load();

    // return console.log('memory: ', memory);

    let documents = JSON.parse(memory.pageContent).map(
      (document) =>
        new Document({
          pageContent: JSON.stringify(document),
          metadata: {
            imie: document.imie,
            nazwisko: document.nazwisko,
            wiek: document.wiek,
            o_mnie: document.o_mnie,
            ulubiona_postac_z_kapitana_bomby:
              document.ulubiona_postac_z_kapitana_bomby,
            ulubiony_serial: document.ulubiony_serial,
            ulubiony_film: document.ulubiony_film,
            ulubiony_kolor: document.ulubiony_kolor,
          },
        })
    );

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

  // Search;
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

  console.log('search: ', search[0].payload.content);
  console.log('question: ', exerciseData.question);

  const context = search[0].payload.content;
  const model = 'gpt-3.5-turbo';
  const systemMessage = `Answer questions as truthfully using the context below and nothing more. If you don't know the answer, say "don't know". Return answer for the question in POLISH language, based on provided context.
  context ###  
  ${context}
  context ###`;
  const humanMessage = exerciseData.question;
  const chatResponse = await createChatCompletion(
    model,
    systemMessage,
    humanMessage
  );

  // console.log('chatResponse: ', chatResponse);

  await postTaskData(chatResponse, authToken);
}

postExerciseAnswer(TASKNAME);
