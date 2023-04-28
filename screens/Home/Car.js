import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import {fetchCars} from '../api';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../../constants';

const Car = ({navigation, route}) => {
  const [pickUpEntityId, setPickUpEntityId] = useState('');
  const [dropOffEntityId, setDropOffEntityId] = useState('');
  const [pickUpDate, setPickUpDate] = useState(new Date());
  const [dropOffDate, setDropOffDate] = useState(new Date());
  const [pickUpTime, setPickUpTime] = useState(() => {
    const defaultPickUpTime = new Date();
    defaultPickUpTime.setHours(12, 0, 0, 0);
    return defaultPickUpTime;
  });
  const [dropOffTime, setDropOffTime] = useState(() => {
    const defaultDropOffTime = new Date();
    defaultDropOffTime.setHours(12, 0, 0, 0);
    return defaultDropOffTime;
  });
  const [currency, setCurrency] = useState('');
  const [showPickUpDatePicker, setShowPickUpDatePicker] = useState(false);
  const [showDropOffDatePicker, setShowDropOffDatePicker] = useState(false);
  const [showPickUpTimePicker, setShowPickUpTimePicker] = useState(false);
  const [showDropOffTimePicker, setShowDropOffTimePicker] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [providers, setProviders] = useState('');
  const [groups, setGroups] = useState('');
  const [driverAge, setDriverAge] = useState('');
  const [warning, setWarning] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDropOffCity, setSelectedDropOffCity] = useState('');

  const showWarning = message => {
    setWarning(message);
    setTimeout(() => {
      setWarning('');
    }, 10000);
  };

  const onChangePickUpDate = (event, selectedDate) => {
    const currentDate = selectedDate || pickUpDate;
    setShowPickUpDatePicker(false);
    setPickUpDate(currentDate);
    setDropOffDate(new Date(currentDate.valueOf() + 86400000));
  };  

  const onChangeDropOffDate = (event, selectedDate) => {
    const currentDate = selectedDate || dropOffDate;
    setShowDropOffDatePicker(false);
    setDropOffDate(currentDate);
  };

  const onChangePickUpTime = (event, selectedTime) => {
    const currentTime = selectedTime || pickUpTime;
    setShowPickUpTimePicker(false);
    setPickUpTime(currentTime);
  };

  const onChangeDropOffTime = (event, selectedTime) => {
    const currentTime = selectedTime || dropOffTime;
    setShowDropOffTimePicker(false);
    setDropOffTime(currentTime);
  };

  const searchCars = async () => {
    try {
      if (numberOfDays < 1) {
        showWarning("Drop-off date must be at least 1 day after the pick-up date.");
        return;
      }      
      if (!pickUpEntityId || !dropOffEntityId) {
        showWarning('Please enter your pick up and drop off location.');
        return;
      }
      const formattedPickUpDate = pickUpDate.toISOString().split('T')[0];
      const formattedDropOffDate = dropOffDate.toISOString().split('T')[0];
      const formattedPickUpTime = pickUpTime
        .toTimeString()
        .split(' ')[0]
        .substring(0, 5);
      const formattedDropOffTime = dropOffTime
        .toTimeString()
        .split(' ')[0]
        .substring(0, 5);
      const result = await fetchCars(
        pickUpEntityId,
        dropOffEntityId,
        formattedPickUpDate,
        formattedDropOffDate,
        formattedPickUpTime,
        formattedDropOffTime,
        driverAge,
        currency,
      );
      setQuotes(result.quotes);
      setProviders(result.providers);
      setGroups(result.groups);

      navigation.navigate('CarList', {
        quotes: result.quotes,
        providers: result.providers,
        groups: result.groups,
      });
    } catch (error) {
      showWarning('Network problem, please check your network connection.');
    }
  };

  const handleCityChange = city => {
    setSelectedCity(city);
    setPickUpEntityId('');
  };

  const handleDropOffCityChange = city => {
    setSelectedDropOffCity(city);
    setDropOffEntityId('');
  };

  const getOptionsByCity = () => {
    switch (selectedCity) {
      case 'Hanoi':
        return [
          {label: 'Hanoi City', value: '27541992'},
          {label: 'Hanoi Airport', value: '128668079'},
        ];
      case 'Ho Chi Minh':
        return [
          {label: 'Ho Chi Minh City', value: '27546329'},
          {label: 'Ho Chi Minh Airport', value: '95673379'},
        ];
      case 'Da Nang':
        return [
          {label: 'Da Nang City', value: '27540669'},
          {label: 'Da Nang Airport', value: '95673615'},
        ];
      case 'Can Tho':
        return [
          {label: 'Can Tho City', value: '39579168'},
          {label: 'Can Tho Airport', value: '128667679'},
        ];
      default:
        return [];
    }
  };

  const getOptionsByCityDrop = () => {
    switch (selectedDropOffCity) {
      case 'Hanoi':
        return [
          {label: 'Hanoi City', value: '27541992'},
          {label: 'Hanoi Airport', value: '128668079'},
        ];
      case 'Ho Chi Minh':
        return [
          {label: 'Ho Chi Minh City', value: '27546329'},
          {label: 'Ho Chi Minh Airport', value: '95673379'},
        ];
      case 'Da Nang':
        return [
          {label: 'Da Nang City', value: '27540669'},
          {label: 'Da Nang Airport', value: '95673615'},
        ];
      case 'Can Tho':
        return [
          {label: 'Can Tho City', value: '39579168'},
          {label: 'Can Tho Airport', value: '128667679'},
        ];
      default:
        return [];
    }
  };

  const countDaysBetween = (start, end) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((startTime - endTime) / oneDay));
  };
  const numberOfDays = countDaysBetween(pickUpDate, dropOffDate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Car Rental</Text>
      {warning ? <Text style={styles.warning}>{warning}</Text> : null}

<View style={styles.containerCity}>
  <View style={styles.containerPicker}>
  <Text style={styles.label}>Pick Up City</Text>
      <Picker
        style={styles.picker}
        selectedValue={selectedCity}
        onValueChange={itemValue => handleCityChange(itemValue)}>
        <Picker.Item label="Select city" value="" />
        <Picker.Item label="Ha Noi" value="Hanoi" />
        <Picker.Item label="Ho Chi Minh" value="Ho Chi Minh" />
        <Picker.Item label="Da Nang" value="Da Nang" />
        <Picker.Item label="Can Tho" value="Can Tho" />
      </Picker>
  </View>
<View>
<Text style={styles.label}>Pick Up Location</Text>
<Picker
        style={styles.picker}
        selectedValue={pickUpEntityId}
        onValueChange={itemValue => setPickUpEntityId(itemValue)}>
        <Picker.Item label="Select pickup location" value="" />
        {getOptionsByCity().map(option => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
</View>
</View>
      

<View style={styles.containerCity}>
  <View style={styles.containerPicker}>
  <Text style={styles.label}>Drop-off City</Text>
      <Picker
        style={styles.picker}
        selectedValue={selectedDropOffCity}
        onValueChange={itemValue => handleDropOffCityChange(itemValue)}>
        <Picker.Item label="Select city" value="" />
        <Picker.Item label="Hanoi" value="Hanoi" />
        <Picker.Item label="Ho Chi Minh" value="Ho Chi Minh" />
        <Picker.Item label="Da Nang" value="Da Nang" />
        <Picker.Item label="Can Tho" value="Can Tho" />
      </Picker>
  </View>
<View>
<Text style={styles.label}>Drop Off Location</Text>
<Picker
        style={styles.picker}
        selectedValue={dropOffEntityId}
        onValueChange={itemValue => setDropOffEntityId(itemValue)}>
        <Picker.Item label="Select drop-off location" value="" />
        {getOptionsByCityDrop().map(option => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
</View>
</View>         

<View style={styles.containerDate}>
  <View>
  <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPickUpDatePicker(true)}>
        <Text style={styles.dateButtonText}>
          {pickUpDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showPickUpDatePicker && (
        <DateTimePicker
          value={pickUpDate}
          mode="date"
          display="default"
          onChange={onChangePickUpDate}
        />
      )}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPickUpTimePicker(true)}>
        <Text style={styles.dateButtonText}>
          {pickUpTime.toTimeString().split(' ')[0].substring(0, 5)}
        </Text>
      </TouchableOpacity>
      {showPickUpTimePicker && (
        <DateTimePicker
          value={pickUpTime}
          mode="time"
          display="default"
          onChange={onChangePickUpTime}
        />
      )}
  </View>
  <Text style={styles.label}>{numberOfDays} Days</Text>
  <View>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDropOffDatePicker(true)}>
        <Text style={styles.dateButtonText}>
          {dropOffDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDropOffDatePicker && (
  <DateTimePicker
    value={dropOffDate}
    mode="date"
    display="default"
    onChange={onChangeDropOffDate}
    minimumDate={new Date(pickUpDate.valueOf() + 86400000)}
  />
)}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDropOffTimePicker(true)}>
        <Text style={styles.dateButtonText}>
          {dropOffTime.toTimeString().split(' ')[0].substring(0, 5)}
        </Text>
      </TouchableOpacity>
      {showDropOffTimePicker && (
        <DateTimePicker
          value={dropOffTime}
          mode="time"
          display="default"
          onChange={onChangeDropOffTime}
        />
      )}
</View>
</View>
    
    <View style={styles.containerAge}>
    <Text style={styles.label}>Driver's age (optional):</Text>
      <Picker
        style={styles.picker}
        selectedValue={driverAge}
        onValueChange={itemValue => setDriverAge(itemValue)}>
        <Picker.Item label="Not Selected" value="" />
        {Array.from({length: 100}, (_, i) => i + 21).map(age => (
          <Picker.Item
            key={age}
            label={age.toString()}
            value={age.toString()}
          />
        ))}
      </Picker>
      
    </View>
    <TouchableOpacity style={styles.searchButton} onPress={searchCars}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
      <View>
      <Text style={[styles.labelDetails, {marginTop:20}]}>
        It is recommended to choose pick up and drop off times during regular business hours (10:00 - 18:00) and we recommend choosing even hours like 12:00 - 12:30
        </Text>
        <View style={styles.row}></View>
        <Text style={styles.labelDetails}>
        You should choose the driver age from 21-70 years old (optional)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop:20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color:'black'
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color:"black",
    marginLeft:8
  },
  picker: {
    backgroundColor: '#e6e6e6',
    width:170,
    color:'black',
  },
  warning: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 30,
    width:"90%",
    alignSelf:'center'
  },
  searchButtonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  containerCity:{
    height:100,
    backgroundColor:"#e6e6e6",
marginHorizontal:20,
borderRadius:15,
flexDirection:'row',
justifyContent:'space-around',
alignItems:'center',
marginTop:20
  },
  containerPicker:{
    justifyContent:'center',
  },
  containerDate:{
    height:100,
    backgroundColor:"#e6e6e6",
marginHorizontal:20,
borderRadius:15,
flexDirection:'row',
justifyContent:'space-around',
alignItems:'center',
marginTop:20
  },
  containerAge:{
    height:70,
    backgroundColor:"#e6e6e6",
marginHorizontal:20,
borderRadius:15,
flexDirection:'row',
justifyContent:'space-around',
alignItems:'center',
marginTop:20
  },
  dateButtonText:{
    color:'black',
    fontWeight:"bold",
  },
  row:{
    height:1,
    width:'90%',
    backgroundColor:'gray',
    alignSelf:'center',
    marginBottom:10,
    marginTop:10
  },
  labelDetails:{
color:'black',
fontSize:14,
fontWeight:'bold',
alignSelf:'center'
  }
});

export default Car;
