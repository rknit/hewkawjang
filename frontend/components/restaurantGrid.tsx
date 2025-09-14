import RestaurantCardWithImage from '@/components/restaurantCardWithImage';
import { View } from 'react-native';

const RESTAURANTS_DATA = [
  {
    name: 'Pagoda Chinese Restaurant',
    address: "@ Bangkok Marriott Marquis Queen's Park",
    tags: ['Phrom Phong', 'Chinese Cuisine'],
    rating: 4.5,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Barcelona Gaudi',
    address: 'Asok • European',
    tags: ['Asok', 'European'],
    rating: 4.5,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'BARSUI @ Sheraton Grande Sukhumvit Hotel',
    address: 'Asok • Bars and pubs',
    tags: ['Asok', 'Bars and pubs'],
    rating: 4.4,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Great Harbour International Buffet @ ICONSIAM',
    address: 'Charoen Nakhon • Buffet',
    tags: ['Charoen Nakhon', 'Buffet'],
    rating: 4.5,
    prices: 5,
    isNew: true,
    image: {
      uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Sirocco Sky Bar',
    address: 'Silom • Fine Dining',
    tags: ['Silom', 'Fine Dining', 'Rooftop'],
    rating: 4.7,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Gaggan Anand',
    address: 'Lumpini • Indian Fusion',
    tags: ['Lumpini', 'Indian Fusion'],
    rating: 4.8,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Chatuchak Weekend Market',
    address: 'Chatuchak • Street Food',
    tags: ['Chatuchak', 'Street Food', 'Market'],
    rating: 4.3,
    prices: 2,
    image: {
      uri: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Blue Elephant',
    address: 'Sathorn • Thai Cuisine',
    tags: ['Sathorn', 'Thai Cuisine'],
    rating: 4.4,
    prices: 4,
    image: {
      uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Vertigo and Moon Bar',
    address: 'Silom • International',
    tags: ['Silom', 'International', 'Rooftop'],
    rating: 4.6,
    prices: 5,
    isNew: true,
    image: {
      uri: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Sorn',
    address: 'Thonglor • Southern Thai',
    tags: ['Thonglor', 'Southern Thai'],
    rating: 4.9,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Terminal 21 Food Court',
    address: 'Asok • Food Court',
    tags: ['Asok', 'Food Court', 'International'],
    rating: 4.2,
    prices: 2,
    image: {
      uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Le Du',
    address: 'Silom • Modern Thai',
    tags: ['Silom', 'Modern Thai', 'Michelin Star'],
    rating: 4.8,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    },
  },
];

export default function RestaurantGrid() {
  return (
    <View className="p-4 w-9/12 mx-auto">
      <View className="flex-row flex-wrap justify-between">
        {RESTAURANTS_DATA.map((restaurant, index) => (
          <View key={index} className="w-[48%] mb-3">
            <RestaurantCardWithImage
              name={restaurant.name}
              address={restaurant.address}
              tags={restaurant.tags}
              rating={restaurant.rating}
              prices={restaurant.prices}
              image={restaurant.image}
              isNew={restaurant.isNew}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
