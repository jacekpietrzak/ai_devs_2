import axios from 'axios';
import { error } from 'console';
import fs from 'fs/promises';

export async function downloadAxios(url, path, timeout) {
  const options = {
    method: 'GET',
    // responseType: 'blob',
    responseType: 'arraybuffer',
    // responseType: 'stream',
    headers: {
      // 'User-Agent': 'Opera/9.80',
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
    },
  };

  console.log(`Starting file download with url ${url}`);
  try {
    const response = await axios.get(url, options);

    const fileData = Buffer.from(response.data, 'binary');
    await fs.writeFile(path, JSON.stringify(JSON.parse(fileData)), (error) => {
      if (error) console.log(error);
      throw error;
    });
    return { status: 200, msg: 'File saved!' };
  } catch (err) {
    console.log({ err_msg: err.message, err_code: err.code });
    return err.code;
  }
}
