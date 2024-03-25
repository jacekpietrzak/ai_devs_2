require('dotenv').config();

const { authorize, getData } = require('./api/api');

const TASKNAME = 'helloapi';

async function getExerciseData(TASKNAME) {
  const authData = await authorize(TASKNAME);
  const authToken = authData.token;

  await getData(authToken);
}

getExerciseData(TASKNAME);
