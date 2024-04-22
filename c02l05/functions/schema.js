export const addUserSchema = {
  name: 'addUser',
  description: 'Add user to the system',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      surname: {
        type: 'string',
      },
      year: {
        type: 'integer',
      },
    },
  },
};
