import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {colors} from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';

function DestinationDetail({navigation, route}) {
  const destination = route.params.destination;

  if (!destination) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1,
        }}>
        <Icon
          onPress={() => navigation.goBack()}
          name="chevron-left"
          size={20}
          color={colors.primary}></Icon>
      </View>

      <ScrollView style={styles.container}>
        <View style={{flex: 1}}>
          <Image
            source={{uri: destination.url}}
            resizeMode="cover"
            style={{
              width: '100%',
              height: 250,
            }}
          />
          <Text
            style={{
              color: 'black',
              justifyContent: 'center',
              alignSelf: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              marginTop: 20,
            }}>
            {destination.name}
          </Text>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={{color: 'black'}}>{destination.description}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={{color: 'black'}}>{destination.address}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <Text style={{color: 'black'}}>
              {destination.rating} / {destination.num_reviews} Reviews
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Opening hours</Text>
            {destination.hours?.map((day, index) => {
              const openTime = `${String(day[0]?.open_time).padStart(4, '0')}`;
              const closeTime = `${String(day[0]?.close_time).padStart(
                4,
                '0',
              )}`;
              const daysOfWeek = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ];
              const dayOfWeek = daysOfWeek[index];

              const dtf = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Ho_Chi_Minh',
                hour: 'numeric',
                minute: 'numeric',
              });

              const formattedOpenTime = dtf.format(
                new Date(
                  `2023-01-01T${openTime.slice(0, 2)}:${openTime.slice(2)}:00`,
                ),
              );
              const formattedCloseTime = dtf.format(
                new Date(
                  `2023-01-01T${closeTime.slice(0, 2)}:${closeTime.slice(
                    2,
                  )}:00`,
                ),
              );

              return (
                <Text key={dayOfWeek} style={{color: 'black'}}>
                  {dayOfWeek}: {formattedOpenTime} - {formattedCloseTime}
                </Text>
              );
            })}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={{color: 'black'}}>{destination.open_now_text}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ranking</Text>
            <Text style={{color: 'black'}}>{destination.ranking}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Fee</Text>
            <Text style={{color: 'black'}}>
              {destination.fee ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  sectionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default DestinationDetail;
