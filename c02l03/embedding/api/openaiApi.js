import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
});

const messages = [
  {
    role: 'system',
    content:
      'You are a helpful assistant who can write blog posts about making pizza.',
  },
];

export async function createChatCompletion(role, content, model) {
  // const completion = await openai.chat.completions.create({
  //   messages: [{ role: role, content: content }],
  //   model: model,
  // });

  // console.log(completion);
  // console.log(completion.choices[0]);

  messages.push({
    role: role,
    content: content,
  });
  const response = await openai.chat.completions.create({
    model: model,
    messages: messages,
  });
  // console.dir(response, { depth: 10, colors: true });

  return response;
}

export async function createModeration(input) {
  if (Array.isArray(input)) {
    const arr = [];
    for (const element of input) {
      const response = await openai.moderations.create({
        input: element,
        response_format: { type: 'json_object' },
      });

      const result = response.results[0].flagged;

      console.log('result: ', element, result);
      if (result === true) {
        arr.push(1);
        console.log('arr: ', arr);
      } else {
        arr.push(0);
        console.log('arr: ', arr);
      }
    }
    return arr;
  }

  const moderation = await openai.moderations.create({
    input: input,
    response_format: { type: 'json_object' },
  });

  console.dir(moderation, { depth: 10, colors: true });

  return moderation;
}
