import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const HeaderTabs = ({tabs, selectedTab, setSelectedTab}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => setSelectedTab(tab)}
          style={styles.tab}>
          <Text
            style={[
              styles.tabText,
              selectedTab === tab ? styles.selectedTabText : null,
            ]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    padding: 10,
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
  },
  selectedTabText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default HeaderTabs;
