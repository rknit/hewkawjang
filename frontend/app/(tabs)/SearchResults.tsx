import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { searchRestaurants } from '@/apis/restaurant.api';
import RestaurantList from '@/components/restaurantList';
import type { RestaurantWithRating } from '@/types/restaurant.type';
import HomePageTemplate from '@/components/homepageTemplate';

export default function SearchResults() {
  const [restaurants, setRestaurants] = useState<RestaurantWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data } = useLocalSearchParams();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);

        // Decode search parameters
        const searchParams = data ? JSON.parse(atob(data as string)) : null;

        if (!searchParams) {
          setError('No search parameters provided');
          return;
        }

        // console.log('Search params:', searchParams);

        const results = await searchRestaurants(searchParams);

        setRestaurants(results.restaurants);
        setError(null);
      } catch (err) {
        setError('Failed to load search results');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      fetchSearchResults();
    }
  }, [data]);

  return (
    <HomePageTemplate>
      <RestaurantList
        restaurants={restaurants}
        loading={loading}
        error={error}
      />
    </HomePageTemplate>
  );
}
