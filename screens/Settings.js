import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {colors} from '../constants';
import auth from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import {GraphRequest, GraphRequestManager} from 'react-native-fbsdk-next';
import {loginSuccess, logoutSuccess} from '../screens/authSlice';
import {db, initDb} from './database';
import {initializeApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import {firebaseConfig} from './firebase';
import {firebase} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {
  addPurchasedFlight,
  removePurchasedFlight,
  setUserTickets,
} from './authSlice';
import {fetchHotelBookings, fetchCarBookings} from './database';

if (!firebase.apps.length) {
  initializeApp(firebaseConfig);
}

function Settings(props) {
  const LOGGED_OUT_AVATAR_URL = '../assets/nonavatar.jpg';
  const {navigation, route} = props;
  const {navigate, goBack} = navigation;
  const {onPress, title, isSelected} = props;
  const [userData, setUserData] = useState({});
  const [facebookAccessToken, setFacebookAccessToken] = useState(null);
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarSource, setAvatarSource] = useState(null);
  const [userBookingData, setUserBookingData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const checkLoginStatus = async () => {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      setIsLoggedIn(true);
      navigation.navigate('HomePage');
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setDisplayName(user.displayName);
      setAvatarSource(
        user.photoURL ? {uri: user.photoURL} : LOGGED_OUT_AVATAR_URL,
      );
    }
  }, []);

  const isValidEmail = email => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
  };

  const sendResetPasswordEmail = () => {
    var auth = firebase.auth();
    var emailAddress = forgotPasswordEmail;

    auth
      .sendPasswordResetEmail(emailAddress)
      .then(function () {
        Alert.alert(
          'Notice',
          'Password reset email has been sent. Please check your mailbox.',
        );
        setShowForgotPasswordModal(false);
      })
      .catch(function (error) {
        console.error('Error:', error);
        Alert.alert('An error occurred', 'Please try again.');
      });
  };

  useEffect(() => {
    initDb()
      .then(() => {
        console.log('Database initialized');
      })
      .catch(error => {
        console.log('Error initializing database:', error);
      });
  }, []);

  const signUp = async () => {
    if (signupPassword !== confirmPassword) {
      Alert.alert('Error', 'Password does not match, please check again.');
      return;
    }
    if (!signupPassword || !confirmPassword) {
      Alert.alert('Notice', 'You must enter a password.');
      return;
    }
    if (!isValidEmail(signupEmail)) {
      Alert.alert('Error', 'Invalid email address.');
      return;
    }
    Alert.alert(
      'Notification',
      'Confirmation code has been sent to your email. Please check and enter the confirmation code.',
    );
    try {
      const response = await auth().createUserWithEmailAndPassword(
        signupEmail,
        signupPassword,
      );
      const user = auth().currentUser;
      await user.sendEmailVerification();
      Alert.alert(
        'Success',
        'A confirmation email has been sent to your email address. Please check your email and follow the instructions to confirm your account.',
      );

      const userRef = database().ref('users/' + user.uid);
      userRef.set(
        {
          email: signupEmail,
          balance: 0,
        },
        () => {
          console.log('Successfully added user to firebase realtime');
          setShowSignupModal(false);
          fetchUsers();
        },
      );
      await auth().signOut();
    } catch (error) {
      Alert.alert('Error', 'Registration failed, please try again.');
      console.log('Sign up error:', error);
    }
  };

  const fetchUsers = () => {
    const usersRef = database().ref('users');
    usersRef.on('value', snapshot => {
      console.log('User data:', snapshot.val());
    });
  };

  const signIn = async () => {
    if (!isValidEmail(loginEmail)) {
      Alert.alert('Error', 'Invalid email address.');
      return;
    }
    if (!loginPassword) {
      Alert.alert('Notice', 'You must enter a password.');
      return;
    }
    try {
      const result = await auth().signInWithEmailAndPassword(
        loginEmail,
        loginPassword,
      );
      const user = result.user;
      if (user.emailVerified) {
        Alert.alert('Success', 'Login successful!');
        setShowLoginModal(false);
        const userRef = database().ref('users/' + user.uid);
        userRef.once('value', async snapshot => {
          const userData = snapshot.val();
          if (userData) {
            await storeUserTickets(user.uid, userData);
          }
        });
        await updateUserBookingData(user.uid);
        userBookingData.forEach(flight => {
          dispatch(addPurchasedFlight(flight));
        });
        fetchUserTickets(user.uid);
        setIsLoggedIn(true);
      } else {
        await auth().signOut();
        Alert.alert(
          'Notification',
          'Please check your email and follow the instructions to confirm your account before logging in.',
        );
        return;
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed, please try again.');
      console.log('Sign in error:', error);
    }
  };

  const storeUserTickets = async (userId, userData) => {
    const ticketsData = {
      purchasedHotels: userData.purchasedHotels || [],
      purchasedFlights: Object.values(userData.flight_bookings || {}).map(
        item => item.flight_info,
      ),
      purchasedCars: userData.purchasedCars || [],
    };
    const hotelBookings = await fetchHotelBookings(userId);
    const carBookings = await fetchCarBookings(userId);
    ticketsData.purchasedHotels = hotelBookings;
    ticketsData.purchasedCars = carBookings;
    await AsyncStorage.setItem('users', JSON.stringify(ticketsData));
    return ticketsData;
  };

  const updateUserBookingData = async userId => {
    const userBookingRef = database().ref(`bookingData/${userId}`);
    userBookingRef.once('value', async snapshot => {
      const storedBookingData = snapshot.val();
      if (storedBookingData) {
        setUserBookingData(storedBookingData);
        await AsyncStorage.setItem(
          'bookingData',
          JSON.stringify(storedBookingData),
        );
        if (!storedBookingData) {
          setUserBookingData([]);
          await AsyncStorage.setItem('bookingData', JSON.stringify([]));
        }
      } else {
        setUserBookingData([]);
        await AsyncStorage.removeItem('bookingData');
      }
    });
  };

  const fetchUserTickets = async userId => {
    const userTicketsRef = firebase.database().ref(`users/${userId}`);
    userTicketsRef.once('value', async snapshot => {
      const userData = snapshot.val();
      if (userData) {
        console.log('User Tickets from Firebase:', userData);
        const hotelBookings = await fetchHotelBookings(userId);
        const carBookings = await fetchCarBookings(userId);
        userData.purchasedHotels = hotelBookings;
        userData.purchasedCars = carBookings;
        dispatch(
          setUserTickets({
            purchasedHotels: userData.purchasedHotels || [],
            purchasedFlights: Object.values(userData.flight_bookings || {}).map(
              item => item.flight_info,
            ),
            purchasedCars: userData.purchasedCars || [],
          }),
        );
      }
    });
  };

  const signOut = async () => {
    try {
      await auth().signOut();
      signOutFacebook();
      dispatch(logoutSuccess());
      await AsyncStorage.removeItem('bookingData');
      await AsyncStorage.removeItem('users');
      setUserBookingData([]);
      userBookingData.forEach(flight => {
        dispatch(removePurchasedFlight(flight));
      });
      clearReduxStorage();
      setIsLoggedIn(false);
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  };

  const clearReduxStorage = () => {
    dispatch(
      setUserTickets({
        purchasedHotels: [],
        purchasedFlights: [],
        purchasedCars: [],
      }),
    );
  };

  const facebookLogin = async () => {
    const currentAccessToken = await AccessToken.getCurrentAccessToken();

    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
      'user_birthday',
    ]);

    if (result.isCancelled) {
      console.log('User cancelled the login process');
      return;
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }
    setFacebookAccessToken(data.accessToken);
    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken,
    );
    const res = await auth().signInWithCredential(facebookCredential);
    console.log('After signing in with credential, res:', res);
    setUserData(res?.user ?? {});
    const serializableUserData = {
      displayName: res?.user?.displayName,
      email: res?.user?.email,
      birthday: res?.user?.birthday,
      emailVerified: res?.user?.emailVerified,
      isAnonymous: res?.user?.isAnonymous,
      metadata: {
        creationTime: res?.user?.metadata?.creationTime,
        lastSignInTime: res?.user?.metadata?.lastSignInTime,
      },
      phoneNumber: res?.user?.phoneNumber,
      photoURL: res?.user?.photoURL,
      providerId: res?.user?.providerId,
      tenantId: res?.user?.tenantId,
      uid: res?.user?.uid,
    };
    dispatch(loginSuccess(serializableUserData));
    if (res && res.user) {
      const userId = res.user.uid;
      const userRef = database().ref('users/' + userId);
      userRef.once('value', async snapshot => {
        const userData = snapshot.val();
        if (userData) {
          await storeUserTickets(userId, userData);
        }
      });
      await updateUserBookingData(userId);
      userBookingData.forEach(flight => {
        dispatch(addPurchasedFlight(flight));
      });
      fetchUserTickets(userId);
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        const serializableUserData = {
          displayName: user.displayName,
          email: user.email,
          birthday: user.birthday,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
          providerId: user.providerId,
          tenantId: user.tenantId,
          uid: user.uid,
        };
        setUserData(serializableUserData);
        dispatch(loginSuccess(serializableUserData));
      } else {
        setUserData(null);
        dispatch(logoutSuccess());
      }
    });
    return unsubscribe;
  }, []);

  const saveFacebookUser = async userData => {
    const user = auth().currentUser;

    if (userData.email) {
      const userRef = database().ref('users/' + user.uid);
      userRef.once('value', async snapshot => {
        if (snapshot.exists()) {
          console.log('User already exists in Firebase Realtime Database');
        } else {
          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO users (email, password) VALUES (?, ?);',
              [userData.email, userData.password],
              () => {
                console.log('Add user successfully');
                fetchUsers();
              },
              error => {
                console.log('Error adding user: ', error);
              },
            );
          });
          userRef.set(
            {
              email: userData.email,
              password: userData.password,
              balance: 0,
            },
            () => {
              console.log('Successfully added user to firebase realtime');
              fetchUsers();
            },
          );
        }
      });
    } else {
      console.log('Cant save Facebook user due to missing email');
    }
  };

  const fetchUserProfile = async token => {
    return new Promise((resolve, reject) => {
      const request = new GraphRequest(
        '/me',
        {
          accessToken: token,
          parameters: {
            fields: {
              string: 'email,name,picture.type(large),birthday',
            },
          },
        },
        (error, result) => {
          if (error) {
            console.log('Error fetching user information:', error);
            reject(error);
          } else {
            const userData = {
              displayName: result.name,
              email: result.email,
              photoURL: result.picture.data.url,
              birthday: result.birthday,
            };
            setUserData(userData);
            resolve(userData);
          }
        },
      );
      new GraphRequestManager().addRequest(request).start();
    });
  };

  useEffect(() => {
    if (authState.isLoggedIn && facebookAccessToken) {
      fetchUserProfile(facebookAccessToken)
        .then(userData => {
          saveFacebookUser(userData);
        })
        .catch(error => {
          console.log('Error retrieving Facebook user information:', error);
        });
    }
  }, [authState.isLoggedIn, facebookAccessToken]);

  const signOutFacebook = async () => {
    const currentAccessToken = await AccessToken.getCurrentAccessToken();

    if (currentAccessToken) {
      LoginManager.logOut();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            userData?.photoURL
              ? {uri: userData?.photoURL}
              : require(LOGGED_OUT_AVATAR_URL)
          }
          style={styles.avatar}
        />
        <Text style={styles.userName}>{userData?.displayName ?? 'Guest'}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {authState.isLoggedIn ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.button}>
              <Text style={styles.buttonText}>Change Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut} style={styles.button}>
              <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => setShowLoginModal(true)}
                style={styles.button}>
                <Text style={styles.buttonText}>Signin Email</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={facebookLogin} style={styles.button}>
                <Text style={styles.buttonText}>Signin Facebook</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.registerRow}>
              <Text style={styles.Text}>Register a new account -</Text>
              <TouchableOpacity
                onPress={() => setShowSignupModal(true)}
                style={styles.button}>
                <Text style={styles.buttonText}>Register Email</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLoginModal}
        onRequestClose={() => {
          setShowLoginModal(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Sign in</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="#000000"
              onChangeText={setLoginEmail}
              value={loginEmail}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#000000"
              onChangeText={setLoginPassword}
              value={loginPassword}
              secureTextEntry={true}
            />
            <TouchableOpacity
              style={[styles.button, styles.modalButton]}
              onPress={signIn}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLoginModal(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setShowForgotPasswordModal(true)}>
              <Text style={styles.forgotPasswordButtonText}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSignupModal}
        onRequestClose={() => {
          setShowSignupModal(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Register new account with Email
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="#000000"
              onChangeText={setSignupEmail}
              value={signupEmail}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#000000"
              onChangeText={text => setSignupPassword(text)}
              value={signupPassword}
              secureTextEntry={true}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Re-enter password"
              placeholderTextColor="#000000"
              onChangeText={text => setConfirmPassword(text)}
              value={confirmPassword}
              secureTextEntry={true}
            />
            <TouchableOpacity
              style={[styles.button, styles.modalButton]}
              onPress={signUp}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSignupModal(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showForgotPasswordModal}
        onRequestClose={() => {
          setShowForgotPasswordModal(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Forgot password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="#000000"
              onChangeText={text => setForgotPasswordEmail(text)}
              value={forgotPasswordEmail}
            />
            <TouchableOpacity
              style={[styles.button, styles.modalButton]}
              onPress={sendResetPasswordEmail}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowForgotPasswordModal(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: colors.primary,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  infoText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    marginBottom: 10,
    width: '100%',
    color: 'black',
  },
  modalButton: {
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#CCCCCC',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  Text: {
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
});

export default Settings;
