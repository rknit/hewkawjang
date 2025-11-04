import CategoryRow from '@/components/categoryRow';
import HomePageTemplate from '@/components/homepageTemplate';
import RecommendedRestaurantGrid from '@/components/recom-restaurant-grid';

export default function Index() {
  return (
    <HomePageTemplate>
      <CategoryRow />
      <RecommendedRestaurantGrid />
    </HomePageTemplate>
  );
}
