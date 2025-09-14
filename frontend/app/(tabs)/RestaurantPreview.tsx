import React from "react";
import { View, SafeAreaView, ScrollView, Text, TouchableOpacity } from "react-native";
import ImageGallery from "@/components/image-gallery";
import CommentList from "@/components/commentList";
import CommentSummary from "@/components/commentSummary";
import RestaurantAbout from "@/components/restaurantAbout";
import ReviewSection from "@/components/reviewSection";
import RestaurantCard from "@/components/restaurantCard";
const Restaurant: React.FC = () => {
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

  const mockRestaurantData = {
    name: "Pagoda Chinese Restaurant @ Bangkok Marriott Marquis Queen's Park",
    address:
      "199 Sukhumvit Soi22, Klong Ton, Klongtoey, Bangkok 10110, Bangkok",
    tags: ["Phrom Phong", "Chinese Cuisine"],
    rating: 4.5,
    prices: 4, // just placeholders
    openingHours: [
        { day: "Monday", openTime: "09:00", closeTime: "17:00" },
        { day: "Tuesday", openTime: "09:00", closeTime: "17:00" },
        { day: "Wednesday", openTime: "09:00", closeTime: "17:00" },
        { day: "Thursday", openTime: "09:00", closeTime: "17:00" },
        { day: "Friday", openTime: "09:00", closeTime: "20:00" },
        { day: "Saturday", openTime: "10:00", closeTime: "20:00" },
        { day: "Sunday", openTime: "10:00", closeTime: "16:00" },
    ],
    buttonLabel: "Reserve",
  };


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
                    address="199 Sukhumvit Soi22, Klong Ton, Klongtoey, Bangkok 10110, Bangkok"
                    description="Pagoda Chinese Restaurant, located on the 4th floor of the Bangkok Marriott Marquis Queen’s Park, invites diners into an elegant Cantonese dining experience. The décor draws inspiration from traditional Chinese pagodas — think ornate lanterns, dragon motifs, warm lacquered woods, and beautifully crafted lattice work — creating a setting that’s both luxurious and welcoming."
                    cuisine="Buffet"
                    paymentOptions={["MasterCard", "HewKawJangWallet"]}
                    />
                </View>

                {/* Second column */}
                <View className="w-[50%] min-w-[500px] max-w-[600px] mt-[20px] p-[20px]">
                    <RestaurantCard {...mockRestaurantData} />

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

export default Restaurant;
