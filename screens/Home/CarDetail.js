import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {addPurchasedCar, removePurchasedCar} from '../authSlice';
import {saveCarBooking, deleteCarBooking} from '../database';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {colors} from '../../constants';

const fetchUserBalance = async userId => {
  const userRef = database().ref(`users/${userId}/balance`);
  try {
    const snapshot = await userRef.once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error retrieving balance from Realtime Database:', error);
    return null;
  }
};

const updateUserBalance = async (userId, newBalance) => {
  try {
    await database().ref(`users/${userId}`).update({balance: newBalance});
  } catch (error) {
    console.error('Error updating balance in Realtime Database:', error);
  }
};

const CarDetail = ({route, navigation}) => {
  const {quote, groups} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState({});
  const pickupAddress = addresses[quote.id]?.pickupAddress || 'Loading...';
  const dropoffAddress = addresses[quote.id]?.dropoffAddress || 'Loading...';
  const officeAddress = addresses[quote.id]?.officeAddress || 'Loading...';
  const [isBooked, setIsBooked] = useState(false);
  const currentUser = auth().currentUser;
  const userId = currentUser ? currentUser.uid : null;
  const purchasedCars = useSelector(state => state.auth.purchasedCars);

  useEffect(() => {
    if (purchasedCars.some(car => car.id === quote.id)) {
      setIsBooked(true);
    } else {
      setIsBooked(false);
    }
  }, [purchasedCars, quote.id]);

  const handleConfirmBookCar = async () => {
    Alert.alert(
      isBooked ? 'Car cancellation confirmation' : 'Car booking confirmation',
      isBooked
        ? `Are you sure you want to cancel the car ${quote.car_name}? ${
            quote.adds.free_cancel
              ? 'Vehicles are free to cancel.'
              : 'You have been charged 50% of your booking amount because the car is not free to cancel.'
          }`
        : `Are you sure you want to order car ${quote.car_name} for ${quote.price}$?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Operation canceled'),
          style: 'cancel',
        },
        {
          text: isBooked ? 'Cancel car' : 'Book a car',
          onPress: () => handleBookCar(),
        },
      ],
      {cancelable: false},
    );
  };

  const handleBookCar = async () => {
    const currentBalance = await fetchUserBalance(userId);
    if (currentBalance === null) {
      Alert.alert(
        'Error',
        'Unable to retrieve balance information, please try again.',
      );
      return;
    }
    if (isBooked) {
      let refundAmount = quote.price;
      if (!quote.adds.free_cancel) {
        const refundAmount = quote.price * 0.5;
        const newBalance = currentBalance + refundAmount;
        await updateUserBalance(userId, newBalance);
      }
      const newBalance = currentBalance + refundAmount;
      await updateUserBalance(userId, newBalance);
      dispatch(removePurchasedCar(quote.id));
      await deleteCarBooking(userId, quote.guid);
    } else {
      if (currentBalance < quote.price) {
        Alert.alert('Error', 'Balance is not enough for booking.');
        return;
      }
      const carToPurchase = {
        id: `${quote.guid}`,
        name: quote.car_name,
        ...quote,
        ...groups,
        pickupAddress: pickupAddress,
        free_cancel: quote.adds.free_cancel,
      };
      try {
        await saveCarBooking(userId, carToPurchase);
        dispatch(addPurchasedCar(carToPurchase));
        const newBalance = currentBalance - quote.price;
        await updateUserBalance(userId, newBalance);
        navigation.navigate('Storage');
      } catch (error) {
        console.log('Order error:', error);
      }
    }
  };

  const showGroupDetails = groupId => {
    const group = groups.find(g => g.id === groupId);
    setSelectedGroup(group);
    setModalVisible(true);
  };

  async function getAddressFromCoordinates(lat, lon) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en`,
    );
    const data = await response.json();
    return data.display_name;
  }

  const fetchAddresses = async () => {
    const newAddresses = {};

    const pickupCoordinates = quote.pu.split(',');
    const dropoffCoordinates = quote.do.split(',');
    const officeCoordinates = quote.office_id.split(',');

    const pickupAddress = await getAddressFromCoordinates(
      pickupCoordinates[0],
      pickupCoordinates[1],
    );
    const dropoffAddress = await getAddressFromCoordinates(
      dropoffCoordinates[0],
      dropoffCoordinates[1],
    );
    const officeAddress = await getAddressFromCoordinates(
      officeCoordinates[0],
      officeCoordinates[1],
    );

    newAddresses[quote.id] = {pickupAddress, dropoffAddress, officeAddress};

    setAddresses(newAddresses);
  };

  useEffect(() => {
    fetchAddresses();
  }, [quote]);

  const fuelPolicy = {
    full_to_full: 'full fuel tank',
    pre_purchase_with_partial_refund: 'Buy in advance with partial refund',
  };
  const fuelPolicyText = fuelPolicy[quote.fuel_pol] || quote.fuel_pol;

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.nameCar}>Vehicle Details: {quote.car_name}</Text>
        <Text style={styles.label}>
          Provider: {quote.vndr}({quote.prv_id})
        </Text>
        <Text style={styles.label}>Fuel Policy: {fuelPolicyText}</Text>
        <Text style={styles.label}>Vehicle Type: {quote.sipp}</Text>
        <Text style={styles.label}>Pickup Method: {quote.pickup_method}</Text>
        <Text style={styles.label}>
          Free Cancellation: {quote.adds.free_cancel ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.label}>
          Unlimited mileage: {quote.unlim_mlg ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.label}>
          Included mileage:{' '}
          {quote.incl_mlg
            ? `${quote.incl_mlg.dist} ${quote.incl_mlg.unit}`
            : 'Loading...'}
        </Text>

        <Text style={styles.label}>Score: {quote.score}</Text>
        <Text style={styles.label}>New Score: {quote.new_score}</Text>
        <Text style={styles.label}>Number of Bags: {quote.bags}</Text>
        <View style={styles.row}></View>

        <Text style={styles.label}>Pickup Address: {pickupAddress}</Text>
        <View style={styles.row}></View>

        <Text style={styles.label}>Dropoff Address: {dropoffAddress}</Text>
        <View style={styles.row}></View>

        <Text style={styles.label}>Office: {officeAddress}</Text>
        <View style={styles.row}></View>

        <View style={styles.containerPrice}>
          <TouchableOpacity style={styles.groupToch}>
            <Text
              onPress={() => showGroupDetails(quote.group)}
              style={{color: 'black', alignSelf: 'center', paddingTop: 3}}>
              Group: {quote.group}
            </Text>
          </TouchableOpacity>
          <Text style={styles.labelPrice}>${quote.price}</Text>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {selectedGroup && (
                <>
                  <Text>Tên nhóm: {selectedGroup.id}</Text>
                  <Text>Tên xe: {selectedGroup.car_name}</Text>
                  <Text>
                    Air Conditioning: {selectedGroup.ac ? 'Yes' : 'No'}
                  </Text>
                  <Text>Ảnh: {selectedGroup.img}</Text>
                  <Text>Điểm cao nhất: {selectedGroup.max_score}</Text>
                  <Text>Số ghế tối đa: {selectedGroup.max_seats}</Text>
                  <Text>Giá thấp nhất: {selectedGroup.min_price}</Text>
                  <Text>Giá trung bình: {selectedGroup.mean_price}</Text>
                  <Text>Số cửa: {selectedGroup.doors}</Text>
                  <Text>Túi khí tối đa: {selectedGroup.max_bags}</Text>
                  <Text>Chuyển động: {selectedGroup.trans}</Text>
                  <Text>Lớp: {selectedGroup.cls}</Text>
                </>
              )}
              <TouchableOpacity
                style={{...styles.openButton, backgroundColor: '#2196F3'}}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}>
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={[
            styles.bookButton,
            {backgroundColor: isBooked ? 'red' : colors.primary},
          ]}
          onPress={() => {
            handleConfirmBookCar();
          }}>
          <Text style={styles.textStyle}>
            {isBooked ? 'Cancel car' : 'Book car'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  bookButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 20,
    marginHorizontal: 30,
    height: 50,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'gray',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 19,
  },
  nameCar: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  row: {
    backgroundColor: 'gray',
    height: 1,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  label: {
    color: 'black',
    fontSize: 15,
  },
  containerPrice: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  groupToch: {
    backgroundColor: colors.primary1,
    width: 200,
    height: 30,
    borderRadius: 10,
  },
  labelPrice: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CarDetail;
