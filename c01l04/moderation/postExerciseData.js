import dotenv from 'dotenv';
dotenv.config();

import { authorize, getTaskData, postTaskData } from './api/aidevsApi.js';
import { createChatCompletion, createModeration } from './api/openaiApi.js';

const TASKNAME = process.env.TASK_NAME;

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);
  const moderationResponse = await createModeration(exerciseData.input);

  await postTaskData(moderationResponse, authToken);
}

postExerciseAnswer(TASKNAME);
