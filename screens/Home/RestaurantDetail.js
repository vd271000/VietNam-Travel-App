import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Alert} from 'react-native';

const RestaurantDetail = ({route}) => {
  const {restaurant} = route.params;

  const handlePhonePress = () => {
    if (restaurant.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleEmailPress = () => {
    if (restaurant.email) {
      Linking.openURL(`mailto:${restaurant.email}`);
    } else {
      Alert.alert('Error', 'Email not available');
    }
  };

  const renderOpeningHours = () => {
    if (!restaurant.hours || !restaurant.hours.week_ranges) {
      return <Text style={styles.detailsText}>Hours not available</Text>;
    }

    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    return daysOfWeek.map((day, index) => {
      const dayRange = restaurant.hours.week_ranges[index];
      if (!dayRange) {
        return null;
      }
      return (
        <View key={index} style={styles.openingHoursRow}>
          <Text style={styles.detailsText}>{day}:</Text>
          <Text style={styles.detailsText}>
            {dayRange.map((timeRange, i) => {
              const openTime = `${
                Math.floor(timeRange.open_time / 60) % 12 || 12
              }:${(timeRange.open_time % 60).toString().padStart(2, '0')} ${
                timeRange.open_time >= 720 ? 'PM' : 'AM'
              }`;
              const closeTime = `${
                Math.floor(timeRange.close_time / 60) % 12 || 12
              }:${(timeRange.close_time % 60).toString().padStart(2, '0')} ${
                timeRange.close_time >= 720 ? 'PM' : 'AM'
              }`;
              return (
                <Text key={i}>
                  {openTime} - {closeTime}
                  {i !== dayRange.length - 1 ? ', ' : ''}
                </Text>
              );
            })}
          </Text>
        </View>
      );
    });
  };

  if (!restaurant) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        style={styles.restaurantImage}
        source={{
          uri: restaurant.photo.images.large.url,
        }}
      />
      <Text style={styles.restaurantName}>{restaurant.name}</Text>
      <Text style={styles.detailsText}>Reviews: {restaurant.num_reviews}</Text>
      <Text style={styles.detailsText}>Ranking: {restaurant.ranking}</Text>
      <Text style={styles.detailsText}>Rating: {restaurant.rating}</Text>
      <Text style={styles.detailsText}>Status: {restaurant.open_now_text}</Text>
      {restaurant.price && (
        <Text style={styles.detailsText}>Price: {restaurant.price}</Text>
      )}
      <Text style={styles.detailsText}>{restaurant.description}</Text>

      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <Text style={styles.detailsText}>Phone: {restaurant.phone}</Text>
        <TouchableOpacity onPress={handlePhonePress}>
          <Icon name="phone" size={30} color={'black'} />
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <Text style={styles.detailsText}>Email: {restaurant.email}</Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Icon name="envelope" size={30} color={'black'} />
        </TouchableOpacity>
      </View>
      <Text style={styles.detailsText}>Address: {restaurant.address}</Text>
      <Text style={styles.detailsText}>Opening Hours:</Text>
      {renderOpeningHours()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  restaurantImage: {
    width: '100%',
    height: 250,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: 'black',
  },
  detailsText: {
    fontSize: 16,
    paddingHorizontal: 10,
    marginVertical: 5,
    color: 'black',
  },
  openingHoursRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
});

export default RestaurantDetail;
