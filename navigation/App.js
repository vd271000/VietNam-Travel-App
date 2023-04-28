import React from 'react';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UITabs from './UITabs';
import {
  Welcome,
  Hotel,
  Flight,
  Car,
  Restaurant,
  DestinationDetail,
  RestaurantDetail,
  DestinationList,
  FlightDetails,
  FlightList,
  HotelDetail,
  CarDetail,
  CarList,
  Profile,
  HotelList,
} from '../screens';
import store from '../screens/store';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name={'Welcome'} component={Welcome} />
          <Stack.Screen name={'UITabs'} component={UITabs} />
          <Stack.Screen name={'Hotel'} component={Hotel} />
          <Stack.Screen name={'Flight'} component={Flight} />
          <Stack.Screen name={'Car'} component={Car} />
          <Stack.Screen name={'Restaurant'} component={Restaurant} />
          <Stack.Screen
            name={'RestaurantDetail'}
            component={RestaurantDetail}
          />
          <Stack.Screen
            name={'DestinationDetail'}
            component={DestinationDetail}
          />
          <Stack.Screen name={'DestinationList'} component={DestinationList} />
          <Stack.Screen name={'FlightDetails'} component={FlightDetails} />
          <Stack.Screen name={'FlightList'} component={FlightList} />
          <Stack.Screen name={'HotelDetail'} component={HotelDetail} />
          <Stack.Screen name={'CarDetail'} component={CarDetail} />
          <Stack.Screen name={'CarList'} component={CarList} />
          <Stack.Screen name={'Profile'} component={Profile} />
          <Stack.Screen name={'HotelList'} component={HotelList} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
