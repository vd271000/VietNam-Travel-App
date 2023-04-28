import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {fetchFlightDetails} from '../api';
import {saveBookingToFirebase, deleteBookingFlight} from '../database';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {addPurchasedFlight, removePurchasedFlight} from '../authSlice';
import database from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome5';
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
  const userRef = database().ref(`users/${userId}/balance`);
  try {
    await userRef.set(newBalance);
  } catch (error) {
    console.error('Error updating balance in Realtime Database:', error);
  }
};

const FlightDetails = ({route, navigation}) => {
  const [flightDetails, setFlightDetails] = useState(null);
  const dispatch = useDispatch();
  const [purchased, setPurchased] = useState(false);
  const purchasedFlights = useSelector(state => state.auth.purchasedFlights);
  const [userBalance, setUserBalance] = useState(0);
  const currentUser = auth().currentUser;
  const userId = currentUser ? currentUser.uid : null;
  const [price, setPrice] = useState(null);
  const [selectedLegIndex, setSelectedLegIndex] = useState(
    route.params.selectedLegIndex,
  );

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await fetchUserBalance(userId);
      if (balance !== null) {
        setUserBalance(balance);
      }
    };

    fetchBalance();
  }, []);

  const checkFlightPurchased = purchasedFlights => {
    const found = purchasedFlights.some(
      flight => flight.itineraryId === route.params.itineraryId,
    );
    setPurchased(found);
  };

  async function saveTicketToAsyncStorage(newTicket) {
    const userTicketsStr = await AsyncStorage.getItem('users');
    let users = {
      purchasedHotels: [],
      purchasedFlights: [],
      purchasedCars: [],
    };
    if (userTicketsStr) {
      users = JSON.parse(userTicketsStr);
    } else {
      await AsyncStorage.setItem('users', JSON.stringify(users));
    }
    if (!users.purchasedFlights) {
      users.purchasedFlights = [];
    }
    users.purchasedFlights.push(newTicket);
    await AsyncStorage.setItem('users', JSON.stringify(users));
  }
  
  const handleButtonPress = async index => {
    const itineraryId = route.params.itineraryId;
    const currentUser = auth().currentUser;
    const userId = currentUser ? currentUser.uid : null;
    if (purchased) {
      Alert.alert('Confirm', 'Are you sure you want to cancel your booking?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Agree',
          onPress: async () => {
            const flightToRemove = purchasedFlights.find(
              flight => flight.itineraryId === itineraryId,
            );
            const refundAmount = price * 0.7;
            const newBalance = userBalance + refundAmount;
            await updateUserBalance(userId, newBalance);
            setUserBalance(newBalance);
            if (flightToRemove) {
              dispatch(
                removePurchasedFlight({
                  itineraryId: flightToRemove.itineraryId,
                }),
              );
            }
            await deleteBookingFlight(userId, itineraryId);
            Alert.alert(
              'Refund successful',
              `You have been refunded ${refundAmount} to your account balance. Tickets have been deducted 30% of the value.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    Alert.alert(
                      'Success',
                      'You have successfully canceled your ticket!',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            navigation.navigate('Storage');
                          },
                        },
                      ],
                    );
                  },
                },
              ],
            );
          },
        },
      ]);
      return;
    }
    const purchasedFlight = {
      ...flightDetails.data.legs[index],
      itineraryId: route.params.itineraryId,
      legs: route.params.legs,
      adults: route.params.adults,
      currency: route.params.currency,
      countryCode: route.params.countryCode,
      market: route.params.market,
      marketingCarrier:
        flightDetails.data.legs[index].segments[0].marketingCarrier,
      selectedLegIndex,
    };
    const newBalance = userBalance - price;
    await updateUserBalance(userId, newBalance);
    setUserBalance(newBalance);
    await saveBookingToFirebase(userId, purchasedFlight);
    await saveTicketToAsyncStorage(purchasedFlight);
    const updatedFlight = {
      ...purchasedFlight,
      itineraryId,
    };
    dispatch(addPurchasedFlight(updatedFlight));
    Alert.alert('Success', 'You have successfully booked!', [
      {
        text: 'OK',
        onPress: () => {
          navigation.navigate('Storage');
        },
      },
    ]);
    setPurchased(true);
  };

  const handleBooking = async () => {
    if (!purchased) {
      if (userBalance >= price) {
        handleButtonPress(selectedLegIndex);
      } else {
        Alert.alert(
          'Balance is insufficient',
          'Please add more money to your account.',
        );
      }
    } else {
      handleButtonPress(selectedLegIndex);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await fetchFlightDetails(
          route.params.itineraryId,
          route.params.legs,
          route.params.adults,
          route.params.currency,
          route.params.countryCode,
          route.params.market,
          route.params.pricingOptions,
          selectedLegIndex,
        );
        setFlightDetails(details);
        setPrice(details.data.pricingOptions[0].agents[0].price);
      } catch (error) {
        console.error('Error finding flight details:', error);
      }
    };

    const onDataChange = async () => {
      const userTicketsStr = await AsyncStorage.getItem('users');
      const users = JSON.parse(userTicketsStr);
      checkFlightPurchased(users.purchasedFlights || []);
    }; 
      fetchDetails();
      onDataChange();
    const unsubscribe = navigation.addListener('focus', onDataChange);

    return () => {
      unsubscribe();
    };
  }, [selectedLegIndex]);

  const renderLegDetails = (leg, index) => {
    if (index !== selectedLegIndex) {
      return null;
    }
    const {origin, destination, segments} = leg;
    const segment = segments[0];
    const {marketingCarrier, duration, departure, arrival, flightNumber} =
      segment;
    const pricingOption = flightDetails.data.pricingOptions[0].agents[0];
    const ratingValue = pricingOption?.rating?.value ?? '';
    const ratingCount = pricingOption?.rating?.count ?? '';
    const price = pricingOption?.price ?? '';
    return (
      <View key={index}>
        <View style={styles.detailContainer}>
          <View style={styles.viewCity}>
            <View>
              <Text style={styles.textCity}>
                {origin.city}({origin.displayCode})
              </Text>
              <Text style={styles.textDate}>
                {new Date(departure).toLocaleString('vi-VN')}
              </Text>
            </View>
            <View>
              <Icon name="arrow-right" color={'black'} size={20}></Icon>
              <Text style={styles.textDate}>
                {Math.floor(duration / 60)}h{duration % 60}'
              </Text>
            </View>
            <View>
              <Text style={styles.textCity}>
                {destination.city}({destination.displayCode})
              </Text>
              <Text style={styles.textDate}>
                {new Date(arrival).toLocaleString('vi-VN')}
              </Text>
            </View>
          </View>

          <View style={styles.row}></View>

          <View style={styles.viewFlight}>
            <View>
              <Text style={styles.textFlight}>{marketingCarrier.name}</Text>
              <Text style={styles.textDate}>{flightNumber}</Text>
            </View>
            <View style={{marginBottom: 5, marginLeft: 5}}>
              <Image
                source={{uri: marketingCarrier.logo}}
                style={{width: 50, height: 25}}
              />
            </View>
            <Text style={styles.textPrice}>${price}</Text>
          </View>
          <Text style={styles.textDate}>7kg hand baggage</Text>
          <Text style={styles.textFee}>
            Ticket cancellation support (30% fee)
          </Text>
        </View>
        <TouchableOpacity style={styles.buttonContainer}>
          <Button
            title={
              purchased ? 'Cancel Flight booking' : 'Flight ticket booking'
            }
            onPress={handleBooking}
            color={purchased ? 'red' : colors.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {flightDetails && (
        <>
          <Text style={styles.title}>Flight details</Text>
          {flightDetails.data.legs.map((leg, index) =>
            renderLegDetails(leg, index),
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
    color: 'black',
  },
  detailContainer: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  viewCity: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  viewFlight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textCity: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
  },
  textDate: {
    color: 'black',
    fontSize: 12,
  },
  textFlight: {
    color: 'black',
    fontSize: 13,
    fontWeight: 'bold',
  },
  textFee: {
    color: 'red',
    fontSize: 12,
  },
  textPrice: {
    color: 'red',
    fontSize: 17,
    alignSelf: 'flex-end',
    marginLeft: 100,
  },
  row: {
    width: '90%',
    height: 1,
    alignSelf: 'center',
    backgroundColor: 'gray',
  },
  buttonContainer: {
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default FlightDetails;
