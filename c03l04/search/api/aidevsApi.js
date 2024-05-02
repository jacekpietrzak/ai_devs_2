import * as https from 'https';
import axios from 'axios';
import fs from 'fs';

import dotenv from 'dotenv';
// dotenv.config({ path: '../.env' });
dotenv.config();

const url = 'https://tasks.aidevs.pl';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: fs.readFileSync('../../certs/aidevs.pem'),
});

export async function authorize(TASKNAME) {
  try {
    const response = await axios.post(
      `${url}/token/${TASKNAME}`,
      {
        apikey: process.env.AI_DEVS_API_KEY,
      },
      { httpsAgent }
    );
    const result = await response.data;
    console.log('auth res: ', result);
    return result;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}
// export async function authorize(TASKNAME) {
//   try {
//     const response = await fetch(`${url}/token/${TASKNAME}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         apikey: process.env.AI_DEVS_API_KEY,
//       }),
//     });

//     const result = await response.json();
//     console.log('auth res: ', result);
//     return result;
//   } catch (error) {
//     console.error('There has been a problem with your fetch operation:', error);
//   }
// }

export async function getTaskData(TOKEN) {
  try {
    const response = await axios.get(`${url}/task/${TOKEN}`, {
      httpsAgent,
    });

    // if (!response.ok) {
    //   throw new Error(`Api call was not ok ${response.status}`);
    // }

    const result = await response.data;
    console.log('getTaskData exercise task: ', result);
    return result;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

export async function sendQuestion(QUESTION, TOKEN) {
  // Construct a FormData instance
  const formData = new FormData();

  // Add a text field
  formData.append('question', QUESTION);

  console.log('formData: ', formData);

  try {
    const response = await fetch(`${url}/task/${TOKEN}`, {
      method: 'POST',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      body: formData,
    });

    const result = await response.json();
    console.log('answer: ', result);
    return result;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

export async function postTaskData(ANSWER, TOKEN) {
  console.log('postTaskData answer: ', ANSWER);
  try {
    const response = await fetch(`${url}/answer/${TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer: ANSWER,
      }),
    });

    const result = await response.json();
    console.log('postTaskData exercise answer: ', result);
    return result;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}
