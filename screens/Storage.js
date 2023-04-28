import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors} from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';

function Storage({navigation}) {
  const purchasedHotels = useSelector(state => state.auth.purchasedHotels);
  const purchasedFlights = useSelector(state => state.auth.purchasedFlights);
  const purchasedCars = useSelector(state => state.auth.purchasedCars);

  useEffect(() => {
    navigation.addListener('focus', () => {});
  }, [navigation]);

  useEffect(() => {
    if (purchasedFlights && purchasedFlights.length > 0) {
      AsyncStorage.setItem(
        'purchasedFlights',
        JSON.stringify(purchasedFlights),
      );
    } else {
      AsyncStorage.removeItem('purchasedFlights');
    }
  }, [purchasedFlights]);

  useEffect(() => {
    const updateAsyncStorage = async () => {
      await AsyncStorage.setItem(
        'purchasedFlights',
        JSON.stringify(purchasedFlights),
      );
    };

    if (purchasedFlights && purchasedFlights.length > 0) {
      updateAsyncStorage();
    } else {
      AsyncStorage.removeItem('purchasedFlights');
    }
  }, [purchasedFlights]);

  const purchasedItems = [
    ...(purchasedHotels ?? []).map(item => ({
      ...item,
      type: 'hotel',
      searchInfo: {checkIn: item.checkIn, checkOut: item.checkOut},
    })),
    ...(purchasedFlights ?? []).map(item => ({...item, type: 'flight'})),
    ...(purchasedCars ?? []).map(item => ({...item, type: 'car'})),
  ];

  function handlePurchasedItemPress(item) {
    switch (item.type) {
      case 'hotel':
        navigation.navigate('HotelDetail', {
          hotelId: item.hotelId,
          checkin: item.checkin,
          checkout: item.checkout,
          numAdults: item.numAdults,
          numChildren: item.numChildren,
          childrenAges: item.childrenAges,
          TotalPrice: item.TotalPrice,
          priceDescription: item.priceDescription,
          rateFeatures: item.rateFeatures,
          numRooms: item.numRooms,
          currentNumAdults: item.numAdults,
        });
        break;
      case 'flight':
        navigation.navigate('FlightDetails', {
          itineraryId: item.itineraryId,
          legs: item.legs,
          adults: item.adults,
          currency: item.currency,
          countryCode: item.countryCode,
          market: item.market,
          selectedLegIndex: item.selectedLegIndex,
        });
        break;
      case 'car':
        navigation.navigate('CarDetail', {
          quote: item,
          groups: item.groups,
          selectedGroup: item.selectedGroup,
        });
        break;
      default:
        break;
    }
  }
  return (
    <View style={styles.viewStorage}>
      <Text style={styles.headerContainer}>
        Hotel Booking - Air Ticket - Car Rental
      </Text>
      <FlatList
        data={purchasedItems}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              handlePurchasedItemPress(item);
            }}>
            {renderItemContent(item)}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item.id || String(index)}
        ListEmptyComponent={
          <View
            style={{
              alignSelf: 'center',
              justifyContent: 'center',
              paddingTop: 300,
            }}>
            <Image
              source={require('../assets/send.png')}
              style={{height: 100, width: 100, alignSelf: 'center'}}></Image>
            <Text style={styles.headerText}>Nothing has been booked yet</Text>
          </View>
        }
      />
    </View>
  );
}

function renderItemContent(item) {
  if (!item) {
    return null;
  }

  function renderStars(rating) {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push('⭐');
    }
    return stars.join(' ');
  }

  const formatDateTime = date => {
    if (!date) return '';
    const dateTime = new Date(date);
    return dateTime.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  switch (item.type) {
    case 'hotel':
      return (
        <View>
          <View style={styles.row}>
          <Icon name='hotel' color={colors.primary1} size={17} style={{marginRight:5}}></Icon>
          <Text style={styles.header}>Booking Hotel</Text>
          </View>
          <Text style={styles.bookingInfoHeader}>
            {item.hotelName} {renderStars(item.starRating)}
          </Text>
          <Text style={styles.bookingInfo}>Address: {item.address}</Text>

          <Text style={styles.bookingInfo}>
            {formatDateTime(item.checkin)} - {item.checkinTime} →{' '}
            {formatDateTime(item.checkout)} - {item.checkoutTime}
          </Text>
        </View>
      );
    case 'flight':
      return (
        <View>
          <View style={styles.row}>
          <Icon name='plane' color={colors.primary1} size={17} style={{marginRight:5}}></Icon>
          <Text style={styles.header}>Tickets Flight</Text>
          </View>
          <Text style={styles.bookingInfoHeader}>
            {item.marketingCarrier?.name || 'Unknown'}
          </Text>
          <Text style={styles.bookingInfo}>
            {item.origin?.city} ({item.origin?.displayCode}) →{' '}
            {item.destination?.city} ({item.destination?.displayCode})
          </Text>
          <Text style={styles.bookingInfo}>
            Departure Flight:{' '}
            {new Date(item.departure).toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Text>
        </View>
      );
    case 'car':
      return (
        <View>
          <View style={styles.row}>
          <Icon name='car' color={colors.primary1} size={17} style={{marginRight:5}}></Icon>
          <Text style={styles.header}>Rental Car</Text>
          </View>
          <Text style={styles.bookingInfoHeader}>{item.name}</Text>
          <Text style={styles.bookingInfo}>
            Free Cancellation: {item.free_cancel ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.bookingInfo}>
            Pickup Address: {item.pickupAddress}
          </Text>
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  header: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 17,
    alignSelf: 'center',
  },
  row:{
flexDirection:'row',
alignItems:"center",
justifyContent:'center'
  },
  item: {
    padding: 10,
    backgroundColor: '#EDEDED',
    marginBottom: 10,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
  },
  itemText: {
    fontSize: 16,
    color: 'black',
  },
  tabBar: {
    backgroundColor: 'white',
  },
  label: {
    color: 'black',
    fontSize: 14,
  },
  indicator: {
    backgroundColor: 'black',
    height: 2,
  },
  bookingInfo: {
    color: 'black',
  },
  bookingInfoHeader: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    color: 'black',
    fontSize: 25,
    marginTop: 20,
  },
  viewStorage: {
    flex: 1,
  },
  headerContainer: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default Storage;
