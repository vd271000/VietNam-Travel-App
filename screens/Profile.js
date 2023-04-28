import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  Button,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {launchImageLibrary} from 'react-native-image-picker';
import {openDatabase} from 'react-native-sqlite-storage';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk-next';
import firebase from '@react-native-firebase/app';
import Icon from 'react-native-vector-icons/FontAwesome';

const db = openDatabase({name: 'users.db'});

const TopUpModal = ({userId, visible, onClose}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleTopUp = async () => {
    if (!amount || !accountNumber || !accountName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setIsProcessing(true);
    const topUpAmount = parseInt(amount, 10);
    console.log('Top up amount:', topUpAmount);
    console.log('User ID:', userId);
    console.log(typeof userId);
    const userRef = firebase.database().ref(`users/${userId}/balance`);
    await userRef.transaction(currentBalance => currentBalance + topUpAmount);
    setAmount('');
    onClose();
    setIsProcessing(false);
    Alert.alert('Success', 'Deposit Successful');
  };
  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <ScrollView style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Deposit</Text>
        <Text style={styles.label}>Card number</Text>
        <TextInput
          style={styles.inputAmount}
          keyboardType="numeric"
          value={accountNumber}
          onChangeText={value => setAccountNumber(value)}
          placeholder="Enter card number"
        />
        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.inputAmount}
          value={accountName}
          onChangeText={value => setAccountName(value)}
          placeholder="Enter account name"
        />
        <Text style={styles.label}>Amount to deposit:</Text>
        <TextInput
          style={styles.inputAmount}
          keyboardType="numeric"
          value={amount}
          onChangeText={value => setAmount(value)}
          placeholder="Enter amount"
        />
        <View style={styles.modalButtonsAmount}>
          <TouchableOpacity
            style={styles.saveButtonAmount}
            onPress={handleTopUp}>
            <Text style={styles.saveButtonTextAmount}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButtonAmount} onPress={onClose}>
            <Text style={styles.closeButtonTextAmount}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
};

const Profile = ({navigation, route}) => {
  const defaultAvatar = require('../assets/nonavatar.jpg');
  const [displayName, setDisplayName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSource, setAvatarSource] = useState(null);
  const [loggedInWithFacebook, setLoggedInWithFacebook] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(false);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  const fetchBirthdayFromSQLite = async (email) => {
    await db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM users WHERE email=?`,
        [email],
        (tx, results) => {
          if (results.rows.length > 0) {
            setBirthday(results.rows.item(0).birthday);
          }
        },
        (tx, error) => {
          console.log('Error retrieving birthday:', error.message);
        },
      );
    });
  };

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      console.log('User data:', user); 
      const userId = auth().currentUser.uid;
      setUserId(userId);
      setDisplayName(user.displayName);
      setAvatarSource(user.photoURL ? {uri: user.photoURL} : defaultAvatar);
      if (!loggedInWithFacebook) {
        setEmail(user.email);
        fetchBirthdayFromSQLite(user.email);
      }      if (
        user.providerData &&
        user.providerData[0].providerId === 'facebook.com'
      ) {
        setLoggedInWithFacebook(true);
        AccessToken.getCurrentAccessToken().then(data => {
          const {accessToken} = data;
          const infoRequest = new GraphRequest(
            '/me',
            {
              accessToken: accessToken,
              parameters: {
                fields: {
                  string: 'id,name,email,picture.type(large),birthday',
                },
              },
            },
            (error, result) => {
              if (error) {
                console.log('Error fetching data: ' + error.toString());
              } else {
                setAvatarSource({uri: result.picture.data.url});
                setBirthday(result.birthday);
                  db.transaction(tx => {
                  tx.executeSql(
                    `SELECT * FROM users WHERE email=?`,
                    [user.email],
                    (tx, results) => {
                      if (results.rows.length > 0) {
                        setBirthday(results.rows.item(0).birthday);
                      }
                    },
                    (tx, error) => {
                      console.log("Error retrieving birthday:", error.message);
                    },
                  );
                });
              }
            },
          );
          new GraphRequestManager().addRequest(infoRequest).start();
        });
      }
      const userRef = firebase.database().ref('users/' + userId);
      const onValueChange = userRef.on('value', snapshot => {
        const userData = snapshot.val();
        if (userData) {
          setBalance(userData.balance);
        }
      });
      return () => {
        userRef.off('value', onValueChange);
      };
    }
  }, []);

  const chooseAvatar = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const asset = response.assets[0];
        if (asset.uri) {
          const source = {uri: asset.uri};
          setAvatarSource(source);
        } else if (asset.base64) {
          const source = {uri: `data:image/jpeg;base64,${asset.base64}`};
          setAvatarSource(source);
        } else {
          console.log('Image uri and base64 are both undefined');
        }
      }
    });
  };

  const updateBirthdayInSQLite = async () => {
    await db.transaction((tx) => {
      tx.executeSql(
        `UPDATE users SET birthday=? WHERE email=?`,
        [birthday, email],
        () => {
          console.log('Birthday updated in SQLite');
        },
        (tx, error) => {
          console.log('Error updating birthday:', error.message);
        },
      );
    });
  };

  const saveChanges = async () => {
    const user = auth().currentUser;
    if (user) {
      await user.updateProfile({
        displayName: displayName,
        photoURL: avatarSource.uri,
      });
  if (!loggedInWithFacebook) {
        await updateBirthdayInSQLite();
      }    
      if (password) {
        await user.updatePassword(password);
      }
      if (loggedInWithFacebook) {
        AccessToken.getCurrentAccessToken().then(data => {
          const {accessToken} = data;
          const infoRequest = new GraphRequest(
            '/me',
            {
              accessToken: accessToken,
              parameters: {
                fields: {
                  string: 'id,name,email,picture.type(large),birthday',
                },
              },
            },
            async (error, result) => {
              if (error) {
                console.log('Error fetching data: ' + error.toString());
              } else {
                await updateBirthdayInSQLite();
              }
            },
          );
          new GraphRequestManager().addRequest(infoRequest).start();
        });
      } else {
        await updateBirthdayInSQLite();
      }
      Alert.alert('Notification', 'Updated successfully');
     } else {
       Alert.alert('Error', 'Unable to update user information');
    }
  };
     

  const handleChangePassword = async () => {
    const user = auth().currentUser;
    if (user) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        Alert.alert('Error', 'All fields are required');
        return;
      }
      const credentials = auth.EmailAuthProvider.credential(
        user.email,
        oldPassword,
      );
      try {
        await user.reauthenticateWithCredential(credentials);
        if (newPassword === confirmPassword) {
          await user.updatePassword(newPassword);
          Alert.alert('Success', 'You have successfully changed your password');
          setIsModalVisible(false);
        } else {
          Alert.alert(
            'Error',
            'New password and confirmation password do not match',
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Old password is incorrect');
      }
    }
  };
  

  return (
    <View style={styles.container}> 
      <Text style={styles.title}>Profile</Text>
      <Image
        style={styles.avatar}
        source={avatarSource || require('../assets/nonavatar.jpg')}
      />
      <TouchableOpacity onPress={chooseAvatar}>
        <Text style={styles.changeAvatar}>Change Profile Picture</Text>
      </TouchableOpacity>

      <View style={styles.amountBox}>
        <Text style={styles.labelAmount}>$</Text>
        <Text style={styles.viewAmount}>
          {showBalance
            ? (balance ?? 0).toFixed(0)
            : '*'.repeat((balance ?? 0).toFixed(0).length)}
        </Text>
        <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
          <Icon
            name={showBalance ? 'eye' : 'eye-slash'}
            color={'white'}
            size={20}></Icon>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsTopUpModalVisible(true)}
          style={styles.buttonAmount}>
          <Text style={styles.depositText}>Deposit</Text>
          <Icon name="credit-card" color={'white'} size={20}></Icon>
        </TouchableOpacity>
      </View>

      <TopUpModal
        userId={userId}
        visible={isTopUpModalVisible}
        onClose={() => setIsTopUpModalVisible(false)}
      />

      <View style={styles.viewTextInput}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        editable={false}
        value={auth().currentUser.email}></TextInput>
        </View>
        
        <View style={styles.viewTextInput}>
        <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        onChangeText={setDisplayName}
        value={displayName}
        editable={!loggedInWithFacebook}
      />
        </View>

        <View style={styles.viewTextInput}>
        <Text style={styles.label}>Birthday</Text>
      <TextInput
        style={styles.input}
        onChangeText={setBirthday}
        value={birthday}
        editable={!loggedInWithFacebook}
      />
        </View>
      
      {!loggedInWithFacebook && (
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveChanges}
              disabled={loggedInWithFacebook}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setIsModalVisible(true)}
              disabled={loggedInWithFacebook}>
              <Text style={styles.changePasswordButtonText}>
                Change password
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Change Password</Text>

                <Text style={styles.label}>Old Password:</Text>
                <TextInput
                  style={styles.inputChangePass}
                  onChangeText={setOldPassword}
                  value={oldPassword}
                  secureTextEntry
                />
                <Text style={styles.label}>New password:</Text>
                <TextInput
                  style={styles.inputChangePass}
                  onChangeText={setNewPassword}
                  value={newPassword}
                  secureTextEntry
                />
                <Text style={styles.label}>Confirm new password:</Text>
                <TextInput
                  style={styles.inputChangePass}
                  onChangeText={setConfirmPassword}
                  value={confirmPassword}
                  secureTextEntry
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleChangePassword}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#202934',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 70,
    marginBottom: 10,
  },
  changeAvatar: {
    color: '#a3b7d2',
    marginBottom: 30,
  },
  input: {
    height: 40,
    color: 'white',
    fontSize:15,
    fontWeight:"bold"
  },
  inputChangePass: {
    height: 40,
    color: 'black',
    fontSize:15,
    fontWeight:"bold",
    backgroundColor:"#a3b7d2",
    width:200,
    borderRadius:15,

  },
  viewTextInput:{
borderWidth:1,
height:70,
width:'90%',
marginTop:20,
borderRadius:10,
justifyContent:'flex-start',
backgroundColor:'#4f6580'
  },
  viewAmount: {
    height: 40,
    paddingHorizontal: 10,
    color: 'white',
    fontSize:13
  },
  saveButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth:1,
    borderColor:'#a3b7d2',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    color: '#a3b7d2',
    marginLeft:5,
    marginTop:5,
    fontSize:12
  },
  labelAmount: {
    fontWeight: 'bold',
    color: 'white',
    fontSize:12
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop:20
  },
  changePasswordButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  changePasswordButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'gray',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputAmount: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 15,
    backgroundColor:"#a3b7d2",
    height:50,
    borderRadius:15
  },
  buttonAmount: {
    height: 40,
    width: 100,
    marginLeft: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#a3b7d2',
    borderWidth: 1,
    borderRadius: 15,
  },
  depositText: {
    color: 'white',
    paddingRight: 5,
  },
  modalButtonsAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButtonAmount: {
    backgroundColor: '#0055a5',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexGrow: 1,
    marginRight: 5,
  },
  saveButtonTextAmount: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButtonAmount: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexGrow: 1,
    marginLeft: 5,
  },
  closeButtonTextAmount: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  amountBox: {
    flexDirection: 'row',
  },
});
export default Profile;


const handleChangePassword = async () => {
const user = auth().currentUser;
if (user) {
const credentials = auth.EmailAuthProvider.credential(
user.email,
oldPassword,
);
try {
await user.reauthenticateWithCredential(credentials);
if (newPassword === '') {
Alert.alert('Error', 'New password cannot be empty');
} else if (newPassword === confirmPassword) {
await user.updatePassword(newPassword);
Alert.alert('Success', 'You have successfully changed your password');
setIsModalVisible(false);
} else {
Alert.alert(
'Error',
'New password and confirmation password do not match',
);
}
} catch (error) {
Alert.alert('Error', 'Old password is incorrect');
}
}
};