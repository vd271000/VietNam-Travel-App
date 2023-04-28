import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import {fetchHotelDetail} from '../api';
import {useSelector, useDispatch} from 'react-redux';
import {addPurchasedHotel, removePurchasedHotel} from '../authSlice';
import {saveHotelBooking, deleteHotelBooking} from '../database';
import Swiper from 'react-native-swiper';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {colors, icons} from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';

const fetchUserBalance = async userId => {
  const userRef = database().ref(`users/${userId}/balance`);
  try {
    const snapshot = await userRef.once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error when getting balance from Realtime Database:', error);
    return null;
  }
};

const renderStars = starRating => {
  const stars = [];
  for (let i = 0; i < starRating; i++) {
    stars.push(<Image key={i} source={icons.star} style={styles.starImage} />);
  }
  return stars;
};

const HotelDetail = ({route, navigation}) => {
  const [hotelDetails, setHotelDetails] = useState(null);
  const {
    hotelId,
    checkin,
    checkout,
    numAdults,
    numChildren,
    childrenAges,
    TotalPrice,
    priceDescription,
    rateFeatures,
  } = route.params;
  const purchasedHotels = useSelector(state => state.auth.purchasedHotels);
  const hotelIsBooked = purchasedHotels.some(
    hotel => hotel.hotelId === hotelId,
  );
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.userId);
  const [userBalance, setUserBalance] = useState(0);
  const currentUser = auth().currentUser;
  const [numRooms, setNumRooms] = useState(route.params.numRooms || 1);
  const [adjustedTotalPrice, setAdjustedTotalPrice] = useState(TotalPrice);
  const [currentNumAdults, setCurrentNumAdults] = useState(
    route.params.currentNumAdults || numAdults,
  );
  const [editable, setEditable] = useState(true);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleShowMoreDescription = () => {
    setShowMoreDescription(!showMoreDescription);
  };

  useEffect(() => {
    if (hotelIsBooked) {
      setEditable(false);
    }
  }, [hotelIsBooked]);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await fetchHotelDetail(hotelId);
      if (details) {
        setHotelDetails(details);
      } else {
        console.error('Cant get hotel details from API');
      }
    };

    fetchDetails();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await fetchUserBalance(userId);
      if (balance !== null) {
        setUserBalance(balance);
      }
    };

    fetchBalance();
  }, []);

  const updateUserBalance = async (userId, newBalance) => {
    const userRef = database().ref(`users/${userId}/balance`);
    try {
      await userRef.set(newBalance);
    } catch (error) {
      console.error('Error when updating balance in Realtime Database:', error);
    }
  };

  const handleBooking = async () => {
    const currentUser = auth().currentUser;
    const userId = currentUser ? currentUser.uid : null;
    const userBalance = await fetchUserBalance(userId);

    if (userBalance === null || userBalance < adjustedTotalPrice) {
      Alert.alert(
        'Notification',
        'Your balance is not enough to book this hotel',
      );
      return;
    }
    try {
      const hotelBookingInfo = {
        ...hotelDetails,
        hotelId,
        checkin,
        checkout,
        numAdults: currentNumAdults,
        numChildren,
        childrenAges,
        TotalPrice: adjustedTotalPrice,
        priceDescription,
        rateFeatures,
        numRooms,
      };
      await saveHotelBooking(
        userId,
        hotelId,
        hotelBookingInfo,
        checkin,
        checkout,
      );
      dispatch(addPurchasedHotel(hotelBookingInfo));
      const newBalance = userBalance - adjustedTotalPrice;
      await updateUserBalance(userId, newBalance);
      Alert.alert('Notification', 'Successful hotel booking');

      navigation.navigate('Storage', hotelBookingInfo);
    } catch (error) {
      console.log('Error when booking hotel:', error);
    }
  };

  const handleCancelBooking = async () => {
    const currentUser = auth().currentUser;
    const userId = currentUser ? currentUser.uid : null;
    const userBalance = await fetchUserBalance(userId);
    const refundPercentage = rateFeatures === 'Free Cancellation' ? 1 : 0.8;
    const refundAmount = TotalPrice * refundPercentage;

    try {
      await deleteHotelBooking(userId, hotelId);
      dispatch(removePurchasedHotel(hotelId));
      const newBalance = userBalance + refundAmount;
      await updateUserBalance(userId, newBalance);
      Alert.alert(
        'Notification',
        `Cancel hotel booking successfully. Refund amount: $${refundAmount}`,
      );
      navigation.navigate('Storage');
    } catch (error) {
      console.log('Error when canceling hotel reservation:', error);
    }
  };

  const showBookingConfirmation = () => {
    Alert.alert(
      'Booking Confirmation',
      `Are you sure you want to book tickets with price ${adjustedTotalPrice}$?`,
      [
        {
          text: 'cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => handleBooking(),
        },
      ],
      {cancelable: false},
    );
  };

  const showCancellationConfirmation = () => {
    const refundPercentage = rateFeatures === 'Free Cancellation' ? 1 : 0.8;
    const refundAmount = TotalPrice * refundPercentage;
    const message =
      rateFeatures === 'Free Cancellation'
        ? `You will get a full refund. Refund amount: ${refundAmount}$`
        : `You will be deducted 20%. Refund amount: ${refundAmount}$`;

    Alert.alert(
      'Cancellation confirmation',
      `Are you sure you want to cancel your ticket? ${message}`,
      [
        {
          text: 'cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'confirm',
          onPress: () => handleCancelBooking(),
        },
      ],
      {cancelable: false},
    );
  };

  const updateNumAdults = selectedNumAdults => {
    if (selectedNumAdults >= numRooms) {
      setCurrentNumAdults(selectedNumAdults);
    } else {
      Alert.alert(
        'Notice',
        'The number of adults must not be less than the number of rooms',
      );
    }
  };

  const updateNumRooms = selectedNumRooms => {
    setNumRooms(selectedNumRooms);
    setAdjustedTotalPrice(TotalPrice * selectedNumRooms);
    if (selectedNumRooms > currentNumAdults) {
      setCurrentNumAdults(selectedNumRooms);
    }
  };

  const CounterButton = ({value, setValue, disabled}) => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          disabled={disabled}
          onPress={() => setValue(value - 1 < 1 ? 1 : value - 1)}
          style={[styles.counterButton, disabled && styles.disabled]}>
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity
          disabled={disabled}
          onPress={() => setValue(value + 1)}
          style={[styles.counterButton, disabled && styles.disabled]}>
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getTruncatedDescription = description => {
    const truncatedText = description.slice(0, 250);
    const lastSpaceIndex = truncatedText.lastIndexOf(' ');
    return truncatedText.slice(0, lastSpaceIndex);
  };

  const renderDescription = () => {
    if (showMoreDescription) {
      return (
        <>
          <Text style={styles.descriptionText}>{hotelDetails.description}</Text>
          <TouchableOpacity onPress={toggleShowMoreDescription}>
            <Text style={styles.showMoreText}>Show less</Text>
          </TouchableOpacity>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.descriptionText}>
            {getTruncatedDescription(hotelDetails.description)}...
          </Text>
          <TouchableOpacity onPress={toggleShowMoreDescription}>
            <Text style={styles.showMoreText}>Show more</Text>
          </TouchableOpacity>
        </>
      );
    }
  };

  const formatDateTime = date => {
    if (!date) return '';
    const dateTime = new Date(date);
    return dateTime.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDaysBetween = (checkin, checkout) => {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const differenceInTime = checkoutDate.getTime() - checkinDate.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  return (
    <ScrollView style={styles.container}>
      {hotelDetails ? (
        <>
          <Swiper
            autoplay={true}
            autoplayTimeout={10}
            loop={true}
            showsPagination={false}
            height={250}
            activeDotColor="transparent"
            dotColor="transparent"
            smoothTransition={true}>
            {hotelDetails.imageUrls.map((imageUrl, index) => (
              <Image
                key={index}
                source={{uri: imageUrl}}
                style={styles.hotelImage}
              />
            ))}
          </Swiper>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{hotelDetails.hotelName}</Text>
            <Text style={styles.hotelAddress}>{hotelDetails.address}</Text>
            <Text style={styles.hotelAddress}>
              {priceDescription || ''} / room
            </Text>
            <View style={styles.starRating}>
              {renderStars(hotelDetails.starRating)}
            </View>
          </View>

          <View style={styles.viewDes}>
            <Text style={styles.sectionTitle}>Description</Text>
            {renderDescription()}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <FlatList
              data={hotelDetails.amenitiesV2.flatMap(
                category => category.items,
              )}
              renderItem={({item}) => (
                <View style={styles.amenityItemContainer}>
                  <Text style={styles.amenityItem}>{item.description}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking information</Text>
            <View style={styles.viewCheckDate}>
              <Text style={styles.bookingInfo}>
                {formatDateTime(checkin)} - {hotelDetails.checkinTime}
              </Text>
              <View style={styles.rowDate}>
                <Text style={styles.daysBetween}>
                  {calculateDaysBetween(checkin, checkout)}
                </Text>
                <Icon name="moon" size={12} color={colors.inactive}></Icon>
              </View>
              <Text style={styles.bookingInfo}>
                {formatDateTime(checkout)} - {hotelDetails.checkoutTime}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleModal}
              disabled={!editable || hotelIsBooked}>
              <View style={styles.viewCheckDate}>
                <Text style={styles.bookingInfo}>
                  Adult: {currentNumAdults}
                </Text>
                <Text style={styles.bookingInfo}>Room: {numRooms}</Text>
              </View>
            </TouchableOpacity>
            {numChildren > 0 && (
              <View style={styles.row}>
                <Text style={styles.bookingInfo}>Children: </Text>
                <Text style={styles.counterValue}>{numChildren}</Text>
              </View>
            )}
            {childrenAges && childrenAges.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.bookingInfo}>
                  Average age of children:{' '}
                </Text>
                <Text style={styles.counterValue}>
                  {childrenAges.join(', ')}
                </Text>
              </View>
            )}
            {rateFeatures && rateFeatures.length > 0 && (
              <Text style={styles.bookingInfo}>Services: {rateFeatures}</Text>
            )}
            <Text style={styles.price}>
              Price: {adjustedTotalPrice || ''} $
            </Text>

            {hotelIsBooked ? (
              <TouchableOpacity
                style={styles.cancelBookingButton}
                onPress={showCancellationConfirmation}>
                <Text style={styles.cancelBookingButtonText}>
                  Cancel Booking
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.bookingButton}
                onPress={showBookingConfirmation}>
                <Text style={styles.bookingButtonText}>Book Now</Text>
              </TouchableOpacity>
            )}

            {showModal && (
              <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={toggleModal}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View style={styles.row}>
                      <Text style={styles.bookingInfo}>Adult: </Text>
                      <CounterButton
                        value={currentNumAdults}
                        setValue={updateNumAdults}
                        disabled={!editable || hotelIsBooked}
                      />
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.bookingInfo}>Room: </Text>
                      <CounterButton
                        value={numRooms}
                        setValue={updateNumRooms}
                        disabled={!editable || hotelIsBooked}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={toggleModal}
                      style={styles.modalButton}>
                      <Text style={styles.modalButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        </>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  hotelInfo: {
    alignItems: 'center',
    paddingTop: 10,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary1,
  },
  hotelAddress: {
    fontSize: 14,
    marginTop: 5,
    color: colors.primary1,
  },
  starRating: {
    fontSize: 18,
    marginTop: 10,
    color: '#000000',
    flexDirection: 'row',
  },
  starImage: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  viewDes: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  amenities: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  amenityCategory: {
    width: '48%',
    marginBottom: 15,
  },
  amenityCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  bookingInfo: {
    marginTop: 10,
    color: 'black',
  },
  hotelImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000000',
  },
  checkinTime: {
    fontSize: 14,
    marginTop: 5,
    color: '#000000',
  },
  amenityItemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  amenityItem: {
    fontSize: 14,
    color: '#000000',
  },
  descriptionText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  showMoreText: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'right',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  bookingButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  cancelBookingButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  bookingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelBookingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  counterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  disabled: {
    backgroundColor: '#BDBDBD',
  },
  counterButtonText: {
    fontSize: 18,
    color: colors.primary,
  },
  counterValue: {
    fontSize: 18,
    color: '#000000',
    paddingHorizontal: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewCheckDate: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  rowDate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysBetween: {
    fontSize: 12,
    color: 'black',
  },
  price: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HotelDetail;
