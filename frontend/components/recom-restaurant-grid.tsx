import { fetchRestaurants } from '@/apis/restaurant.api';
import RecommendedRestaurantCard from '@/components/recom-restaurant-card';
import { Restaurant } from '@/types/restaurant.type';
import { calculatePriceRange } from '@/utils/price-range';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

const RESTAURANTS_DATA = [
  {
    name: 'Pagoda Chinese Restaurant',
    address: '399/9 Sukhumvit Rd, Phrom Phong, Bangkok 10110',
    tags: ['Phrom Phong', 'Chinese Cuisine'],
    rating: 4.5,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Barcelona Gaudi',
    address: '21 Sukhumvit Soi 11, Asok, Bangkok 10110',
    tags: ['Asok', 'European'],
    rating: 4.5,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'BARSUI @ Sheraton Grande Sukhumvit Hotel',
    address: '250 Sukhumvit Rd, Asok, Bangkok 10110',
    tags: ['Asok', 'Bars and pubs'],
    rating: 4.4,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Great Harbour International Buffet @ ICONSIAM',
    address: '299 Charoen Nakhon Rd, Khlong Ton Sai, Bangkok 10600',
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
    address: '1055 Silom Rd, State Tower 63rd Floor, Bangkok 10500',
    tags: ['Silom', 'Fine Dining', 'Rooftop'],
    rating: 4.7,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Gaggan Anand',
    address: '68/1 Soi Langsuan, Lumpini, Bangkok 10330',
    tags: ['Lumpini', 'Indian Fusion'],
    rating: 4.8,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Vertigo and Moon Bar',
    address: '61 South Sathorn Rd, Banyan Tree Hotel 61st Floor, Bangkok 10120',
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
    address: '56 Sukhumvit Soi 26, Thonglor, Bangkok 10110',
    tags: ['Thonglor', 'Southern Thai'],
    rating: 4.9,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Terminal 21 Food Court',
    address: '88 Sukhumvit Soi 19, Asok Intersection, Bangkok 10110',
    tags: ['Asok', 'Food Court', 'International'],
    rating: 4.2,
    prices: 2,
    image: {
      uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    },
  },
  {
    name: 'Le Du',
    address: '399/3 Silom Soi 7, Silom, Bangkok 10500',
    tags: ['Silom', 'Modern Thai', 'Michelin Star'],
    rating: 4.8,
    prices: 5,
    image: {
      uri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    },
  },
];

export default function RecommendedRestaurantGrid() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>();

  useEffect(() => {
    fetchRestaurants().then((data) => setRestaurants(data));
  }, []);

  const makeAddress = (restaurant: Restaurant): string => {
    const parts = [
      restaurant.houseNo,
      restaurant.village,
      restaurant.building,
      restaurant.road,
      restaurant.soi,
      restaurant.subDistrict,
      restaurant.district,
      restaurant.province,
      restaurant.postalCode,
    ].filter((part) => part && part.trim() !== '');
    return parts.join(', ');
  };

  return (
    <View className="p-4 w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
      {restaurants &&
        restaurants.map((restaurant, index) => {
          const fallbackImage = 'https://uhrpfnyjcvpwoaioviih.supabase.co/storage/v1/object/public/test/photo-1517248135467-4c7edcad34c4.jpg';
          const imageUri = restaurant.images?.[0] || fallbackImage;

          return (
            <RecommendedRestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.name}
              address={makeAddress(restaurant)}
              tags={RESTAURANTS_DATA[index % RESTAURANTS_DATA.length].tags}
              rating={RESTAURANTS_DATA[index % RESTAURANTS_DATA.length].rating}
              prices={calculatePriceRange(restaurant.priceRange ?? 0)}
              image={{ uri: imageUri }}
              isNew={RESTAURANTS_DATA[index % RESTAURANTS_DATA.length].isNew}
            />
          );
        })}
    </View>
  );
}
