import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Modal,
  Image,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {fetchHotels} from '../api';
import DateTimePicker from '@react-native-community/datetimepicker';
import {initializeApp} from '@react-native-firebase/app';
import {firebase} from '@react-native-firebase/auth';
import {colors} from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';

if (!firebase.apps.length) {
  initializeApp(firebaseConfig);
}

const Hotel = ({navigation}) => {
  const [selectedCity, setSelectedCity] = useState('27546329');
  const [modalVisible, setModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState(null);
  const [starRating, setStarRating] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [guestRating, setGuestRating] = useState(null);
  const [guestType, setGuestType] = useState(null);
  const [cancellationPolicy, setCancellationPolicy] = useState(null);
  const [propertyType, setPropertyType] = useState(null);
  const [discounts, setDiscounts] = useState(null);
  const [checkIn, setCheckIn] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  );
  const [showDatePicker1, setShowDatePicker1] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState([]);
  const [bookedHotels, setBookedHotels] = useState([]);

  const cityList = [
    {label: 'Ho Chi Minh', value: '27546329'},
    {label: 'Ha Noi', value: '27541992'},
    {label: 'Da Nang', value: '27540669'},
    {label: 'Can Tho', value: '39579168'},
    {label: 'Phu Quoc', value: '39563609'},
    {label: 'Hoi An - Quang Nam', value: '39563535'},
    {label: 'Dalat', value: '27540754'},
    {label: 'Nha Trang', value: '27540641'},
    {label: 'Sa Pa', value: '39585716'},
    {label: 'Vung Tau', value: '129052005'},
  ];

  const renderStars = numStars => {
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push(
        <Icon key={i} name="star" solid size={14} color={'#FFD700'} />,
      );
    }
    return stars;
  };

  const showDatePicker = (currentDate, setDate, show, setShow) => {
    return show ? (
      <DateTimePicker
        value={currentDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          const newDate = selectedDate || currentDate;
          setDate(newDate);
          setShow(false);
        }}
      />
    ) : null;
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const applyFilters = () => {
    hideModal();
  };

  const renderChildrenAgePickers = () => {
    const pickers = [];
    for (let i = 0; i < numChildren; i++) {
      pickers.push(
        <View style={styles.viewModal} key={i}>
          <Text style={styles.textModal}>
            Age of the second child {i + 1}:{' '}
          </Text>
          <Picker
            style={styles.pickerDate}
            selectedValue={childrenAges[i]}
            onValueChange={(itemValue, itemIndex) => {
              const newChildrenAges = [...childrenAges];
              newChildrenAges[i] = itemValue;
              setChildrenAges(newChildrenAges);
            }}>
            {[...Array(18).keys()].map(age => (
              <Picker.Item key={age} label={age.toString()} value={age} />
            ))}
          </Picker>
        </View>,
      );
    }
    return pickers;
  };

  const searchHotels = async () => {
    const hotelData = await fetchHotels(
      selectedCity,
      checkIn,
      checkOut,
      numAdults,
      numChildren,
      childrenAges,
      '2000',
      'USD',
      'VN',
      'en-US',
      priceRange,
      null,
      null,
      starRating,
      mealPlan,
      guestRating,
      guestType,
      cancellationPolicy,
      propertyType,
      discounts,
    );
    if (!hotelData || !Array.isArray(hotelData) || hotelData.length === 0) {
      Alert.alert(
        'Notification',
        'There are currently no hotels matching your search, please try again with another search option',
      );
    }
    setHotels(hotelData);
  };

  const renderRateFeatures = rateFeatures => {
    return rateFeatures.map((feature, index) => (
      <Text style={styles.hotelInfomation} key={index}>
        {feature.text}
      </Text>
    ));
  };

  const renderHotelItem = ({item}) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() =>
            handlePressHotelItem(
              item.hotelId,
              item.TotalPrice,
              item.priceDescription,
              item.rateFeatures,
            )
          }>
          <View style={styles.hotelItem}>
            <Image
              source={{uri: item.images}}
              style={styles.hotelImage}
              resizeMode="cover"
            />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{item.name}</Text>
              <View style={styles.hotelStars}>{renderStars(item.stars)}</View>
              {item.rating1 && item.rating3 && item.rating2 && (
                <Text style={styles.hotelInfomation}>
                  {item.rating1} {item.rating3} ({item.rating2} rating)
                </Text>
              )}

              {item.priceDescription && (
                <Text style={styles.hotelInfomation}>
                  Price on night: {item.priceDescription}
                </Text>
              )}

              {item.distance && (
                <Text style={styles.hotelInfomation}>
                  Distance: {item.distance}
                </Text>
              )}
              {item.rateFeatures != null && item.rateFeatures.length > 0 && (
                <>
                  <Text style={styles.hotelInfomation}>
                    Services: {renderRateFeatures(item.rateFeatures)}
                  </Text>
                </>
              )}
              {item.TotalPrice && (
                <Text style={styles.hotelInfomationAmount}>
                  Total price: ${item.TotalPrice}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.rowItem}></View>
      </View>
    );
  };

  const isHotelBooked = hotelId => {
    return bookedHotels.includes(hotelId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = firebase.auth().currentUser.uid;
        const response = await firebase
          .database()
          .ref(`users/${userId}/hotel_bookings`)
          .once('value');
        const data = response.val();
        if (data) {
          setBookedHotels(Object.keys(data));
        }
      } catch (error) {
        console.error(
          'Error when retrieving data from Realtime Database:',
          error,
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {}, [bookedHotels]);

  const handlePressHotelItem = (
    hotelId,
    TotalPrice,
    priceDescription,
    rateFeatures,
  ) => {
    if (isHotelBooked(hotelId)) {
      Alert.alert(
        'Notification',
        'You have already booked this hotel, please cancel this hotel room in the purchased section if you want to rebook',
        [
          {
            text: 'OK',
            style: 'cancel',
            onPress: () => console.log('OK Pressed'),
          },
        ],
        {cancelable: true},
      );
      return;
    }
    if (TotalPrice === null || TotalPrice === undefined) {
      Alert.alert(
        'Notification',
        'The hotel is currently not supported with your filter search, please try again with another filter search or choose another hotels',
      );
    } else {
      const rateFeaturesText = rateFeatures
        .map(feature => feature.text)
        .join(', ');
      navigation.navigate('HotelDetail', {
        hotelId: hotelId,
        checkin: checkIn.toISOString().slice(0, 10),
        checkout: checkOut.toISOString().slice(0, 10),
        numAdults: numAdults,
        numChildren,
        childrenAges,
        TotalPrice: TotalPrice,
        priceDescription: priceDescription,
        rateFeatures: rateFeaturesText,
      });
    }
  };

  const calculateDaysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays;
  };

  const renderFormattedDate = date => {
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      date.getDay()
    ];
    const month = date.toLocaleDateString('en-US', {
      month: 'long',
    });
    const Day = date.toLocaleDateString('en-US', {
      day: 'numeric',
    });

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{padding: 1}}>
          <Text style={styles.Day}>{Day}</Text>
        </View>
        <View style={{paddingLeft: 5, paddingTop: 5}}>
          <Text style={styles.month}>{month}</Text>
          <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
        </View>
      </View>
    );
  };

  const getFilterText = () => {
    return `Adults: ${numAdults}       Childrens: ${numChildren}       Rooms: 1`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewCard}>
        <View style={styles.viewCity}>
          <Icon style={styles.textHeader} name="search"></Icon>
          <Picker
            style={styles.pickerCityLess}
            selectedValue={selectedCity}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedCity(itemValue)
            }>
            {cityList.map(city => (
              <Picker.Item
                key={city.value}
                label={city.label}
                value={city.value}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.row}></View>

        <View style={styles.rowDate}>
          <TouchableOpacity onPress={() => setShowDatePicker1(true)}>
            {renderFormattedDate(checkIn)}
          </TouchableOpacity>
          <View style={styles.rowDate}>
            <Text style={styles.daysBetween}>
              {calculateDaysBetween(checkIn, checkOut)}
            </Text>
            <Icon name="moon" size={15} color={colors.inactive}></Icon>
          </View>
          <TouchableOpacity onPress={() => setShowDatePicker2(true)}>
            {renderFormattedDate(checkOut)}
          </TouchableOpacity>
          {showDatePicker(
            checkIn,
            setCheckIn,
            showDatePicker1,
            setShowDatePicker1,
          )}
          {showDatePicker(
            checkOut,
            setCheckOut,
            showDatePicker2,
            setShowDatePicker2,
          )}
        </View>

        <View style={styles.row}></View>

        <TouchableOpacity style={styles.viewFilter} onPress={showModal}>
          <Text style={styles.textFilter}>{getFilterText()}</Text>
        </TouchableOpacity>

        <View style={styles.row}></View>

        <TouchableOpacity onPress={searchHotels} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={hotels}
        renderItem={renderHotelItem}
        keyExtractor={item => item.hotelId.toString()}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}>
        <View style={styles.containerModal}>
          <ScrollView>
            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Number of adults: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={numAdults}
                onValueChange={(itemValue, itemIndex) =>
                  setNumAdults(itemValue)
                }>
                {[...Array(21).keys()].slice(1).map(num => (
                  <Picker.Item key={num} label={num.toString()} value={num} />
                ))}
              </Picker>
            </View>

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Number of child: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={numChildren}
                onValueChange={(itemValue, itemIndex) =>
                  setNumChildren(itemValue)
                }>
                {[...Array(18).keys()].map(num => (
                  <Picker.Item key={num} label={num.toString()} value={num} />
                ))}
              </Picker>
            </View>
            {renderChildrenAgePickers()}

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Price: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={priceRange}
                onValueChange={(itemValue, itemIndex) =>
                  setPriceRange(itemValue)
                }>
                <Picker.Item label="No choice" value={null} />
                <Picker.Item label="0 - 50" value="PR_BK_0" />
                <Picker.Item label="50 - 100" value="PR_BK_1" />
                <Picker.Item label="100 - 150" value="PR_BK_2" />
                <Picker.Item label="150 - 200" value="PR_BK_3" />
                <Picker.Item label="200 - 250" value="PR_BK_4" />
                <Picker.Item label="250 or more" value="PR_BK_5" />
              </Picker>
            </View>

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Rating Stars: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={starRating}
                onValueChange={(itemValue, itemIndex) =>
                  setStarRating(itemValue)
                }>
                <Picker.Item label="No choice" value={null} />
                <Picker.Item label="5 stars" value="5" />
                <Picker.Item label="4 stars" value="4" />
                <Picker.Item label="3 stars" value="3" />
                <Picker.Item label="2 stars" value="2" />
                <Picker.Item label="1 star" value="1" />
                <Picker.Item label="Unrated" value="no_stars" />
              </Picker>
            </View>

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Breakfast: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={mealPlan}
                onValueChange={(itemValue, itemIndex) =>
                  setMealPlan(itemValue)
                }>
                <Picker.Item label="No choice" value={null} />
                <Picker.Item
                  label="Breakfast included"
                  value="breakfast_included"
                />
                <Picker.Item
                  label="Breakfast not included"
                  value="RoomRates_label_mealsNotIncluded"
                />
              </Picker>
            </View>

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Guest reviews: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={guestRating}
                onValueChange={(itemValue, itemIndex) =>
                  setGuestRating(itemValue)
                }>
                <Picker.Item label="No choice" value={null} />
                <Picker.Item label="Satisfied" value="6" />
                <Picker.Item label="Good" value="7" />
                <Picker.Item label="Very Good" value="8" />
                <Picker.Item label="Awesome" value="9" />
                <Picker.Item label="Outstanding" value="9.5" />
              </Picker>
            </View>

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Type of guest: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={guestType}
                onValueChange={(itemValue, itemIndex) =>
                  setGuestType(itemValue)
                }>
                <Picker.Item label="No chocie" value={null} />
                <Picker.Item label="Family" value="family" />
                <Picker.Item label="Couple" value="couple" />
                <Picker.Item label="Self-tour" value="solo" />
                <Picker.Item label="Business travel" value="business" />
              </Picker>
            </View>

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Cancellation Policy: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={cancellationPolicy}
                onValueChange={(itemValue, itemIndex) =>
                  setCancellationPolicy(itemValue)
                }>
                <Picker.Item label="No choice" value={null} />
                <Picker.Item
                  label="Free cancellation"
                  value="free_cancellation"
                />
                <Picker.Item label="Non refundable" value="non_refundable" />
                <Picker.Item label="Refund" value="refundable" />
              </Picker>
            </View>

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Accommodation type: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={propertyType}
                onValueChange={(itemValue, itemIndex) =>
                  setPropertyType(itemValue)
                }>
                <Picker.Item label="No choice" value={null} />
                <Picker.Item label="Hotel" value="Hotel" />
                <Picker.Item label="Apartment" value="ResidenceHotel" />
                <Picker.Item label="Inn" value="Hostel" />
                <Picker.Item label="Guest House" value="GuestHouse" />
                <Picker.Item label="Private Home" value="PrivateHome" />
                <Picker.Item label="Country room" value="CountryHouse" />
                <Picker.Item label="Resort" value="Resort" />
              </Picker>
            </View>

            <View style={styles.viewModal}>
              <Text style={styles.textModal}>Discount: </Text>
              <Picker
                style={styles.pickerDate}
                selectedValue={discounts}
                onValueChange={(itemValue, itemIndex) =>
                  setDiscounts(itemValue)
                }>
                <Picker.Item label="Show discount" value="1" />
              </Picker>
            </View>

            <TouchableOpacity
              onPress={applyFilters}
              style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Apply filter</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerModal: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 100,
    marginBottom: 100,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  textHeader: {
    fontSize: 15,
    color: 'black',
    marginTop: 4,
  },
  viewCity: {
    marginLeft: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerCityLess: {
    color: 'black',
    width: 300,
    marginTop: 3,
    height: 20,
  },
  viewFilter: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
  },
  pickerDate: {
    backgroundColor: 'white',
    color: colors.primary1,
    width: 200,
    fontSize: 15,
    height: 30,
    marginTop: 10,
  },
  textFilter: {
    alignSelf: 'center',
    color: 'black',
    fontSize: 15,
  },
  viewCard: {
    backgroundColor: 'white',
    height: 280,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor: 'black',
    borderWidth: 1,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    width: '90%',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    alignSelf: 'center',
  },
  textModal: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 20,
  },
  viewModal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerDate: {
    color: colors.primary1,
    width: 250,
    fontSize: 15,
  },
  hotelItem: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  hotelImage: {
    width: 150,
    height: '100%',
    borderRadius: 10,
  },
  hotelInfo: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  hotelName: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 230,
    color: 'black',
  },
  hotelInfomation: {
    fontSize: 12,
    width: 240,
    color: colors.primary,
  },
  hotelInfomationAmount: {
    fontSize: 14,
    width: 240,
    color: 'red',
  },
  hotelStars: {
    flexDirection: 'row',
  },
  daysBetween: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.inactive,
  },
  rowDate: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  rowDateIcon: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  pickerDateTime: {
    color: 'black',
    fontSize: 15,
  },
  dayOfWeek: {
    color: 'black',
    fontSize: 11,
  },
  Day: {
    color: 'black',
    fontSize: 35,
  },
  month: {
    color: 'black',
    fontSize: 11,
  },
  row: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: 'gray',
    height: 1,
  },
  rowItem: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'gray',
    height: 1,
  },
});

export default Hotel;
