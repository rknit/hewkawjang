import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { User } from '@/types/user.type';

interface ProfileImageProps {
  user: User | null;
  onChangeProfile: () => void;
}

export default function ProfileImage({
  user,
  onChangeProfile,
}: ProfileImageProps) {
  const name = user?.displayName ?? user?.firstName ?? 'Loading...';
  const profileImage =
    user?.profileUrl ?? require('@/assets/images/default_profile.png');

  return (
    <View className="col-span-1 flex flex-col gap-4 items-center pt-4">
      <Pressable onPress={onChangeProfile} className="relative">
        <Image
          source={profileImage}
          resizeMode="cover"
          style={{ width: 160, height: 160 }}
          className="rounded-full"
        />
        <View className="absolute -bottom-4 -right-4">
          <EvilIcons name="pencil" size={48} color="gray" />
        </View>
      </Pressable>
      <Text className="text-lg sm:text-xl lg:text-2xl text-black text-center px-4 py-2 rounded-md">
        {name}
      </Text>
    </View>
  );
}
