import React, {useCallback} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, icons, images} from '../../constants';
import {useSelector} from 'react-redux';

const OptionItem = ({icon, bgColor, label, onPress}) => {
  return (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={styles.optionIconWrapper}>
        <LinearGradient
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 15,
          }}
          colors={bgColor}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}>
          <Image
            source={icon}
            resizeMode="cover"
            style={styles.optionIcon}></Image>
        </LinearGradient>
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const HomePage = ({navigation, route}) => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  const handleHotelPress = useCallback(() => {
    if (isLoggedIn) {
      navigation.navigate('Hotel');
    } else {
      Alert.alert(
        'Login required',
         'Please login to book a hotel search',
         [
           {
             text: 'Login',
             onPress: () => navigation.navigate('Settings'),
           },
           {
             text: 'Cancel',
             style: 'cancel',
          },
        ],
      );
    }
  }, [navigation, isLoggedIn]);

  const handleFlightPress = useCallback(() => {
    if (isLoggedIn) {
      navigation.navigate('Flight');
    } else {
      Alert.alert(
        'Login required',
         'Please login to book flight tickets.',
         [
           {
             text: 'Login',
             onPress: () => navigation.navigate('Settings'),
           },
           {
             text: 'Cancel',
             style: 'cancel',
          },
        ],
      );
    }
  }, [navigation, isLoggedIn]);

  const handleCarPress = useCallback(() => {
    if (isLoggedIn) {
      navigation.navigate('Car');
    } else {
      Alert.alert('Login required', 'Please login to rent a car', [
        {
          text: 'Login',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    }
  }, [navigation, isLoggedIn]);

  const handleRestaurantPress = useCallback(() => {
      navigation.navigate('Restaurant');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View>
        <Image source={images.vn} style={styles.backgroundImage} />
      </View>
      <View style={styles.optionsWrapper}>
        <OptionItem
          icon={icons.hotel}
          bgColor={['#3587a4', '#1565c0']}
          label="Booking Hotel"
          onPress={handleHotelPress}
        />
        <OptionItem
          icon={icons.flight}
          bgColor={['#46aeff', '#5884ff']}
          label="Ticket Flight"
          onPress={handleFlightPress}
        />
        <OptionItem
          icon={icons.car}
          bgColor={['#e973ad', '#da5df2']}
          label="Rental Car"
          onPress={handleCarPress}
        />
        <OptionItem
          icon={icons.restaurant}
          bgColor={['#fcaba8', '#fe6bba']}
          label="Restaurant"
          onPress={handleRestaurantPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundImage: {
    width: '100%',
    height: '50%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  optionsWrapper: {
    position: 'absolute',
    top: '45%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: '10%',
  },
  optionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    height: '20%',
    margin: '5%',
    marginBottom: 60,
  },
  optionIconWrapper: {
    width: 80,
    height: 80,
  },
  optionIcon: {
    tintColor: 'white',
    width: 40,
    height: 40,
  },
  optionLabel: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomePage;
