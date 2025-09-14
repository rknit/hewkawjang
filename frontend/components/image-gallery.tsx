import React, { useState, useRef } from "react";
import { View, Image, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { ChevronDownIcon, ChevronUpIcon } from "react-native-heroicons/outline";

type ImageGalleryProps = {
  images: string[];
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selected, setSelected] = useState<string>(images[0]);
  const flatListRef = useRef<FlatList>(null);

  const scrollOffset = 80; // width of thumbnail + margin

  const scrollNext = () => {
    flatListRef.current?.scrollToOffset({
      offset: scrollOffset,
      animated: true,
    });
  };

  const scrollPrev = () => {
    flatListRef.current?.scrollToOffset({
      offset: -scrollOffset,
      animated: true,
    });
  };

  return (
    <View className="flex-row items-start justify-center h-[300px] w-[100%]">
        {/* Main image */}
        <View className="w-[65%] h-full min-w-[250px] overflow-hidden">
            <Image
            source={{ uri: selected }}
            className="w-full h-full"
            resizeMode="cover"
            />
        </View>

        {/* Thumbnail list */}
        <View className="ml-[5%] h-full w-20 bg-gray-300 items-center overflow-hidden">
            <FlatList
            ref={flatListRef}
            data={images}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelected(item)} className="mb-2">
                <Image
                    source={{ uri: item }}
                    className={`
                    w-16 h-16
                    ${selected === item ? "border-4 border-blue-500" : ""}
                    `}
                    resizeMode="cover"
                />
                </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            />
        </View>
    </View>
  );
};

export default ImageGallery;
