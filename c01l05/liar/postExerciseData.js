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
} from './api/openaiApiLangchain.js';

const TASKNAME = process.env.TASK_NAME;

const content = `What is the capital of Poland?`;

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);

  const questionResponse = await sendQuestion(content, authToken);

  const chatResponse = await createChatCompletion(
    'gpt-3.5-turbo',
    'You are a world class expert in answering questions. You return only "YES" if the answer is correct and  "NO" if the answer is incorrect.',
    `is "${content}" correct answer to question "${questionResponse.answer}"? 
return only Yes if it is correct or No if it is incorrect`
  );

  // const moderationResponse = await createModeration(exerciseData.blog);

  // console.log('moderationResponse: ', moderationResponse);

  // const chatResponse = await createChatCompletion(
  //   'system',
  //   createContent(exerciseData.blog),
  //   'gpt-3.5-turbo'
  // );

  // console.dir(chatResponse, { depth: 10, colors: true });

  await postTaskData(chatResponse, authToken);
}

postExerciseAnswer(TASKNAME);
