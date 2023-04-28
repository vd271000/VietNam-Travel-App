import SQLite from 'react-native-sqlite-storage';
import database from '@react-native-firebase/database';

export const db = SQLite.openDatabase(
  {
    name: 'users.db',
    location: 'default',
  },
  () => {},
  error => {
    console.log('Error opening database:', error);
  },
);

export const initDb = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT NOT NULL UNIQUE, birthday INTEGER, balance INTEGER);`,
        [],
        () => {
          console.log('Users table created successfully');
          resolve();
        },
        (_, error) => {
          console.log('Error creating table users:', error);
          reject(error);
        },
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS flight_booking (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, flight_info TEXT, booking_date INTEGER,);`,
        [],
        () => {
          console.log('flight_booking table created successfully');
          resolve();
        },
        (_, error) => {
          console.log('Error creating flight_booking table:', error);
          reject(error);
        },
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS hotel_booking (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, hotel_info TEXT, check_in TEXT, check_out TEXT, booking_date INTEGER,);`,
        [],
        () => {
          console.log('The hotel_booking table was created successfully');
           resolve();
         },
         (_, error) => {
           console.log('Error creating table hotel_booking:', error);
          reject(error);
        },
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS car_booking (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, car_info TEXT, booking_date INTEGER);`,
        [],
        () => {
          console.log('Car_booking table created successfully');
          resolve();
        },
        (_, error) => {
          console.log('Error creating table car_booking:', error);
          reject(error);
        },
      );
    });
  });
};

// Save Car Booking To Firebase
export const saveCarBookingToFirebase = async (userId, carInfo) => {
  try {
    await database().ref(`/users/${userId}/car_bookings/${carInfo.guid}`).set({
      car_info: carInfo,
      booking_date: Date.now(),
    });
    console.log('Saved the booking in Firebase Realtime Database');
  } catch (error) {
    console.log('Error saving car reservation to Firebase:', error);
  }
};

//Save Car Booking
export const saveCarBooking = async (userId, carInfo) => {
  try {
    await saveCarBookingToFirebase(userId, carInfo);
    console.log('Saved booking in both SQLite and Firebase Realtime Database');
  } catch (error) {
    console.log('Error saving car booking in sql and realtime db:', error);
  }
};

// Delete Car
export const deleteCarBooking = async (userId, carGuid) => {
  try {
    const carBookingsRef = database().ref(`users/${userId}/car_bookings`);
    const snapshot = await carBookingsRef.once('value');
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(childSnapshot => {
        const carInfo = childSnapshot.val().car_info;
        if (carInfo.guid === carGuid) {
          found = true;
          childSnapshot.ref.remove();
          console.log(
            'Removed booking information from Firebase Realtime Database',
            );
          }
        });
        if (!found) {
          console.log(
            'The booking information does not exist in the Firebase Realtime Database',
          );
        }
      } else {
        console.log(
          'The booking information does not exist in the Firebase Realtime Database',
        );
      }
    } catch (error) {
      console.log('Error removing booking information from Firebase:', error);
  }
};

//fetchCarBookings to get the booking list from Firebase's Realtime Database:
export const fetchCarBookings = async userId => {
  const carBookingsRef = database().ref(`users/${userId}/car_bookings`);
  const snapshot = await carBookingsRef.once('value');
  const carBookings = [];
  if (snapshot.exists()) {
    snapshot.forEach(childSnapshot => {
      const carBooking = childSnapshot.val().car_info;
      carBookings.push(carBooking);
    });
  }
  return carBookings;
};

//FlightFirebase
export const saveBookingToFirebase = async (userId, flightInfo) => {
  try {
    await database()
      .ref(`/users/${userId}/flight_bookings/${flightInfo.itineraryId}`)
      .set({
        flight_info: flightInfo,
        booking_date: Date.now(),
      });
    console.log('Saved booking to Firebase Realtime Database');
  } catch (error) {
    console.log('Error saving booking to Firebase:', error);
  }
};

//FlightDelete Firebase
export const deleteBookingFlight = async (userId, itineraryId) => {
  try {
    const flightBookingsRef = database().ref(`users/${userId}/flight_bookings`);
    const snapshot = await flightBookingsRef.once('value');
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(childSnapshot => {
        const flightInfo = childSnapshot.val().flight_info;
        if (
          flightInfo.itineraryId === itineraryId
        ) {
          found = true;
          childSnapshot.ref.remove();
          console.log('Flight removed from Firebase Realtime Database');
        }
      });
      if (!found) {
        console.log(
          'Flight does not exist in Firebase Realtime Database',
        );
      }
    } else {
      console.log('Flight does not exist in Firebase Realtime Database');
    }
  } catch (error) {
    console.log('Error removing flight from Firebase:', error);
  }
};

//Hotel SQLite
export const saveHotelBookingToSQLite = async (
  userId,
  hotelId,
  hotelInfo,
  checkIn,
  checkOut,
) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO hotel_booking (user_id, hotel_info, check_in, check_out, booking_date) VALUES (?, ?, ?, ?, ?);',
        [userId, JSON.stringify(hotelInfo), checkIn, checkOut, Date.now()],
        (_, result) => {
          console.log('Saved hotel reservation to SQLite');
          resolve(result.insertId);
        },
        (_, error) => {
          console.log('Error saving hotel reservation to SQLite:', error);
          reject(error);
        },
      );
    });
  });
};

// HotelFirebase
export const saveHotelBookingToFirebase = async (
  userId,
  hotelId,
  hotelInfo,
  checkIn,
  checkOut,
) => {
  try {
    await database().ref(`/users/${userId}/hotel_bookings/${hotelId}`).set({
      hotel_info: hotelInfo,
      check_in: checkIn,
      check_out: checkOut,
      booking_date: Date.now(),
    });
    console.log('Saved hotel reservation to Firebase Realtime Database');
  } catch (error) {
    console.log('Error saving hotel reservation to Firebase:', error);
  }
};

// HotelAdd
export const saveHotelBooking = async (
  userId,
  hotelId,
  hotelInfo,
  checkIn,
  checkOut,
) => {
  try {
    await saveHotelBookingToSQLite(
      userId,
      hotelId,
      hotelInfo,
      checkIn,
      checkOut,
    );
    await saveHotelBookingToFirebase(
      userId,
      hotelId,
      hotelInfo,
      checkIn,
      checkOut,
    );
    console.log(
      'Saved hotel reservation to both SQLite and Firebase Realtime Database',
     );
   } catch (error) {
     console.log('Error saving hotel reservation:', error);
  }
};

// HotelDelete Firebase
export const deleteHotelBooking = async (userId, hotelId) => {
  try {
    const hotelBookingsRef = database().ref(`users/${userId}/hotel_bookings`);
    const snapshot = await hotelBookingsRef.once('value');
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(childSnapshot => {
        const hotelInfo = childSnapshot.val().hotel_info;
        if (hotelInfo.hotelId === hotelId) {
          found = true;
          childSnapshot.ref.remove();
          console.log(
            'Hotel reservation removed from Firebase Realtime Database',
           );
         }
       });
       if (!found) {
         console.log(
           'Hotel reservation does not exist in Firebase Realtime Database',
         );
       }
     } else {
       console.log(
         'Hotel reservation does not exist in Firebase Realtime Database',
       );
     }
   } catch (error) {
     console.log('Error removing hotel reservation from Firebase:', error);
  }
};

// get hotel booking list from Firebase Realtime Database.
export const fetchHotelBookings = async userId => {
  const hotelBookingsRef = database().ref(`users/${userId}/hotel_bookings`);
  const snapshot = await hotelBookingsRef.once('value');
  const hotelBookings = [];
  if (snapshot.exists()) {
    snapshot.forEach(childSnapshot => {
      const hotelBooking = childSnapshot.val().hotel_info;
      hotelBookings.push(hotelBooking);
    });
  }
  return hotelBookings;
};