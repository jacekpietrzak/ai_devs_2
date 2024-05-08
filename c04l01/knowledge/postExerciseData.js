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

import axios from 'axios';

const TASKNAME = process.env.TASK_NAME;

async function postExerciseAnswer(TASKNAME) {
  const authData = await authorize(TASKNAME);
  const authToken = authData.token;
  const exerciseData = await getTaskData(authToken);

  const model = 'gpt-3.5-turbo';
  const systemMessage = `Alice here. To describe a user message for me as JSON with this exact structure {"type": "exchange_rate (question about currency)|current_population (question about population)|general (everything else)}, 
  we need to follow these rules:
- Always strictly follow the JSON structure described above with special care and attention.
- IMPORTANT: JSON always has to have one property: type.
- Tags should be semantic tags that describe and enrich the query.
- Always return JSON and nothing else.

Examples:
###
jaka jest populacja Niemiec?
{"type": "current_population"}
podaj aktualny kurs EURO
{"type": "exchange_rate"}
jak nazywa się stolica Czech?
{"type": "general"}
###`;
  const humanMessage = exerciseData.question;
  const chatResponse = await createChatCompletion(
    model,
    systemMessage,
    humanMessage
  );
  console.log('chatResponse: ', JSON.parse(chatResponse));

  const questionType = JSON.parse(chatResponse);

  if (questionType.type === 'general') {
    const model = 'gpt-3.5-turbo';
    const systemMessage = `Alice here. I will answer your question and return answer as JSON with exact structure {"answer": "answer"}.
 Strict rules you're obligated to follow throughout the conversation:
 — always skip any additional comments.
 — Answer questions as truthfully as possible using the context below and nothing else. If you don't know the answer, say, "I don't know.
 - Always return JSON and nothing else.`;
    const humanMessage = exerciseData.question;
    const chatResponse = await createChatCompletion(
      model,
      systemMessage,
      humanMessage
    );
    await postTaskData(chatResponse, authToken);
    return console.log(chatResponse);
  } else if (questionType.type === 'exchange_rate') {
    const model = 'gpt-3.5-turbo';
    const systemMessage = `Alice here. I will answer your question and return answer as JSON with exact structure {"currency_code": "answer"}.
 Strict rules you're obligated to follow throughout the conversation:
 - always skip any additional comments.
 - Answer questions as truthfully as possible using the context below and nothing else. If you don't know the answer, say, "I don't know.
 - Always return CURRENCY CODE and nothing else. 
 - Always return JSON and nothing else.`;
    const humanMessage = exerciseData.question;
    const chatResponse = await createChatCompletion(
      model,
      systemMessage,
      humanMessage
    );

    const currency_code = JSON.parse(chatResponse);
    // return console.log(currency_code);
    const response = await axios.get(
      `http://api.nbp.pl/api/exchangerates/rates/a/${currency_code.currency_code}/`
    );

    console.log(response.data);
    await postTaskData(response.data.rates[0].mid, authToken);

    return console.log(response.data.rates[0].mid);
  } else if (questionType.type === 'current_population') {
    const model = 'gpt-3.5-turbo';
    const systemMessage = `Alice here. I will answer your question and return answer as JSON with exact structure {"country": "answer"}.
 Strict rules you're obligated to follow throughout the conversation:
 - always skip any additional comments.
 - Answer questions as truthfully as possible using the context below and nothing else. If you don't know the answer, say, "I don't know.
 - Always return COUNTRY NAME in english and nothing else. 
 - Always return JSON and nothing else.`;
    const humanMessage = exerciseData.question;
    const chatResponse = await createChatCompletion(
      model,
      systemMessage,
      humanMessage
    );

    const country = JSON.parse(chatResponse);

    // return console.log(country.country.toLowerCase());
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${country.country}?fields=population`
    );

    await postTaskData(response.data[0].population, authToken);
    return console.log(response.data[0].population);
  }
}

postExerciseAnswer(TASKNAME);
