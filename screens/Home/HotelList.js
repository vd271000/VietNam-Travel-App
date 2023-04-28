import React, {useState, useCallback, useEffect} from 'react';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {fetchHotels} from '../api';

const HotelList = ({route, navigation}) => {
  const {hotels: initialHotels, cityName, checkIn, checkOut} = route.params;
  const parsedCheckIn = new Date(checkIn);
  const parsedCheckOut = new Date(checkOut);
  const [hotels, setHotels] = useState(initialHotels || []);
  const [searchValue, setSearchValue] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = hotel => {
    navigation.navigate('HotelDetail', {
      hotelId: hotel.id,
      checkIn: parsedCheckIn.toISOString(),
      checkOut: parsedCheckOut.toISOString(),
    });
  };

  useEffect(() => {
    handleLoadMore();
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    const pageNumber = Math.ceil(hotels.length / 30) + 1;
    await new Promise(resolve => setTimeout(resolve, 200000));
    const additionalHotels = await fetchHotels(
      route.params.geoId,
      parsedCheckIn,
      parsedCheckOut,
      pageNumber.toString(),
      {
        sort: route.params.selectedSort,
        deals: route.params.selectedDeals,
        price: route.params.selectedPrice,
        propertyType: route.params.selectedPropertyType,
        amenities: route.params.selectedAmenities,
        rating: route.params.selectedRating,
        hotelClass: route.params.selectedHotelClass,
        style: route.params.selectedStyle,
        adults: route.params.adults,
        rooms: route.params.rooms,
        childrenAges: route.params.childrenAges,
      },
    );
    setIsLoading(false);
    if (Array.isArray(additionalHotels)) {
      setHotels(prevHotels => [
        ...prevHotels,
        ...additionalHotels.slice(0, 30),
      ]);

      if (additionalHotels.length < 30) {
        setHasMore(false);
      } else {
        setPageNumber(pageNumber + 1);
      }
    } else {
      console.error('Error: fetchHotels did not return an array');
    }
  }, [
    hotels,
    route.params.geoId,
    parsedCheckIn,
    parsedCheckOut,
    hasMore,
    pageNumber,
    isLoading,
  ]);

  const filteredHotels = hotels.filter(hotel =>
    hotel.title.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  const renderItem = ({item, index}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        handlePress(item);
      }}
      key={item.id.toString() + '_' + index}>
      {item.cardPhotos && item.cardPhotos[0] && item.cardPhotos[0].sizes ? (
        <Image
          source={{
            uri: item.cardPhotos[0].sizes.urlTemplate
              .replace('{width}', '100')
              .replace('{height}', '100'),
          }}
          style={styles.hotelImage}
        />
      ) : (
        <View style={styles.hotelImagePlaceholder}></View>
      )}
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.title}</Text>
        <Text style={styles.hotelRating}>
          Rating: {item.bubbleRating.rating} / 5 (Number of Reviews:{' '}
          {item.bubbleRating.count})
        </Text>
        <Text style={styles.hotelPrice}>Price: {item.priceForDisplay}</Text>
        {item.strikethroughPrice && (
          <Text style={styles.hotelOldPrice}>
            Old price: {item.strikethroughPrice}
          </Text>
        )}
        <Text style={styles.hotelProvider}>Provider: {item.provider}</Text>
        <Text style={styles.hotelPriceDetails}>
          Price details: {item.priceDetails}
        </Text>
      </View>
    </TouchableOpacity>
  );

  console.log(`Số lượng khách sạn: ${hotels?.length}`);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Danh sách khách sạn ở {cityName}</Text>
      <TextInput
        style={styles.searchInput}
        onChangeText={text => setSearchValue(text)}
        value={searchValue}
        placeholder="Tìm kiếm theo tên khách sạn..."
      />
      <Text style={styles.totalHotels}>
        Number of hotels: {filteredHotels?.length}{' '}
      </Text>
      <FlatList
        data={filteredHotels}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id.toString() + '_' + index}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  hotelImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginLeft: 10,
  },
  hotelInfo: {
    marginLeft: 20,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hotelRating: {
    fontSize: 14,
    color: '#666',
  },
  hotelPrice: {
    fontSize: 14,
    color: 'green',
  },
  hotelOldPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  hotelProvider: {
    fontSize: 14,
    color: '#777',
  },
  hotelPriceDetails: {
    fontSize: 14,
    color: '#555',
  },
  totalHotels: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    margin: 10,
    padding: 10,
  },
  hotelPriceDetails: {
    fontSize: 14,
    color: '#555',
    flexWrap: 'wrap',
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#CED0CE',
  },
});

export default HotelList;
