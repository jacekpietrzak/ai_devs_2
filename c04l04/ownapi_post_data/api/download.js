import axios from 'axios';
import fs from 'fs/promises';

export async function downloadAxios(url, path, timeout = 0) {
  const options = {
    timeout: timeout,
    // signal: AbortSignal.timeout(10000),
    method: 'GET',
    // url: url,
    responseType: 'arraybuffer',
    // responseType: 'stream',
    // headers: {
    //   'User-Agent': 'Opera/9.80',
    // },
  };

  console.log(`Starting file download with url ${url}`);
  try {
    const response = await axios.get(url, options);

    const fileData = Buffer.from(response.data, 'binary');
    await fs.writeFile(path, fileData);
    return { status: 200, msg: 'File saved!' };
  } catch (err) {
    console.log({ err_msg: err.message, err_code: err.code });
    return err.code;
  }
}
