import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const categories = [
  { id: 1, name: 'Buffet', image: require('../assets/images/buffet.png') },
  { id: 2, name: 'Indian', image: require('../assets/images/indian.png') },
  { id: 3, name: 'Italian', image: require('../assets/images/italian.png') },
  { id: 4, name: 'Japanese', image: require('../assets/images/japanese.png') },
  { id: 5, name: 'Chinese', image: require('../assets/images/chinese.png') },
];

export default function CategoryRow() {
  const handleCategoryPress = (categoryName: string) => {
    const searchParams = {
      query: '',
      district: '',
      priceRange: { min: 0, max: 10000 },
      cuisineTypes: [categoryName],
      minRating: 0,
      sortBy: {
        field: 'rating',
        order: 'desc'
      },
      offset: 0,
      limit: 20,
    };

    router.push({
      pathname: '/SearchResults',
      params: {
        data: btoa(JSON.stringify(searchParams)),
      }
    });
  };

  return (
    <View className="flex-row justify-between px-4 w-2/3">
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          className="flex flex-col items-center"
          activeOpacity={0.7}
          onPress={() => handleCategoryPress(cat.name)}
        >
          <Image
            source={cat.image}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            resizeMode="contain"
          />
          <Text
            className="mt-2 text-sm font-medium text-gray-800"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}