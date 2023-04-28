import React, {useState, useEffect, useCallback} from 'react';
import {
  Pressable,
  FlatList,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableHighlight,
} from 'react-native';
import {colors} from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {fetchRestaurants} from '../api';

const cityList = [
  {name: 'Select city', location_id: ''},
    {name: 'Ha Noi', location_id: '293924'},
  {name: 'Ho Chi Minh', location_id: '293925'},
  {name: 'Da Nang', location_id: '293926'},
  {name: 'Can Tho', location_id: '293927'},
  {name: 'Hai Phong', location_id: '303944'},
  {name: 'Nha Trang', location_id: '2227712'},
  {name: 'Da Lat', location_id: '293922'},
  {name: 'Phu Quoc Island', location_id: '469418'},
  {name: 'Vung Tau', location_id: '303946'},
  {name: 'Hoi An', location_id: '298082'},
  {name: 'Sapa', location_id: '311304'},
  {name: 'Ha Long Bay', location_id: '1968469'},
  {name: 'Quy Nhon', location_id: '608528'},
  {name: 'Mui Ne Beach', location_id: '4412570'},
  {name: 'Cat Ba Island', location_id: '386683'},
];

function Restaurant({navigation}) {
  const [searchText, setSearchText] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [offset, setOffset] = useState(0);

  const [selectedCity, setSelectedCity] = useState(cityList[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCitySelection = city => {
    setSelectedCity(city);
    setModalVisible(false);
    fetchData(city.location_id);
  };

  const fetchData = async (location_id, offset = 0) => {
    const fetchedRestaurants = await fetchRestaurants(location_id, offset);
    const filteredRestaurants = filterRestaurants(fetchedRestaurants, searchText);
  
    if (offset === 0) {
      setRestaurants(filteredRestaurants);
    } else {
      setRestaurants([...restaurants, ...filteredRestaurants]);
    }
  };
  
  const loadRestaurants = async (offset = 0, search = '') => {
    const fetchedRestaurants = await fetchRestaurants(
      selectedCity.location_id,
      offset,
      search,
    );
    const filteredRestaurants = filterRestaurants(
      fetchedRestaurants,
      searchText,
    );
  
    if (offset === 0) {
      setRestaurants(filteredRestaurants);
    } else {
      setRestaurants([...restaurants, ...filteredRestaurants]);
    }
  };
  
  const handleLoadMore = async () => {
    if (restaurants.length >= 30) {
      const newOffset = offset + 30;
      await fetchData(selectedCity.location_id, newOffset);
      setOffset(newOffset);
    }
  };
  
  const filterRestaurants = (restaurants, searchText) => {
    if (searchText.trim() === '') {
      return restaurants;
    }
  
    return restaurants.filter(
      restaurant =>
        restaurant.name &&
        restaurant.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  };

  const renderCityItem = ({item}) => (
    <TouchableHighlight
      onPress={() => handleCitySelection(item)}
      style={styles.cityPickerItem}>
      <Text style={styles.cityPickerItemText}>{item.name}</Text>
    </TouchableHighlight>
  );

  useEffect(() => {
    loadRestaurants(offset);
  }, [selectedCity, offset]);

  useEffect(() => {
    loadRestaurants(offset);
  }, [searchText]);

  const handleSearch = text => {
    setSearchText(text);
    loadRestaurants(0, text);
  };

  const renderRestaurantItem = ({item}) => {
    if (!item) {
      return (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No results were found</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={styles.restaurantItemContainer}
        onPress={() => {
          navigation.navigate('RestaurantDetail', {restaurant: item});
        }}
        disabled={
          !item.photo || !item.photo.images || !item.photo.images.thumbnail
        }>
        {item.photo && item.photo.images && item.photo.images.thumbnail && (
          <Image
            style={styles.restaurantItemImage}
            source={{
              uri: item.photo.images.large.url,
            }}
          />
        )}
        <View style={styles.restaurantItemDetails}>
          <Text style={styles.restaurantItemName}>{item.name}</Text>
          <Text style={styles.restaurantItemAddress}>
            Status: {item.open_now_text}
          </Text>
          {item.price && (
            <Text style={styles.restaurantItemAddress}>{item.price}</Text>
          )}
          <Text style={styles.restaurantItemAddress}>{item.ranking}</Text>
          <Text style={styles.restaurantItemAddress}>
            Rating: {item.rating} / {item.num_reviews} reviews
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        onChangeText={handleSearch}
        value={searchText}
        placeholder="Search for restaurants"
        placeholderTextColor="gray"
      />
      <TouchableOpacity
        style={styles.cityPickerButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.cityPickerButtonText}>
          {selectedCity.name} <Icon name="chevron-down" size={12} />
        </Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <FlatList
            data={cityList}
            renderItem={renderCityItem}
            keyExtractor={item => item.location_id}
          />
        </View>
      </Modal>
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item, index) => item.location_id + index.toString()}
        contentContainerStyle={styles.restaurantListContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchInput: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    color: 'black',
  },
  restaurantItemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  restaurantItemImage: {
    width: 120,
    height: 120,
  },
  restaurantItemDetails: {
    padding: 10,
    justifyContent: 'space-between',
  },
  restaurantItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    width: 240,
  },
  restaurantItemAddress: {
    fontSize: 14,
    color: 'black',
  },
  restaurantListContent: {
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  cityPickerButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
  },
  cityPickerButtonText: {
    fontSize: 16,
    color: 'black',
  },
  modalView: {
    backgroundColor: 'white',
    marginTop: 120,
    marginBottom: 0,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  cityPickerItem: {
    paddingVertical: 8,
  },
  cityPickerItemText: {
    fontSize: 16,
    color: 'black',
  },
});

export default Restaurant;
