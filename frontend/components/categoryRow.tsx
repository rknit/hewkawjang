import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";

const categories = [
  { id: 1, name: "Buffet", image: require("../assets/images/buffet.png") },
  { id: 2, name: "Indian", image: require("../assets/images/indian.png") },
  { id: 3, name: "Italian", image: require("../assets/images/italian.png") },
  { id: 4, name: "Japanese", image: require("../assets/images/japanese.png") },
  { id: 5, name: "Chinese", image: require("../assets/images/chinese.png") },
];

export default function CategoryRow() {
  return (
    <View className="mt-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row space-x-6 px-4"
      >
        {categories.map((cat) => (
            <TouchableOpacity
            key={cat.id}
            className="items-center"
            activeOpacity={0.7}
            style={{
              width: 140, // or use Dimensions API for dynamic sizing
              marginHorizontal: 8,
            }}
            >
            <Image
              source={cat.image}
              style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              maxWidth: "100%",
              maxHeight: "100%",
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
      </ScrollView>
    </View>
  );
}
