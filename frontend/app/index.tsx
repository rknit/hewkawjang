import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const MainPage = () => {
  const cuisineTypes = [
    { name: 'Buffet', emoji: '🍲' },
    { name: 'Indian', emoji: '🍛' },
    { name: 'Italian', emoji: '🍕' },
    { name: 'Japanese', emoji: '🍣' },
    { name: 'Chinese', emoji: '🥟' }
  ];

  const restaurants = [
    {
      id: 1,
      name: 'Pagoda Chinese Restaurant @ Bangkok Marriott Marquis Queen\'s Park',
      location: 'Phrom Phong',
      cuisine: 'Chinese Cuisine',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=306&h=187&fit=crop'
    },
    {
      id: 2,
      name: 'Barcelona Gaudi',
      location: 'Asok',
      cuisine: 'European',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=306&h=187&fit=crop'
    },
    {
      id: 3,
      name: 'BARSU @ Sheraton Grande Sukhumvit Hotel',
      location: 'Asok',
      cuisine: 'Bars and pubs',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=306&h=187&fit=crop'
    },
    {
      id: 4,
      name: 'Great Harbour International Buffet @ ICONSIAM',
      location: 'Charoen Nakhon',
      cuisine: 'Buffet',
      rating: 'NEW',
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=306&h=187&fit=crop'
    }
  ];

  const StarRating = ({ rating }) => {
    const stars = [];
    const numericRating = typeof rating === 'string' ? 0 : rating;
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} className={i < Math.floor(numericRating) ? "text-yellow-400" : "text-gray-300"}>
          ★
        </Text>
      );
    }
    
    return (
      <View className="flex-row items-center">
        <Text className="text-yellow-400 mr-1">★</Text>
        <Text className="text-black text-sm mr-2">
          {typeof rating === 'string' ? rating : rating.toString()}
        </Text>
        <View className="flex-row">
          {stars}
        </View>
      </View>
    );
  };

  const BellIcon = () => (
    <View className="w-12 h-12 items-center justify-center">
      <Text className="text-2xl">🔔</Text>
    </View>
  );

  const SearchIcon = () => (
    <View className="w-6 h-6 items-center justify-center">
      <Text className="text-lg">🔍</Text>
    </View>
  );

  const FilterIcon = () => (
    <View className="w-6 h-6 items-center justify-center">
      <Text className="text-lg">⚙️</Text>
    </View>
  );

  const CalendarIcon = () => (
    <View className="w-6 h-6 items-center justify-center">
      <Text className="text-lg">📅</Text>
    </View>
  );

  const RestaurantCard = ({ restaurant }) => (
    <View className="bg-orange-50 rounded-lg overflow-hidden mb-4 mx-4 border border-gray-200">
      <View className="flex-row">
        <Image
          source={{ uri: restaurant.image }}
          className="w-76 h-47"
          style={{ width: 306, height: 187 }}
          resizeMode="cover"
        />
        <View className="flex-1 p-4">
          <Text className="text-base font-medium text-black mb-2 leading-5" numberOfLines={2}>
            {restaurant.name}
          </Text>
          <View className="flex-row mb-4">
            <Text className="text-xs text-black mr-2">{restaurant.location}</Text>
            <Text className="text-xs text-black">{restaurant.cuisine}</Text>
          </View>
          <StarRating rating={restaurant.rating} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FEF9F3" />
      
      <ScrollView className="flex-1">

        {/* Main Content */}
        <View className="px-4 py-6">
          {/* Title Section */}
          <View className="items-center mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-20 h-20 bg-orange-200 rounded-full mr-4 items-center justify-center">
                <Text className="text-4xl">👨‍🍳</Text>
              </View>
              <Text className="text-orange-600 text-3xl font-medium">HEW KAW JANG</Text>
            </View>
            <Text className="text-black text-xl text-center px-4">
              From Hunger to Happiness — One Reservation Away.
            </Text>
          </View>

          {/* Search Bar */}
          <View className="bg-orange-50 border border-black rounded-lg flex-row items-center px-4 py-3 mb-6 mx-4">
            <SearchIcon />
            <TextInput
              placeholder="Search restaurants..."
              className="flex-1 text-base ml-3"
              placeholderTextColor="#666"
            />
            <TouchableOpacity className="bg-gray-300 border border-black rounded p-2 mr-2">
              <FilterIcon />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-300 border border-black rounded p-2">
              <CalendarIcon />
            </TouchableOpacity>
          </View>

        

          {/* Cuisine Types */}
          <View className="flex-row justify-between px-4 mb-6">
            {cuisineTypes.map((cuisine, index) => (
              <TouchableOpacity key={index} className="items-center">
                <View className="w-16 h-16 bg-white rounded-full shadow-lg items-center justify-center mb-2 border border-gray-100">
                  <Text className="text-3xl">{cuisine.emoji}</Text>
                </View>
                <Text className="text-black text-base">{cuisine.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Restaurant List */}
        <View className="px-4 pb-6">
          <View className="flex-row flex-wrap justify-between">
            {restaurants.map((restaurant) => (
              <View key={restaurant.id} className="w-1/2 mb-2">
                <RestaurantCard restaurant={restaurant} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainPage;