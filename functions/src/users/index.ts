import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

export const getAllUsers = functions.https.onCall(async (data, context) => {
  const users = await admin
    .auth()
    .listUsers()
    .then((listUsersResult) => {
      return listUsersResult.users.map(u => u.toJSON())
    })
    .catch((error) => {
      console.log('Error fetching user data:', error);
      return null;
    });

  return users;
});

