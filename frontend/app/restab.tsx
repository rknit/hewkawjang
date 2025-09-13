// RestaurantTabScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ReservationPane from "./ReservationForm"; // adjust path

export default function RestaurantTabScreen() {
  const [open, setOpen] = useState(false);

  return (
    <View className="flex-1 p-4">
      {/* ... your tab UI ... */}
      <TouchableOpacity
        className="mt-4 rounded-xl items-center py-3"
        style={{ backgroundColor: "#ff6a00" }}
        onPress={() => setOpen(true)}
      >
        <Text className="font-bold text-white">Make a reservation</Text>
      </TouchableOpacity>

      <ReservationPane visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}
