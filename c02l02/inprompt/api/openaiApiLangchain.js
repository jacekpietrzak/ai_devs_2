import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export async function createChatCompletion(model, systemMessage, humanMessage) {
  const chatModel = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: model,
    verbose: false,
  });

  // Conversation

  // We can also guide it's response with a prompt template. Prompt templates are used to convert raw user input to a better input to the LLM.
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['user', '{input}'],
  ]);

  // We can now combine these into a simple LLM chain:
  const outputParser = new StringOutputParser(); // default output is a message. We will parse to string
  const llmChain = prompt.pipe(chatModel).pipe(outputParser);

  // Finally, we can invoke the chain with the messages we want to send:
  const content = await llmChain.invoke({
    input: humanMessage,
  });

  // const { content } = await chatModel.invoke([
  //   new SystemMessage(systemMessage),
  //   new HumanMessage(humanMessage),
  // ]);

  console.log('content: ', content);
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
