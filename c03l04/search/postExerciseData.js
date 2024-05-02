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
import { sleep } from './helpers/sleep.js';

const TASKNAME = process.env.TASK_NAME;

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);

  const fileName = exerciseData.msg.split('/').pop();

  console.log(fileName);

  const downloadResponse = await downloadAxios(
    'https://unknow.news/archiwum_aidevs.json',
    `data/${fileName}`,
    0
  );

  const loader = new TextLoader(`data/${fileName}`);
  const [doc] = await loader.load();

  console.log('doc: ', doc.pageContent);
  const document = doc.pageContent.split('\n\n').map((content) => {
    return new Document({
      pageContent: content,
    });
  });

  // const embeddingResponse = await createEmbedding('Hawaiian pizza');

  // const chatResponse = await createChatCompletion(
  //   'gpt-4',
  //   `Give me some hints about a person and I will answer who it is but only if I am 100% sure that the answer is correct. Answer questions as truthfully using the context below and nothing more. If you don't know the answer, say "0". Return answer for the question based on provided context.

  // //   context###
  // //   ${doc.pageContent}
  // //   ###context
  // //   `
  //   // exerciseData.question
  // );

  // console.log('chatResponse: ', chatResponse);

  // if (chatResponse === '0') {
  //   for (let i = 0; i < 6; i++) {
  //     sleep(3000);
  //     const exerciseData = await getTaskData(authToken);
  //     fs.writeFileSync(
  //       'data/hints.md',
  //       `${JSON.stringify(exerciseData.hint, null, 2)}\n\n`,
  //       { flag: 'a' }
  //     );
  //     const loader = new TextLoader(`data/hints.md`);
  //     const [doc] = await loader.load();
  //     const chatResponse = await createChatCompletion(
  //       'gpt-4',
  //       `Give me some hints about a person and I will answer who it is but only if I am 100% sure that the answer is correct. Answer questions as truthfully using the context below and nothing more. If you don't know the answer, say "0". Return answer for the question based on provided context. Return only name of the person.
  //       Context###
  //       ${doc.pageContent}
  //       ###context`
  //     );

  //     console.log('chatResponse: ', chatResponse);

  //     if (chatResponse !== '0') {
  //       const authData = await authorize(taskname);
  //       const authToken = authData.token;
  //       await postTaskData(chatResponse, authToken);
  //       console.log(`answered after ${i + 2} attempts`);
  //       break;
  //     }
  //   }
  // }
  // const questionResponse = await sendQuestion(content, authToken);
}

postExerciseAnswer(TASKNAME);
