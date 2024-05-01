import axios from 'axios';
import fs from 'fs/promises';

export async function downloadAxios(url, path, timeout) {
  const options = {
    timeout: timeout,
    // signal: AbortSignal.timeout(10000),
    method: 'GET',
    // url: url,
    responseType: 'arraybuffer',
    // responseType: 'stream',
    headers: {
      'User-Agent': 'Opera/9.80',
    },
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
// export async function downloadAxios(url, path) {
//   let file = null;
//   const options = {
//     timeout: 5000,
//     // signal: AbortSignal.timeout(10000),
//     method: 'GET',
//     url: url,
//     responseType: 'stream',
//     headers: {
//       'User-Agent': 'Opera/9.80',
//     },
//   };

//   console.log(`Starting file download with url ${url}`);
//   try {
//     const response = await axios(options);

//     file = await fs.open(path, 'w');
//     const writer = file.createWriteStream();
//     response.data.pipe(writer);

//     await new Promise((resolve, reject) => {
//       writer.on('finish', async () => {
//         console.log(`Completed download with url ${url}`);
//         resolve();
//       });
//       writer.on('error', reject);
//     });
//   } catch (error) {
//     if (error.code === 'ECONNABORTED') {
//       return { status: 408, message: 'Request timed out' };
//     } else {
//       throw new Error(error);
//     }
//   } finally {
//     if (file !== null) {
//       await file.close();
//       return { status: 200, message: 'Download Completed' };
//     }
//   }
// }
