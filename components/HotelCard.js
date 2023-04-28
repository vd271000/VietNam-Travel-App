import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const HotelCard = ({ hotel }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: hotel.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.address}>{hotel.address}</Text>
        <Text style={styles.price}>${hotel.price}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 100,
    height: 100,
  },
  infoContainer: {
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#777',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HotelCard;
