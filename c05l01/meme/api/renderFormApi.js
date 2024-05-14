import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import * as https from 'https';
import fs from 'fs';

const url = 'https://api.renderform.io';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: fs.readFileSync('../../certs/aidevs.pem'),
});

export async function render(data) {
  console.log('env:', process.env.RENDER_FORM_API);
  try {
    const response = await axios.post(
      `${url}/api/v2/render`,
      //   {
      //     apikey: process.env.AI_DEVS_API_KEY,
      //     },
      {
        template: 'big-devils-work-ably-1736',
        data: {
          'TEXT.text': data.text,
          'IMAGE.src': data.image,
        },
      },
      {
        headers: {
          'X-API-KEY': process.env.RENDER_FORM_API,
          'Content-Type': 'application/json',
        },
      }
      //   { httpsAgent },
    );
    const result = await response.data;
    console.log('render image res: ', result);
    return result;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}
