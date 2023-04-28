import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {fetchFlights} from '../api';
import {Picker} from '@react-native-picker/picker';

const getAirlineLogo = name => {
  switch (name) {
    case 'VietJet Air':
      return require('../../assets/vietjet_air_logo.png');
    case 'Vietnam Airlines':
      return require('../../assets/vietnam_airlines_logo.jpg');
    case 'Bamboo Airways':
      return require('../../assets/bamboo_airways_logo.png');
    case 'Vietravel Airlines':
      return require('../../assets/vietravel_airlines_logo.png');
    case 'Jetstar':
      return require('../../assets/Jetstar_logo.png');
    default:
      return null;
  }
};
const FlightList = ({route, navigation}) => {
  const [flights, setFlights] = useState([]);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [sortBy, setSortBy] = useState({price: null, time: null});
  const [currentLegIndex, setCurrentLegIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const results = await fetchFlights(
        route.params.origin,
        route.params.destination,
        route.params.date,
        route.params.returnDate,
        route.params.adults,
        route.params.children,
        route.params.cabinClass,
        route.params.filter,
      );
      setFlights(results);
    };

    fetchData();
  }, []);

  const handleFlightSelection = (flight, selectedLegIndex) => {
    navigation.navigate('FlightDetails', {
      itineraryId: flight.id,
      legs: [
        {
          origin: flight.legs[0]?.origin?.displayCode,
          destination: flight.legs[0]?.destination?.displayCode,
          date: flight.legs[0]?.departure?.split('T')[0],
        },
        {
          origin: flight.legs[1]?.origin?.displayCode,
          destination: flight.legs[1]?.destination?.displayCode,
          date: flight.legs[1]?.departure?.split('T')[0],
        },
      ],
      selectedLegIndex,
      adults: route.params.adults,
      currency: 'USD',
      countryCode: 'US',
      market: 'en-US',
    });
  };
  
  const handleFlightPress = flight => {
    const selectedLegIndex = currentLegIndex;
    handleFlightSelection(flight, selectedLegIndex);
  };   

  const renderItem = ({item}) => {
    if (!item.legs || !item.legs[currentLegIndex]) {
      return null;
    }
    const leg = item.legs[currentLegIndex];
    const departureDateTime = new Date(leg.departure);
    const arrivalDateTime = new Date(leg.arrival);
    const airlineLogo = getAirlineLogo(item.carriers[0].name);

    return (
      <TouchableOpacity onPress={() => handleFlightPress(item)}>
        <View style={styles.itemContainer}>
          <View>
            <View style={styles.cityTimeContainer}>
              <View>
                <Text style={styles.textItem}>{leg.origin.name}</Text>
                <Text style={styles.textItem}>
                  {departureDateTime.toLocaleTimeString('vi-VN')}
                </Text>
                <Text style={styles.textItem}>
                  {departureDateTime.toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <Image
                source={require('../../assets/right-arrow.png')}
                style={{width: 20, height: 20, marginHorizontal: 20}}></Image>
              <View>
                <Text style={styles.textItem}>{leg.destination.name}</Text>
                <Text style={styles.textItem}>
                  {arrivalDateTime.toLocaleTimeString('vi-VN')}
                </Text>
                <Text style={styles.textItem}>
                  {arrivalDateTime.toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.textItem}>{item.carriers[0].name}</Text>
              {airlineLogo ? (
                <Image
                  source={airlineLogo}
                  style={{
                    width: 70,
                    height: 35,
                    resizeMode: 'contain',
                    marginLeft: 5,
                  }}
                />
              ) : null}
            </View>

            <Text style={styles.textItem}>
              {leg.duration.hours}h{leg.duration.minutes}'
            </Text>
            <Text style={styles.textItem}>The flight: {leg.stopCount}</Text>
          </View>
          <Text style={styles.priceText}>${item.price.amount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleCarrierFilter = carrier => {
    setSelectedCarrier(carrier);
  };

  const handleSort = (type, direction) => {
    setSortBy({...sortBy, [type]: direction});
  };

  const carriers = [
    'All Airlines',
    'Vietjet Air',
    'Vietnam Airlines',
    'Bamboo Airways',
    'Vietravel Airlines',
    'Jetstar',
  ];

  const sortOptions = [
    {label: 'Price Low to High', type: 'price', direction: 'asc'},
    {label: 'Price High to Low', type: 'price', direction: 'desc'},
    {label: 'Time Soon to Late', type: 'time', direction: 'asc'},
    {label: 'Late Time Comes Early', type: 'time', direction: 'desc'},
  ];

  const filteredFlights = selectedCarrier
    ? flights.filter(flight => flight.carriers[0].name === selectedCarrier)
    : flights;

  const flightsByCurrentLegIndex = filteredFlights.filter(
    flight => flight.legs.length > currentLegIndex,
  );

  const sortedFlights = filteredFlights.sort((a, b) => {
    let comparison = 0;
    if (sortBy.price) {
      comparison =
        sortBy.price === 'asc'
          ? a.price.amount - b.price.amount
          : b.price.amount - a.price.amount;
    }

    if (comparison === 0 && sortBy.time) {
      const aDeparture = new Date(a.legs[0].departure);
      const bDeparture = new Date(b.legs[0].departure);
      comparison =
        sortBy.time === 'asc'
          ? aDeparture - bDeparture
          : bDeparture - aDeparture;
    }
    return comparison;
  });

  return (
    <View style={styles.container}>
       <TouchableOpacity
          style={styles.topButton}
          onPress={() => setCurrentLegIndex(currentLegIndex === 0 ? 1 : 0)}>
          <Text style={styles.topButtonText}>
            {currentLegIndex === 0
              ? 'Show Return Flights'
              : 'Show Departure Flights'}
          </Text>
        </TouchableOpacity>
        <View style={styles.row}></View>
      <View style={styles.topButtonsContainer}>
        <View style={styles.viewModal}>
          <Text style={styles.textModal}>Airlines</Text>
          <Picker
            selectedValue={selectedCarrier}
            style={styles.picker}
            onValueChange={itemValue => handleCarrierFilter(itemValue)}>
            {carriers.map((carrier, index) => (
              <Picker.Item key={index} label={carrier} value={carrier} />
            ))}
          </Picker>
        </View>
        <View style={styles.column}></View>
        <View style={styles.viewModal}>
          <Text style={styles.textModal}> Sorted by</Text>
          <Picker
            selectedValue={sortBy}
            style={styles.picker}
            onValueChange={itemValue =>
              handleSort(itemValue.type, itemValue.direction)
            }>
            {sortOptions.map((option, index) => (
              <Picker.Item key={index} label={option.label} value={option} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.row}></View>
      {sortedFlights.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            There are no matching flights
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedFlights}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDEDED',
    flex: 1,
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  topButton: {
    backgroundColor: 'EDEDED',
    borderBottomLeftRadius:15,
    borderBottomRightRadius:15,
    borderColor:'black',
borderWidth:1,
height:50,
  },
  topButtonText: {
    color: 'black',
    fontWeight: 'bold',
    alignSelf:'center',
    justifyContent:'center',
    marginTop:10,
    fontSize:20,
    fontWeight:'bold'
  },
  row:{
height:1,
width:'90%',
alignSelf:'center',
backgroundColor:"gray",
marginBottom:10,
marginTop:10
  },
  column:{
    width:1,
    height:'90%',
    alignSelf:'center',
    backgroundColor:"gray",
    marginBottom:10,
    marginTop:10
      },
  itemContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    alignSelf: 'flex-end',
  },
  cityTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textItem: {
    color: 'black',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  modalView: {
    flex: 1,
    marginTop: 50,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  picker: {
    marginHorizontal: 20,
    width: 170,
    height: 50,
    color: 'black',
  },
  textModal: {
    color: 'black',
    fontSize: 17,
    fontWeight: 'bold',
  },
  viewModal: {
    alignItems: 'center',
  },
});

export default FlightList;
