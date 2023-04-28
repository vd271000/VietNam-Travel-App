import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from 'react-native';
import {TabView, TabBar} from 'react-native-tab-view';
import {colors} from '../../constants';

// quotes
const QuotesTab = ({quotes, groups, navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [addresses, setAddresses] = useState({});
  const showGroupDetails = groupId => {
    const group = groups.find(g => g.id === groupId);
    setSelectedGroup(group);
    setModalVisible(true);
  };

  async function getAddressFromCoordinates(lat, lon) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en`,
    );
    const data = await response.json();
    return data.display_name;
  }

  const fetchAddresses = async () => {
    const newAddresses = {};

    for (const quote of quotes) {
      const pickupCoordinates = quote.pu.split(',');
      const dropoffCoordinates = quote.do.split(',');
      const officeCoordinates = quote.office_id.split(',');

      const pickupAddress = await getAddressFromCoordinates(
        pickupCoordinates[0],
        pickupCoordinates[1],
      );
      const dropoffAddress = await getAddressFromCoordinates(
        dropoffCoordinates[0],
        dropoffCoordinates[1],
      );
      const officeAddress = await getAddressFromCoordinates(
        officeCoordinates[0],
        officeCoordinates[1],
      );

      newAddresses[quote.id] = {pickupAddress, dropoffAddress, officeAddress};
    }

    setAddresses(newAddresses);
  };

  useEffect(() => {
    fetchAddresses();
  }, [quotes]);

  const fuelPolicy = {
    full_to_full: 'full fuel tank',
    pre_purchase_with_partial_refund: 'Buy in advance with partial refund',
  };

  const renderItem = ({item}) => {
    const pickupAddress = addresses[item.id]?.pickupAddress || 'Loading...';
    const dropoffAddress = addresses[item.id]?.dropoffAddress || 'Loading...';
    const officeAddress = addresses[item.id]?.officeAddress || 'Loading...';
    const fuelPolicyText = fuelPolicy[item.fuel_pol] || item.fuel_pol;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.quoteContainer}
        onPress={() =>
          navigation.navigate('CarDetail', {
            quote: item,
            group: item.group,
            modal: item.modal,
            groups: groups,
          })
        }>
        <Text style={styles.nameCar}>Vehicle name: {item.car_name}</Text>
        <Text style={styles.label}>
          Supplier: {item.vndr}({item.prv_id})
        </Text>
        <Text style={styles.label}>Fuel policy: {fuelPolicyText}</Text>
        <Text style={styles.label}>Vehicle Type: {item.sipp}</Text>
        <Text style={styles.label}>Pickup method: {item.pickup_method}</Text>
        <Text style={styles.label}>
          Free cancellation: {item.adds.free_cancel ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.label}>
          Unlimited mileage: {item.unlim_mlg ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.label}>
          Included mileage:{' '}
          {item.incl_mlg
            ? `${item.incl_mlg.dist} ${item.incl_mlg.unit}`
            : 'Loading...'}
        </Text>
        <Text style={styles.label}>Supplier rating: {item.score}</Text>
        <Text style={styles.label}>New supplier rating: {item.new_score}</Text>
        <Text style={styles.label}>Number of bags: {item.bags}</Text>
        <View style={styles.row}></View>

        <Text style={styles.label}>Pickup address: {pickupAddress}</Text>
        <View style={styles.row}></View>

        <Text style={styles.label}>Drop-off address: {dropoffAddress}</Text>
        <View style={styles.row}></View>

        <Text style={styles.label}>Office: {officeAddress}</Text>

        <View style={styles.row}></View>
        <View style={styles.containerPrice}>
          <TouchableOpacity style={styles.groupToch}>
            <Text
              onPress={() => showGroupDetails(item.group)}
              style={{color: 'black', alignSelf: 'center', paddingTop: 3}}>
              Show vehicle details {item.group}
            </Text>
          </TouchableOpacity>
          <Text style={styles.labelPrice}>${item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedGroup && (
              <>
                <Text>Group Name: {selectedGroup.id}</Text>
                <Text>Car Name: {selectedGroup.car_name}</Text>
                <Text>Air Conditioning: {selectedGroup.ac ? 'Yes' : 'No'}</Text>
                <Text>Highest Score: {selectedGroup.max_score}</Text>
                <Text>Maximum Seats: {selectedGroup.max_seats}</Text>
                <Text>Lowest Price: ${selectedGroup.min_price}</Text>
                <Text>Average Price: ${selectedGroup.mean_price}</Text>
                <Text>Number of Doors: {selectedGroup.doors}</Text>
                <Text>Maximum Bags: {selectedGroup.max_bags}</Text>
                <Text>Transmission: {selectedGroup.trans}</Text>
                <Text>Class: {selectedGroup.cls}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.openButton}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}>
              <Text style={styles.textStyle}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <FlatList
          data={quotes}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={{marginTop: 100}}>
              <Image
                source={require('../../assets/empty-box.png')}
                style={{width: 100, height: 100, alignSelf: 'center'}}></Image>
              <Text style={styles.emptyTextOne}>
                No car companies matched your request
              </Text>
              <Text style={styles.emptyText}>
                It is recommended to choose pick up and drop off times during
                regular business hours (10:00 - 18:00) and we recommend choosing
                even hours like 12:00 - 12:30
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
};

// provider
const ProviderTab = ({providers}) => {
  const renderItem = ({item}) => {
    return (
      <View key={item.id} style={styles.providerContainer}>
        <Text style={styles.nameCar}>ID: {item.name}</Text>
        <Text style={styles.label}>Provider Name: {item.provider_name}</Text>
        <Text style={styles.label}>
          Rating: {item.rating}/{item.reviews} reviews
        </Text>
        <Text style={styles.label}>
          Optimized for Mobile: {item.optimised_for_mobile ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.label}>
          Facilitated Booking Enabled:{' '}
          {item.facilitated_booking_enabled ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.label}>Errored: {item.errored ? 'Yes' : 'No'}</Text>
        <Text style={styles.label}>
          In Progress: {item.in_progress ? 'Yes' : 'No'}
        </Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={providers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const CarList = ({navigation, route}) => {
  const [index, setIndex] = useState(0);
  const {quotes, providers, groups} = route.params;
  const [routes] = useState([
    {key: 'quotes', title: 'Cars'},
    {key: 'provider', title: 'Provider'},
  ]);

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'quotes':
        return (
          <QuotesTab quotes={quotes} groups={groups} navigation={navigation} />
        );
      case 'provider':
        return <ProviderTab providers={providers} />;
      default:
        return null;
    }
  };

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: 'black'}}
      style={{backgroundColor: 'white'}}
      labelStyle={{fontWeight: 'bold'}}
      activeColor="black"
      inactiveColor="black"
    />
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: '100%'}}
        renderTabBar={renderTabBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  quoteContainer: {
    backgroundColor: '#e6e6e6',
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
  },
  providerContainer: {
    backgroundColor: '#e6e6e6',
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'gray',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: 100,
    height: 50,
  },
  containerPrice: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  groupToch: {
    backgroundColor: colors.primary1,
    width: 200,
    height: 30,
    borderRadius: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyTextOne: {
    textAlign: 'center',
    fontSize: 17,
    color: 'black',
    marginTop: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    marginTop: 20,
  },
  nameCar: {
    color: 'black',
    fontWeight: 'bold',
    color: 'black',
    fontSize: 17,
  },
  label: {
    color: 'black',
    fontSize: 14,
  },
  labelPrice: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  row: {
    backgroundColor: 'gray',
    height: 1,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
});

export default CarList;
