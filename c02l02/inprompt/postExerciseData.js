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

  const sentences = await createChatCompletion(
    'gpt-3.5-turbo',
    `Return only filtered JSON array of sentences provided in INPUT ARRAY that have a name mentioned in the QUESTION.`,
    // 'Filter INPUT ARRAY of sentences and return only an OUTPUT ARRAY of only those sentences that have a name mentioned in the QUESTION.',
    `INPUT ARRAY: ${questionResponse.input}, QUESTION: ${questionResponse.question}`
  );

  const answer = await createChatCompletion(
    'gpt-3.5-turbo',
    `Return an answer for the question provided by user using only context as data and nothing else. CONTEXT ### ${sentences} ###`,
    `QUESTION: ${questionResponse.question}`
  );

  // const moderationResponse = await createModeration(exerciseData.blog);

  // console.log('moderationResponse: ', moderationResponse);

  // const chatResponse = await createChatCompletion(
  //   'system',
  //   createContent(exerciseData.blog),
  //   'gpt-3.5-turbo'
  // );

  // console.dir(chatResponse, { depth: 10, colors: true });

  await postTaskData(answer, authToken);
}

postExerciseAnswer(TASKNAME);
