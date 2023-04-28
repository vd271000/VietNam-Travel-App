import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome5';

const Flight = ({navigation}) => {
  const [loading, setLoading] = useState(false);

  const vietnamAirports = [
    {code: 'SGN', name: 'Ho Chi Minh'},
    {code: 'HAN', name: 'Ha Noi'},
    {code: 'DAD', name: 'Da Nang'},
    {code: 'VCA', name: 'Can Tho'},
    {code: 'VDO', name: 'Quảng Ninh'},
    {code: 'HPH', name: 'Hai Phong'},
    {code: 'VII', name: 'Nghe An'},
    {code: 'HUI', name: 'Hue'},
    {code: 'CXR', name: 'Khanh Hoa'},
    {code: 'DLI', name: 'Lam Dong'},
    {code: 'UIH', name: 'Binh Dinh'},
    {code: 'PQC', name: 'Kien Giang'},
  ];

  const filterOptions = [
    {label: 'Best', value: 'best'},
    {label: 'Price', value: 'price'},
    {label: 'Duration', value: 'duration'},
    {label: 'Take off time', value: 'take_off_time'},
    {label: 'Landing time', value: 'landing_time'},
    {label: 'Return take off time', value: 'return_take_off_time'},
    {label: 'Return landing time', value: 'return_landing_time'},
  ];

  const cabinClassOptions = [
    {label: 'Economy', value: 'economy'},
    {label: 'Premium Economy', value: 'premium_economy'},
    {label: 'Business', value: 'business'},
    {label: 'First Class', value: 'first'},
  ];

  const [origin, setOrigin] = useState(vietnamAirports[0].code);
  const [destination, setDestination] = useState(vietnamAirports[1].code);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [cabinClass, setCabinClass] = useState(cabinClassOptions[0].value);
  const [filter, setFilter] = useState(filterOptions[0].value);
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [showReturnDatepicker, setShowReturnDatepicker] = useState(false);

  const handleSearch = () => {
    setLoading(true);

    setTimeout(() => {
      const hasError = false;
      setLoading(false);
      if (hasError) {
        Alert.alert('Error', 'An error occurred while searching for flights.');
      } else {
        navigation.navigate('FlightList', {
          origin,
          destination,
          date,
          returnDate,
          adults,
          children,
          cabinClass,
          filter,
        });
      }
    }, 5000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowCity}>
        <Text style={styles.labelCity}>Departure</Text>
        <Text style={styles.labelCity}>Destination</Text>
      </View>
      <View style={styles.row}>
        <Picker
          style={styles.picker}
          selectedValue={origin}
          onValueChange={itemValue => setOrigin(itemValue)}>
          {vietnamAirports.map(airport => (
            <Picker.Item
              key={airport.code}
              label={airport.name}
              value={airport.code}
            />
          ))}
        </Picker>
        <Icon
          name="exchange-alt"
          size={24}
          style={styles.swapIcon}
          onPress={() => {
            const temp = origin;
            setOrigin(destination);
            setDestination(temp);
          }}
        />
        <Picker
          style={styles.picker}
          selectedValue={destination}
          onValueChange={itemValue => setDestination(itemValue)}>
          {vietnamAirports.map(airport => (
            <Picker.Item
              key={airport.code}
              label={airport.name}
              value={airport.code}
            />
          ))}
        </Picker>
      </View>

<View style={styles.rowSpace}></View>

<Text style={styles.textDate}>Departure day</Text>
<View style={styles.rowDate}>
      <Icon name="plane-departure" size={14} color={'black'} style={{marginRight:20}}></Icon>
        <TouchableOpacity onPress={() => setShowDatepicker(true)}>
          <Text style={styles.date}>{date}</Text>
        </TouchableOpacity>
        {showDatepicker && (
          <DateTimePicker
            value={new Date(date)}
            mode="date"
            display="calendar"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || date;
              setShowDatepicker(false);
              setDate(currentDate.toISOString().slice(0, 10));
            }}
            onTouchCancel={() => setShowDatepicker(false)}
            onTouchEnd={() => setShowDatepicker(false)}
          />
        )}
</View>

<View style={styles.rowSpace}></View>

<Text style={styles.textDate}>Return day</Text>
<View style={styles.rowDate}>
<Icon name="plane-arrival" size={14} color={'black'} style={{marginRight:20}}></Icon>
        <TouchableOpacity onPress={() => setShowReturnDatepicker(true)}>
          <Text style={styles.date}>{returnDate}</Text>
        </TouchableOpacity>
        {showReturnDatepicker && (
          <DateTimePicker
            value={new Date(returnDate)}
            mode="date"
            display="calendar"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || returnDate;
              setShowReturnDatepicker(false);
              setReturnDate(currentDate.toISOString().slice(0, 10));
            }}
            onTouchCancel={() => setShowReturnDatepicker(false)}
            onTouchEnd={() => setShowReturnDatepicker(false)}
          />
        )}
</View>
<View style={styles.rowSpace}></View>

      <View style={styles.rowPerson}>
        <View>
          <View style={styles.rowDate}>
          <Icon name='user-friends' color={'black'} size={15}></Icon>
          <Picker
            style={styles.pickerAdults}
            selectedValue={adults}
            onValueChange={itemValue => setAdults(itemValue)}>
            {[...Array(10)].map((_, i) => (
              <Picker.Item key={i} label={`${i + 1} Adults`} value={`${i + 1}`} />
            ))}
          </Picker>
          </View>
        </View>
        <View>
        <View style={styles.rowDate}>
        <Icon name='child' color={'black'} size={15}></Icon>
          <Picker
            style={styles.pickerAdults}
            selectedValue={children}
            onValueChange={itemValue => setChildren(itemValue)}>
            {[...Array(10)].map((_, i) => (
              <Picker.Item key={i} label={`${i} Children`} value={`${i}`} />
            ))}
          </Picker>
          </View>
        </View>
      </View>

      <View style={styles.rowSpace}></View>

      <View style={styles.rowPerson}>
        <View>
        <View style={styles.rowDate}>
          <Image source={require('../../assets/seat.png')} style={{width: 20, height: 20}}></Image>
          <Picker
            style={styles.pickerAdults}
            selectedValue={cabinClass}
            onValueChange={itemValue => setCabinClass(itemValue)}>
            {cabinClassOptions.map(option => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
          </View>
        </View>
        <View>
        <View style={styles.rowDate}>
          <Icon name='sort-amount-up-alt' color={'black'} size={15}></Icon>
          <Picker
            style={styles.pickerAdults}
            selectedValue={filter}
            onValueChange={itemValue => setFilter(itemValue)}>
            {filterOptions.map(option => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'black',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCity:{
flexDirection:'row',
justifyContent:'space-around'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  labelCity:{
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
  },
  picker: {
    height: 40,
    width: 170,
    color: 'black',
  },
  swapIcon: {
    marginHorizontal: 10,
    color: 'black',
  },
  date: {
    fontSize: 16,
    color: 'black',
  },
  searchButton: {
    backgroundColor: '#4a9df8',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textDate:{
    color:'black',
fontSize:12,
paddingBottom:5
  },
  rowSpace:{
width:"90%",
height:1,
backgroundColor:'gray',
alignSelf:'center',
marginBottom:10,
marginTop:20
  },
  pickerAdults:{
width:150,
color:'black'
  },
  rowPerson:{
    flexDirection:"row",
alignItems:"center",
justifyContent:'center'
  }
});

export default Flight;
