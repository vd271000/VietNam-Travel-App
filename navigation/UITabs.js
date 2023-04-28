import React, {useState, useEffect} from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from '../constants'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { HomePage, Destination, Settings, Storage } from "../screens";
import { CustomTabBar } from '../components';

const Tab = createBottomTabNavigator()

const screenOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: 'white',
  tabBarInactiveTintColor: colors.inactive,
  tabBarActiveBackgroundColor: colors.primary,
  tabBarInactiveBackgroundColor: colors.primary,
  tabBarIcon: ({ focused, color}) => {
    let iconName;
    if (route.name === 'HomePage') {
      iconName = focused ? 'home' : 'home';
    } else if (route.name === 'Destination') {
      iconName = focused ? 'map-marked-alt' : 'map-marked-alt';
    } else if (route.name === 'Storage') {
      iconName = focused ? 'shopping-cart' : 'shopping-cart';
    } else if (route.name === 'Settings') {
      iconName = focused ? 'user-cog' : 'user-cog';
    }
    return <FontAwesome5 name={iconName} size={20} color={color} />;
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  tabBarStyle: {
    backgroundColor: colors.primary,
    elevation: 0,
    borderTopColor: 'black',
    borderTopWidth: 1,
  },
})

const UITabs = (props) => {
  return (
    <Tab.Navigator screenOptions={screenOptions} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name={"HomePage"} component={HomePage} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name={"Destination"} component={Destination} options={{ tabBarLabel: 'Destination' }} />
      <Tab.Screen name={"Storage"} component={Storage} options={{ tabBarLabel: 'Purchase' }} />
      <Tab.Screen name={"Settings"} component={Settings} options={{ tabBarLabel: 'Setting' }} />
    </Tab.Navigator>
  )
}

export default UITabs
