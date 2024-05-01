import dotenv from 'dotenv';
dotenv.config();

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
  const fileName = exerciseData.input.split('/').pop();

  console.log(fileName);

  const downloadResponse = await downloadAxios(
    exerciseData.input,
    `data/${fileName}`,
    20000
  );

  console.log({ 'Download Response:': downloadResponse });

  if (downloadResponse.status !== 200) {
    for (let i = 0; i < 6; i++) {
      const downloadResponse = await downloadAxios(
        exerciseData.input,
        `data/${fileName}`,
        20000
      );
      console.log({ Try_no: i + 1, Code: downloadResponse });
      if (downloadResponse.status === 200) {
        break;
      }
    }
  }

  const loader = new TextLoader(`data/${fileName}`);
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

  await postTaskData(chatResponse, authToken);
}

postExerciseAnswer(TASKNAME);
