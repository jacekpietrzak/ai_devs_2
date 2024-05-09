import dotenv from 'dotenv';
// dotenv.config({ path: '../.env' });
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export async function createChatCompletion(model, systemMessage, humanMessage) {
  // console.log({ model, systemMessage, humanMessage });
  const chatModel = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: model,
    maxTokens: 1024,
    verbose: false,
    maxRetries: 2,
  });

  const { content } = await chatModel.invoke([
    new SystemMessage(systemMessage),
    new HumanMessage(humanMessage),
  ]);

  console.log('createChatCompletion content: ', content);
  return content;
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

export async function createEmbedding(input) {
  /* Create instance */
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'text-embedding-3-large',
  });

  /* Embed queries */
  const queryRes = await embeddings.embedQuery(input);

  /* Embed documents */
  // const documentRes = await embeddings.embedDocuments([
  //   'Hello world',
  //   'Bye bye',
  // ]);

  console.dir(queryRes, { depth: 10, colors: true });

  return queryRes;
}
