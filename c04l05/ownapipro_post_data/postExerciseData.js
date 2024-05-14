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

const TASKNAME = process.env.TASK_NAME;

async function postExerciseAnswer(TASKNAME) {
  const authData = await authorize(TASKNAME);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);

  await postTaskData(
    'https://ai-devs-2-ownapi-d6f0003030c8.herokuapp.com/api/answer',
    authToken
  );
}

postExerciseAnswer(TASKNAME);
