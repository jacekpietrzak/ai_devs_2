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
  createWhisper,
} from './api/openaiApiLangchain.js';
import { addUserSchema } from './schema.js';

const TASKNAME = process.env.TASK_NAME;

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);

  // const whisperResponse = await createWhisper('./data/mateusz.mp3');

  // const questionResponse = await sendQuestion(content, authToken);

  // const embeddingResponse = await createEmbedding('Hawaiian pizza');

  await postTaskData(addUserSchema, authToken);
}

postExerciseAnswer(TASKNAME);
