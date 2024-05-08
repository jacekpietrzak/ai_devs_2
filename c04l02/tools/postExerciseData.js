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

async function postExerciseAnswer(TASKNAME) {
  const authData = await authorize(TASKNAME);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0];

  const model = 'gpt-4-turbo';
  const systemMessage = `Alice here. To describe a user message for me as JSON with this exact structure {"tool": "ToDo (to do task), "desc": "description of the task"}, {"tool": "Calendar (calendar task), "desc": "description of the task", "date": "date of the task (YYYY-MM-DD)"}
  we need to follow these rules:
  - Today is ${formattedDate}
  - Always strictly follow the JSON structure described above with special care and attention.
  - IMPORTANT: JSON always has to have one property: type.
  - Tags should be semantic tags that describe and enrich the query.
  - Always return JSON and nothing else.

  Examples:
  ###
  Przypomnij mi, że mam kupić mleko
  {"tool":"ToDo","desc":"Kup mleko"}
  Jutro mam spotkanie z Marianem
  {"tool":"Calendar","desc":"Spotkanie z Marianem","date":"2024-05-09"}
  ###`;
  const humanMessage = exerciseData.question;
  const chatResponse = await createChatCompletion(
    model,
    systemMessage,
    humanMessage
  );

  await postTaskData(JSON.parse(chatResponse), authToken);

  return console.log('chatResponse: ', JSON.parse(chatResponse));
}

postExerciseAnswer(TASKNAME);
