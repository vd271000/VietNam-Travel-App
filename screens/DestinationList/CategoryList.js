import React, {useState} from 'react';
import { Text, View, Image, TouchableOpacity, FlatList } from 'react-native';

function CategoryList({ onCategoryPress }) {
  const [categories, setCategories] = useState([
    {
      nameCate: 'Ha Noi',
      location_id: '293924',
      urlCate:
        'https://images.unsplash.com/photo-1649932988918-6e11ed49ac64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8SCVFMSVCQiU5MyUyMGclQzYlQjAlQzYlQTFtfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Ho Chi Minh',
      location_id: '293925',
      urlCate:
        'https://images.unsplash.com/photo-1603852452440-b383ac720729?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fEglRTElQkIlOTMlMjBnJUM2JUIwJUM2JUExbXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Da Nang',
      location_id: '293926',
      urlCate:
        'https://images.unsplash.com/photo-1620976128192-7181e9f91342?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZGElMjBuYW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Can Tho',
      location_id: '293927',
      urlCate:
        'https://go2joy.s3.ap-southeast-1.amazonaws.com/blog/wp-content/uploads/2022/04/01225346/du-thuyen-ben-ninh-kieu-can-tho.jpg',
    },
    {
      nameCate: 'Hai Phong',
      location_id: '303944',
      urlCate:
        'https://images.unsplash.com/photo-1593019666403-91d57229f1b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8SGFpJTIwUGhvbmd8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Nha Trang',
      location_id: '2227712',
      urlCate:
        'https://images.unsplash.com/photo-1629214064045-c95a91c4e0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDF8fE5oYSUyMFRyYW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Da Lat',
      location_id: '293922',
      urlCate:
        'https://images.unsplash.com/photo-1552310065-aad9ebece999?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8RGElMjBMYXR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Phu Quoc Island',
      location_id: '469418',
      urlCate:
        'https://images.unsplash.com/photo-1609597254239-d9ace3c0b39c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8UGh1JTIwUXVvY3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Vung Tau',
      location_id: '303946',
      urlCate:
        'https://images.unsplash.com/photo-1583647515538-3f4f972971cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NTd8fFZ1bmclMjBUYXV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Hoi An',
      location_id: '298082',
      urlCate:
        'https://images.unsplash.com/photo-1582379481622-4282045b474f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8SG9pJTIwQW58ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Hue',
      location_id: '293926',
      urlCate:
        'https://images.unsplash.com/photo-1600352894979-3ead7fda6dfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8SHVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Sapa',
      location_id: '311304',
      urlCate:
        'https://images.unsplash.com/photo-1584003654022-074f97adc1d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8U2FwYXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Ha Long Bay',
      location_id: '1968469',
      urlCate:
        'https://images.unsplash.com/photo-1632753561897-964f1408b48e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fEhhJTIwTG9uZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Quy Nhon',
      location_id: '608528',
      urlCate:
        'https://images.unsplash.com/photo-1571852294546-1f7b4bb8199b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nzd8fFF1eSUyME5ob258ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Mui Ne',
      location_id: '4412570',
      urlCate:
        'https://images.unsplash.com/photo-1559561875-3059d4a51f74?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjZ8fCdNdWklMjBOZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      nameCate: 'Cat Ba',
      location_id: '386683',
      urlCate:
        'https://images.unsplash.com/photo-1605715283576-e035a56fbb14?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Q2F0JTIwQmF8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    },
  ]);
  

const renderCategoryItem = ({ item }) => {
  return (
    <TouchableOpacity
    onPress={() => onCategoryPress(item.location_id)}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:30
      }}
    >
      <Image
        style={{
          width: 150,
          height: 200,
          resizeMode: 'cover',
          borderRadius: 15,
          margin: 10,
        }}
        source={{
          uri: item.urlCate,
        }}
      />
      <Text
        style={{
          color: 'black',
          fontSize: 17,
          fontWeight: '400',
        }}
      >
        {item.nameCate}
      </Text>
    </TouchableOpacity>
  );
};

return (
  <View style={{flex: 1}}>
    <FlatList
      data={categories}
      keyExtractor={(item) => item.nameCate}
      renderItem={renderCategoryItem}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    />
  </View>
);
}
export default CategoryList