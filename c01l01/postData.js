require('dotenv').config();

const { authorize, getData, postData } = require('./api/api');

const TASKNAME = 'helloapi';

async function postExerciseAnswer(taskname) {
  const authData = await authorize(taskname);
  const authToken = authData.token;
  const exerciseDat = await getData(authToken);

  await postData(exerciseDat.cookie, authToken);
}

postExerciseAnswer(TASKNAME);
