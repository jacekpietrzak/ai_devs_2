import dotenv from 'dotenv';
dotenv.config();

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

const TASKNAME = process.env.TASK_NAME;

const content = `What is the capital of Poland?`;

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);

  const questionResponse = await sendQuestion(content, authToken);

  const embeddingResponse = await createEmbedding('Hawaiian pizza');

  await postTaskData(embeddingResponse, authToken);
}

postExerciseAnswer(TASKNAME);
