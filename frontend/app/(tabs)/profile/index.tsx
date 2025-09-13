import { User, UserSchema } from '@/types/user.type';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Platform,
  TextInput,
} from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import ApiService from '@/services/api.service';
import TokenStorage from '@/services/token-storage.service';

export default function ProfileScreen() {
  useEffect(() => {
    let doLogin = async () => {
      const platform = Platform.OS === 'web' ? 'web' : 'mobile';

      const res = await ApiService.post(
        '/auth/login',
        {
          email: 'j.doe@gmail.com',
          password: 'janerat',
        },
        {
          headers: { 'hkj-auth-client-type': platform },
          withCredentials: true,
        },
      );

      let { accessToken, refreshToken } = res.data;
      TokenStorage.setAccessToken(accessToken);
      if (refreshToken) TokenStorage.setRefreshToken(refreshToken);
    };
    doLogin();
  }, []);

  let [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let fetchProfile = async () => {
      const res = await ApiService.get('/users/me');
      let user = UserSchema.parse(res.data);
      setUser(user);
    };
    fetchProfile();
  }, []);

  const deleteAccount = () => {
    alert('TODO: Delete Account');
  };

  return (
    <ScrollView
      className="w-full bg-white"
      contentContainerStyle={{
        paddingBottom: 20,
      }}
    >
      {/* Header */}
      <View className="w-full pt-8 pb-4 px-4 sm:px-8 md:px-16 lg:px-24">
        <View className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12 w-full">
          <View className="col-span-1 flex items-center justify-center lg:justify-start">
            <Text className="text-xl sm:text-2xl md:text-3xl font-bold">
              My Profile
            </Text>
          </View>
          <View className="col-span-1 lg:col-span-3" />
        </View>
      </View>
      <View className="border-b-2 border-gray-300 w-11/12 self-center" />

      {/* Profile Info - Flexible content area */}
      <View className="pt-8 pb-8">
        <View className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12 w-full px-4 sm:px-8 md:px-16 lg:px-24">
          <ProfileImage user={user} />
          <UserInfo user={user} />
        </View>
      </View>

      {/* Delete Account (Footer) - Sticks to bottom when space available */}
      <View>
        <View className="border-b-2 border-gray-300 w-11/12 self-center" />
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
            className="bg-[#DE0E0E] px-2 py-2 rounded-md self-start flex flex-row gap-1 justify-center items-center"
          >
            <AntDesign name="warning" size={24} color="white" />
            <Text className="text-center text-sm sm:text-base font-bold text-white">
              Delete Account
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileImage(props: { user: User | null }) {
  const changeProfile = () => {
    alert('TODO: Change Profile Image');
  };

  const name = props.user?.displayName ?? props.user?.firstName ?? 'Loading...';

  const profileImage =
    props.user?.profileUrl ?? require('./default_profile.png');

  return (
    <View className="col-span-1 flex flex-col gap-4 items-center pt-4">
      <Pressable onPress={changeProfile} className="relative">
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

function UserInfo(props: { user: User | null }) {
  const saveChange = () => {
    alert('TODO: Save Change');
  };

  const [name, setName] = useState('Loading...');
  const [firstName, setFirstName] = useState('Loading...');
  const [lastName, setLastName] = useState('Loading...');
  const [phoneNo, setPhoneNo] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (props.user) {
      setName(props.user?.displayName ?? props.user?.firstName ?? 'Loading...');
      setFirstName(props.user?.firstName ?? 'Loading...');
      setLastName(props.user?.lastName ?? 'Loading...');
      setPhoneNo(props.user?.phoneNo ?? 'Loading...');
      setEmail(props.user?.email ?? 'Loading...');
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [props.user]);

  return (
    <View className="col-span-1 lg:col-span-3 gap-4">
      <View className="flex flex-col gap-4">
        <EditableField
          label="Display Name"
          value={name}
          setValue={setName}
          disabled={isLoading}
        />
        <View className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableField
            label="First Name"
            value={firstName}
            setValue={setFirstName}
            disabled={isLoading}
          />
          <EditableField
            label="Last Name"
            value={lastName}
            setValue={setLastName}
            disabled={isLoading}
          />
          <EditableField
            label="Phone Number"
            value={phoneNo}
            setValue={setPhoneNo}
            disabled={isLoading}
          />
          <EditableField
            label="Email"
            value={email}
            setValue={setEmail}
            disabled={isLoading}
          />
        </View>
      </View>

      <Pressable
        onPress={saveChange}
        className="bg-[#AD754C] py-2 px-8 rounded-md self-start mt-4"
      >
        <Text className="text-center text-sm sm:text-base font-bold text-white">
          Save Profile
        </Text>
      </Pressable>
    </View>
  );
}

function EditableField(props: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  disabled?: boolean;
}) {
  const isDisabled = props.disabled ?? false;

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-sm sm:text-base font-medium text-gray-700">
        {props.label}
      </Text>
      <TextInput
        value={props.value}
        onChangeText={(t) => props.setValue(t)}
        editable={!isDisabled}
        className={`text-sm sm:text-base w-full px-3 py-1 rounded-md border ${
          isDisabled
            ? 'text-gray-500 bg-gray-50 border-gray-200 cursor-not-allowed'
            : 'text-black bg-gray-100 border-gray-200'
        }`}
      />
    </View>
  );
}
