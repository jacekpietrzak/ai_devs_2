import dotenv from 'dotenv';
dotenv.config();
const url = 'https://tasks.aidevs.pl';

export async function authorize(TASKNAME) {
  try {
    const response = await fetch(`${url}/token/${TASKNAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: process.env.AI_DEVS_API_KEY,
      }),
    });

    const result = await response.json();
    console.log('auth res: ', result);
    return result;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

export async function getTaskData(TOKEN) {
  try {
    const response = await fetch(`${url}/task/${TOKEN}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Api call was not ok ${response.status}`);
    }

    const result = await response.json();
    console.log('exercise task: ', result);
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
  console.log('answer: ', ANSWER);
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

    console.log(ANSWER);

    const result = await response.json();
    console.log('exercise answer: ', result);
    return result;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}
