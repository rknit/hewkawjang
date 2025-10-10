import React, {useEffect, useState} from "react";
import { View, SafeAreaView, ScrollView, Text, TouchableOpacity } from "react-native";
import ImageGallery from "@/components/image-gallery";
import CommentList from "@/components/commentList";
import CommentSummary from "@/components/commentSummary";
import RestaurantAbout, {RestaurantAboutProps} from "@/components/restaurantAbout";
import ReviewSection from "@/components/reviewSection";
import RestaurantCard, {RestaurantProps} from "@/components/restaurantCard";
import { fetchRestaurantById, fetchRestaurantOpeningHours } from "@/apis/restaurant.api";
import { OpeningHour, Restaurant } from "@/types/restaurant.type";

const RestaurantPreview: React.FC<{ restaurantId: number }> = ({ restaurantId = 13 }) => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
    
    useEffect(() => {
        const loadData = async () => {
            const resData = await fetchRestaurantById(restaurantId);
            console.log(resData);

            const hours = await fetchRestaurantOpeningHours(restaurantId);
            console.log(hours);

            if (resData) setRestaurant(resData );
                setOpeningHours(hours);
        };

        loadData();
    }, [restaurantId]);

    const restaurantData: RestaurantProps = {
        name: restaurant?.name ?? "Unknown Restaurant",
        address: restaurant
            ? `${restaurant.houseNo ?? ""} ${restaurant.road ?? ""}, ${restaurant.subDistrict ?? ""}, ${restaurant.district ?? ""}, ${restaurant.province ?? ""}`
            : "Unknown Address",
        tags: [], // you can set default tags or get from API
        rating: 4,
        prices: restaurant?.priceRange ?? 0,
        openingHours: openingHours ?? [],
    };

    const aboutData: RestaurantAboutProps = {
        address: restaurant
            ? `${restaurant.houseNo ?? ""} ${restaurant.road ?? ""}, ${restaurant.subDistrict ?? ""}, ${restaurant.district ?? ""}, ${restaurant.province ?? ""}`
            : "Unknown Address",
        description: restaurant?.description ?? "Unknown Description",
        cuisine: "Buffet",
        paymentOptions: ["MasterCard", "HewKawJangWallet"],
    };

  const pictures: string[] = [
    "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=400&q=80", // workspace
    "https://images.unsplash.com/photo-1581291519195-ef11498d1cf2?auto=format&fit=crop&w=400&q=80", // portrait
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", // forest
    "https://images.unsplash.com/photo-1593642532871-8b12e02d091c?auto=format&fit=crop&w=400&q=80", // desk
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80", // mountain
    "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=400&q=80", // workspace
    "https://images.unsplash.com/photo-1581291519195-ef11498d1cf2?auto=format&fit=crop&w=400&q=80", // portrait
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", // forest
    "https://images.unsplash.com/photo-1593642532871-8b12e02d091c?auto=format&fit=crop&w=400&q=80", // desk
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80", // mountain
  ];
  const mockComments = [
    {
        id: "1",
        name: "BankEatLaek",
        avatar: "https://placekitten.com/100/100",
        rating: 5,
        comment:
        "Amazing experience from start to finish! The food was fresh, flavorful, and beautifully presented. Service was friendly and attentive, and the atmosphere made it perfect for a memorable night out.",
        date: "1 days ago",
    },
    {
        id: "2",
        name: "FoodieGirl",
        avatar: "https://placekitten.com/101/101",
        rating: 4,
        comment:
        "The food was really good, but the service was a bit slow. Still, worth a visit!",
        date: "3 days ago",
    },
    {
        id: "3",
        name: "HungryMan",
        avatar: "https://placekitten.com/102/102",
        rating: 5,
        comment:
        "Best dining experience I’ve had in a long time. Highly recommended!",
        date: "5 days ago",
    },
        {
        id: "4",
        name: "BankEatLaek",
        avatar: "https://placekitten.com/100/100",
        rating: 5,
        comment:
        "Amazing experience from start to finish! The food was fresh, flavorful, and beautifully presented. Service was friendly and attentive, and the atmosphere made it perfect for a memorable night out.",
        date: "1 days ago",
    },
    {
        id: "5",
        name: "FoodieGirl",
        avatar: "https://placekitten.com/101/101",
        rating: 4,
        comment:
        "The food was really good, but the service was a bit slow. Still, worth a visit!",
        date: "3 days ago",
    },
    {
        id: "6",
        name: "HungryMan",
        avatar: "https://placekitten.com/102/102",
        rating: 5,
        comment:
        "Best dining experience I’ve had in a long time. Highly recommended!",
        date: "5 days ago",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white items-center">
        <View className="w-[100%] h-[50px] bg-gray-300 flex-row items-center justify-center px-4">
            <Text className="text-black text-base mr-[10px]">This is your Restaurant Preview</Text>

            <TouchableOpacity
                className="bg-blue-500 px-3 py-1 rounded bg-gray-500 px-[20px]"
                onPress={() => alert('Button pressed!')}
            >
                <Text className="text-white">Exit</Text>
            </TouchableOpacity>
        </View>
        <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="flex-row">
                {/* First column */}
                <View className="w-[50%] min-w-[500px] max-w-[600px] p-[20px] space-y-6">
                    <ImageGallery images={pictures} />

                    <ReviewSection
                        comments={mockComments}
                        average={4.5}
                        totalReviews={2900}
                        breakdown={{ 5: 2000, 4: 600, 3: 200, 2: 80, 1: 20 }}
                    />

                    <RestaurantAbout
                        {...aboutData}
                    />
                </View>

                {/* Second column */}
                <View className="w-[50%] min-w-[500px] max-w-[600px] mt-[20px] p-[20px]">
                    <RestaurantCard {...restaurantData} />

                    <TouchableOpacity
                        className="bg-orange-500 px-6 py-3 rounded-md mt-4 w-[120px] items-center"
                        onPress={() => alert("Reserve button pressed!")}
                    >
                        <Text className="text-white font-semibold">Reserve</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default RestaurantPreview;
