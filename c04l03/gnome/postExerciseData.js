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
  const fileName = exerciseData.url.split('/').pop();
  const downloadResponse = await downloadAxios(
    exerciseData.url,
    `data/${fileName}`
  );
  const imageData = await fs.readFile(`./data/${fileName}`);

  const model = 'gpt-4-vision-preview';
  const systemMessage = `Alice here. Analyze the image. Describe an image for me as JSON with this exact structure: {"hatColor": "color"}.
  If this is a gnome with a hat return a hat color in polish. If this is not a gnome return "error". 
  we need to follow these rules:
  - Always strictly follow the JSON structure described above with special care and attention.
  - IMPORTANT: JSON always has to have one property: hatColor.
  - Tags should be semantic tags that describe and enrich the query.
  - Always return JSON and nothing else.

  Examples:
  ###
  gnome image with red hat
  {"hatColor": "czerwony"}
  gnome image with blue hat
  {"hatColor": "niebieski"}
  not a gnome image
  {"hatColor":"error"}  
  ###`;
  const humanMessage = {
    content: [
      {
        type: 'text',
        text: 'What is the gnomes hat color?',
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageData.toString('base64')}`,
        },
      },
    ],
  };
  const chatResponse = await createChatCompletion(
    model,
    systemMessage,
    humanMessage
  );

  const answer = JSON.parse(chatResponse);

  await postTaskData(answer.hatColor, authToken);
  await fs.unlink(`./data/${fileName}`);
}

postExerciseAnswer(TASKNAME);
