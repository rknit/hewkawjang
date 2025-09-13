import React from 'react';
import { View, Text, Pressable } from 'react-native';
import TextField from '@/components/text-field';
import { UserFormData } from '@/hooks/useProfile';

interface UserInfoProps {
  userForm: UserFormData;
  isLoading: boolean;
  onFieldChange: (field: keyof UserFormData, value: string) => void;
  onSave: () => void;
}

export default function UserInfo({
  userForm,
  isLoading,
  onFieldChange,
  onSave,
}: UserInfoProps) {
  return (
    <View className="col-span-1 lg:col-span-3 gap-4">
      <View className="flex flex-col gap-4">
        <TextField
          label="Display Name"
          value={userForm.displayName}
          onValueChange={(value) => onFieldChange('displayName', value)}
          disabled={isLoading}
        />
        <View className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="First Name"
            value={userForm.firstName}
            onValueChange={(value) => onFieldChange('firstName', value)}
            disabled={isLoading}
          />
          <TextField
            label="Last Name"
            value={userForm.lastName}
            onValueChange={(value) => onFieldChange('lastName', value)}
            disabled={isLoading}
          />
          <TextField
            label="Phone Number"
            value={userForm.phoneNo}
            onValueChange={(value) => onFieldChange('phoneNo', value)}
            disabled={isLoading}
          />
          <TextField
            label="Email"
            value={userForm.email}
            onValueChange={(value) => onFieldChange('email', value)}
            disabled={isLoading}
          />
        </View>
      </View>

      <Pressable
        onPress={onSave}
        className="bg-[#AD754C] py-2 px-8 rounded-md self-start mt-4"
      >
        <Text className="text-center text-sm sm:text-base font-bold text-white">
          Save Profile
        </Text>
      </Pressable>
    </View>
  );
}
