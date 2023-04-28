export const firebaseConfig = {
  apiKey: 'AIzaSyBLxvkYV5is3DxGI1b5PlicYqTug5gjrOQ',
  authDomain: 'loginfacebook-7aac6.firebaseapp.com',
  databaseURL:
    'https://loginfacebook-7aac6-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'loginfacebook-7aac6',
  storageBucket: 'loginfacebook-7aac6.appspot.com',
  messagingSenderId: '1054186381804',
  appId: '1:1054186381804:android:b78fa1f0f0c2bec40260c9',
};

async function getAllUsersFromSQLite() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users;',
        [],
        (_, results) => {
          const users = [];
          for (let i = 0; i < results.rows.length; i++) {
            users.push(results.rows.item(i));
          }
          resolve(users);
        },
        (_, error) => {
          console.log('Error retrieving data from SQLite:', error);
          reject(error);
        },
      );
    });
  });
}

async function migrateUsersToFirebase() {
  try {
    const users = await getAllUsersFromSQLite();
    users.forEach(user => {
      const newUserRef = database().ref('users').push();
      newUserRef.set(user);
    });

    console.log('Successfully migrated data from SQLite to Firebase');
  } catch (error) {
    console.log('Error migrating data from SQLite to Firebase:', error);
  }
}

migrateUsersToFirebase();
