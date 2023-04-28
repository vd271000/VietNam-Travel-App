import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet} from 'react-native';
import CategoryList from './CategoryList';
import {fetchDestination} from '../api';

const cityList = [
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
  {name: 'Hue', location_id: '293926'},
  {name: 'Sapa', location_id: '311304'},
  {name: 'Ha Long Bay', location_id: '1968469'},
  {name: 'Quy Nhon', location_id: '608528'},
  {name: 'Mui Ne Beach', location_id: '4412570'},
  {name: 'Cat Ba Island', location_id: '386683'}
];

function Destination({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleCategoryPress = async (location_id) => {
    const destinations = await fetchDestination(location_id);
    const city = cityList.find((city) => city.location_id === location_id);
    if (city) {
      navigation.navigate("DestinationList", {
        selectedDestination: city.name,
        destinations: destinations,
        selectedId: location_id,
      });
    }
  };

  const handleSearchTextChange = (text) => {
    setSearchText(text);

    if (text === "") {
      setSearchResults([]);
    } else {
      const searchCities = cityList.filter((city) =>
        city.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(searchCities);
    }
  };

  const renderSearchResultItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleCategoryPress(item.location_id)}>
        <Text style={styles.text}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          marginTop: 10,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 4,
            paddingHorizontal: 10,
            paddingVertical: 5,
            color: "black",
            fontSize: 16,
          }}
          onChangeText={handleSearchTextChange}
          value={searchText}
          placeholder="Search destination"
          placeholderTextColor={"black"}
        />
      </View>
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResultItem}
          keyExtractor={(item) => item.location_id}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
      <CategoryList onCategoryPress={handleCategoryPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "black",
    fontSize: 15,
    padding: 5,
  },
});
export default Destination;
