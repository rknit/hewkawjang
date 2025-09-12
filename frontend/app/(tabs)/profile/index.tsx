import { fetchCurrentUser, tmpLogin } from '@/apis/user.api';
import { User } from '@/types/user.type';
import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';

export default function ProfileScreen() {
  useEffect(() => {
    tmpLogin();
  }, []);

  let [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let fetchProfile = async () => {
      let user = await fetchCurrentUser();
      setUser(user);
    };
    fetchProfile();
  }, []);

  const deleteAccount = () => {
    alert('TODO: Delete Account');
  };

  return (
    <ScrollView
      className="w-full"
      contentContainerStyle={{ minHeight: '100%' }}
    >
      {/* Header */}
      <View className="w-full justify-center items-center pt-8 pb-4 px-4 sm:px-8 md:px-16 lg:px-24">
        <Text className="text-center text-xl sm:text-2xl md:text-3xl font-bold">
          My Profile
        </Text>
      </View>
      <View className="border-b-2 border-gray-200 w-[90%] self-center" />

      {/* Profile Info */}
      <View className="pt-8 pb-8">
        <View className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12 w-full px-4 sm:px-8 md:px-16 lg:px-24">
          <ProfileImage user={user} />
          <UserInfo user={user} />
        </View>
      </View>

      {/* Delete Account (Footer) */}
      <View className="border-b-2 border-gray-200 w-[90%] self-center" />
      <View className="pt-4" />
      <View className="w-full pt-8 pb-8 px-4 sm:px-8 md:px-16 lg:px-24">
        <Text className="text-lg sm:text-xl font-bold mb-2">
          Delete Account
        </Text>
        <Text className="text-sm sm:text-base text-gray-600 mb-4">
          if you no longer wish to use HewKawJang, you can permanently delete
          your account.
        </Text>
        <Pressable
          onPress={deleteAccount}
          className="bg-red-500 p-4 rounded-md self-start"
        >
          <Text className="text-center text-sm sm:text-base font-bold text-white">
            Delete Account
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ProfileImage(props: { user: User | null }) {
  const changeProfile = () => {
    alert('TODO: Change Profile Image');
  };

  let name = props.user?.displayName ?? props.user?.firstName ?? 'Loading...';

  return (
    <View className="col-span-1 flex flex-col gap-4 items-center pt-4">
      <Pressable onPress={changeProfile} className="relative">
        <FontAwesome5 name="user-circle" color="black" size={120} />
        <View className="absolute bottom-1 right-1">
          <Entypo name="pencil" size={24} color="black" />
        </View>
      </Pressable>
      <Text className="text-lg sm:text-xl lg:text-2xl text-black bg-gray-100 text-center px-4 py-2 rounded-md">
        {name}
      </Text>
    </View>
  );
}

function UserInfo(props: { user: User | null }) {
  const saveChange = () => {
    alert('TODO: Save Change');
  };

  let name = props.user?.displayName ?? props.user?.firstName ?? 'Loading...';
  let firstName = props.user?.firstName ?? 'Loading...';
  let lastName = props.user?.lastName ?? 'Loading...';
  let phoneNo = props.user?.phoneNo ?? 'Loading...';
  let email = props.user?.email ?? 'Loading...';

  return (
    <View className="col-span-1 lg:col-span-3 gap-4">
      <View className="flex flex-col gap-4">
        <EditableField label="Display Name" value={name} />
        <View className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableField label="First Name" value={firstName} />
          <EditableField label="Last Name" value={lastName} />
          <EditableField label="Phone Number" value={phoneNo} />
          <EditableField label="Email" value={email} />
        </View>
      </View>

      <Pressable
        onPress={saveChange}
        className="bg-gray-200 p-4 rounded-md self-start mt-4"
      >
        <Text className="text-center text-sm sm:text-base font-bold px-4">
          Save Profile
        </Text>
      </Pressable>
    </View>
  );
}

function EditableField(props: { label: string; value: string }) {
  return (
    <View className="flex flex-col gap-2">
      <Text className="text-sm sm:text-base font-medium text-gray-700">
        {props.label}
      </Text>
      <Text className="text-sm sm:text-base text-black bg-gray-100 w-full p-3 rounded-md border border-gray-200">
        {props.value}
      </Text>
    </View>
  );
}
