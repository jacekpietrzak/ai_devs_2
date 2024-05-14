import dotenv from 'dotenv';
dotenv.config();
import * as fs from 'node:fs/promises';

import {
  authorize,
  getTaskData,
  postTaskData,
  sendQuestion,
} from './api/aidevsApi.js';

import {
  createChatCompletion,
  createModeration,
  createEmbedding,
} from './api/openaiApiLangchain.js';
import { downloadAxios } from './api/download.js';

import { render } from './api/renderFormApi.js';
import { log } from 'node:console';

const TASKNAME = process.env.TASK_NAME;

async function postExerciseAnswer(TASKNAME) {
  const authData = await authorize(TASKNAME);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);

  const renderFormApi = await render(exerciseData);

  // const fileName = exerciseData.url.split('/').pop();
  // const downloadResponse = await downloadAxios(
  //   exerciseData.url,
  //   `data/${fileName}`
  // );
  // const imageData = await fs.readFile(`./data/${fileName}`);

  // const answer = JSON.parse(renderFormApi);
  console.log('answer: ', renderFormApi);

  await postTaskData(renderFormApi.href, authToken);
  // await fs.unlink(`./data/${fileName}`);
}

postExerciseAnswer(TASKNAME);
