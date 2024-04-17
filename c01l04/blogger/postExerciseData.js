import dotenv from 'dotenv';
dotenv.config();

import { authorize, getTaskData, postTaskData } from './api/aidevsApi.js';
import { createChatCompletion, createModeration } from './api/openaiApi.js';

const TASKNAME = process.env.TASK_NAME;

function createContent(chapters) {
  const content = `Hey Alice, hope you're doing great! I'm in the mood for some delicious Margherita pizza, and I thought to share with others how it's made. Let's spin a blog post in Polish about making Margherita pizza, shall we?

Here are the chapter ideas I have in mind: ${chapters[0]}, ${chapters[1]}, ${chapters[2]}, ${chapters[3]}

Do remember, this is an interactive recipe! So each chapter should cover one aspect of making the pizza - picking ingredients, explaining the process, baking tips, you get it. 

As an output, provide only the written chapters in an array (JSON format), with a field representing each chapter, exclude chapter ideas. Example of output: {"answer":["text 1","text 2","text 3","text 4"]}.

Let's make this a pizza-party in a blog post!`;

  return content;
}

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);
  const moderationResponse = await createModeration(exerciseData.blog);

  console.log('moderationResponse: ', moderationResponse);

  const chatResponse = await createChatCompletion(
    'system',
    createContent(exerciseData.blog),
    'gpt-3.5-turbo'
  );

  console.dir(chatResponse, { depth: 10, colors: true });

  await postTaskData(chatResponse.choices[0].message.content, authToken);
}

postExerciseAnswer(TASKNAME);
