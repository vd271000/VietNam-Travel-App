import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import {images, icons, colors, frontSizes} from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CategoryList from './CategoryList';
import { fetchDestination } from '../api';

function DestinationList({navigation, route}) {
  const [searchText, setSearchText] = useState('');
  const {selectedDestination, destinations, selectedId} = route.params;
  const [destination, setDestination] = useState([]);
  const [offset, setOffset] = useState(0);
  
  const loadDestinations = async () => {
    try {
      const newDestination = await fetchDestination(selectedId, offset);
      setDestination([...destination, ...newDestination]);
      setOffset(offset + 30);
    } catch (error) {
      console.warn('Error loading destinations:', error);
    }
  };  

  useEffect(() => {
    loadDestinations(selectedId);
  }, [selectedId]);

  const handleCategoryPress = async (location_id) => {
    const destinations = await fetchDestination(location_id);
    const city = cityList.find((city) => city.location_id === location_id);
    if (city) {
      navigation.navigate("DestinationList", {
        selectedDestination: city,
        destinations: destinations,
      });
    }
  };  
  const handleSearch = text => {
    setSearchText(text);
  };

  const searchBar = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'lightgray',
        elevation: 5,
        margin: 10,
        paddingHorizontal: 10,
      }}>
      <TextInput
        style={{
          flex: 1,
          marginLeft: 10,
          fontFamily: 'Roboto',
          fontSize: 16,
          color: 'black',
        }}
        onChangeText={text => setSearchText(text)}
        value={searchText}
        placeholder="Search"
        placeholderTextColor="gray"
      />
      <Icon style={{paddingRight: 10}} name="search" size={20} color="gray" />
    </View>
  );

  const renderDestinationItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('DestinationDetail', {
            destination: item  
          });
        }}
        style={{
          width: '48%',
          marginBottom: 10,
          borderRadius: 10,
          overflow: 'hidden',
        }}>
        <Image
          style={{
            width: '100%',
            height: 150,
            resizeMode: 'cover',
          }}
          source={{
            uri: item.url,
          }}
        />
        <View
          style={{
            padding: 5,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'black',
              fontSize: frontSizes.h5,
              fontWeight: 'bold',
            }}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredDestinations = () =>
  destination.filter(eachDestination =>
    eachDestination.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <View style={{flex: 1}}>
      <View style={{zIndex: 10, width: '100%'}}>{searchBar}</View>
      {searchText === '' ? (
        <View>
          <CategoryList onCategoryPress={handleCategoryPress} />
          <Text
            style={{
              color: colors.primary,
              marginTop: 10,
              marginStart: 80,
              marginBottom: 20,
              fontSize: 20,
            }}>
            Travel places in {selectedDestination}
          </Text>
        </View>
      ) : null}
      <FlatList
        data={filteredDestinations()}
        renderItem={renderDestinationItem}
        keyExtractor={eachDestination => eachDestination.name}
        key="two-columns"
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 10,
        }}
        contentContainerStyle={{
          paddingBottom: 10,
          paddingHorizontal: 10,
        }}
        ListEmptyComponent={() => (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{
                color: colors.alert,
                fontWeight: 'bold',
                fontSize: frontSizes.h2,
              }}>
              There are no matching destinations
            </Text>
          </View>
        )}
        onEndReached={loadDestinations}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

export default DestinationList;
