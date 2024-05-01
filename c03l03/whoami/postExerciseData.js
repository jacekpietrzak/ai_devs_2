import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

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

const TASKNAME = process.env.TASK_NAME;

const content = `What is the capital of Poland?`;

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);

  console.log(exerciseData.hint);

  fs.writeFileSync(
    'data/hints.md',
    `${JSON.stringify(exerciseData.hint, null, 2)}\n\n`,
    { flag: 'a' }
  );

  const loader = new TextLoader(`data/hints.md`);
  const [doc] = await loader.load();

  // console.log('doc: ', doc.pageContent);
  // // const document = doc.pageContent.split('\n\n').map((content) => {
  //   return new Document({
  //     pageContent: content,
  //   });
  // });

  // const embeddingResponse = await createEmbedding('Hawaiian pizza');

  const chatResponse = await createChatCompletion(
    'gpt-3.5-turbo',
    `Answer questions as truthfully using the context below and nothing more. If you don't know the answer, say "don't know". Return answer for the question in POLISH language, based on provided context. Maximum length for the answer is 200 characters.

    context###
    ${doc.pageContent}
    ###context
    `,
    exerciseData.question
  );

  // const questionResponse = await sendQuestion(content, authToken);

  // await postTaskData(chatResponse, authToken);
}

postExerciseAnswer(TASKNAME);
