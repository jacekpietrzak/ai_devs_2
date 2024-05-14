import dotenv from 'dotenv';
dotenv.config();

import { authorize, getTaskData } from './api/aidevsApi.js';

const TASKNAME = process.env.TASK_NAME;

async function getExerciseData(TASKNAME) {
  const authData = await authorize(TASKNAME);
  const authToken = authData.token;

  await getTaskData(authToken);
}

getExerciseData(TASKNAME);
