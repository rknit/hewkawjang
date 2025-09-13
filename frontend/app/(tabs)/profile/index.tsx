import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import ProfileImage from '@/components/profile-image';
import UserInfo from '@/components/user-info';
import DeleteAccountSection from '@/components/delete-account-section';

export default function ProfileScreen() {
  const {
    user,
    isLoading,
    userForm,
    deleteModal,
    updateFormField,
    saveProfile,
    changeProfileImage,
    handleDeleteButtonPress,
    confirmDeleteAccount,
    cancelDeleteAccount,
    setIsDeleteChecked,
  } = useProfile();

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
          <ProfileImage user={user} onChangeProfile={changeProfileImage} />
          <UserInfo
            userForm={userForm}
            isLoading={isLoading}
            onFieldChange={updateFormField}
            onSave={saveProfile}
          />
        </View>
      </View>

      {/* Delete Account Section */}
      <DeleteAccountSection
        user={user}
        deleteModal={deleteModal}
        onDeleteButtonPress={handleDeleteButtonPress}
        onConfirmDelete={confirmDeleteAccount}
        onCancelDelete={cancelDeleteAccount}
        onCheckboxChange={setIsDeleteChecked}
      />
    </ScrollView>
  );
}
