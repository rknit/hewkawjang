import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import AlertBox from '@/components/alert-box';
import { User } from '@/types/user.type';
import { DeleteModalState } from '@/hooks/useProfile';

interface DeleteAccountSectionProps {
  user: User | null;
  deleteModal: DeleteModalState;
  onDeleteButtonPress: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onCheckboxChange: (checked: boolean) => void;
}

export default function DeleteAccountSection({
  user,
  deleteModal,
  onDeleteButtonPress,
  onConfirmDelete,
  onCancelDelete,
  onCheckboxChange,
}: DeleteAccountSectionProps) {
  return (
    <>
      {/* Delete Account Section */}
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
            onPress={onDeleteButtonPress}
            className="bg-[#DE0E0E] px-2 py-2 rounded-md self-start flex flex-row gap-1 justify-center items-center"
          >
            <AntDesign name="warning" size={24} color="white" />
            <Text className="text-center text-sm sm:text-base font-bold text-white">
              Delete Account
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModal.showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={onCancelDelete}
      >
        <View className="flex-1 bg-white/50 justify-center items-center">
          <AlertBox
            title="Delete Account"
            message="Are you sure you want to delete the account linked to"
            email={user?.email}
            confirmText="Delete My Account"
            cancelText="Cancel"
            showCheckbox={true}
            checkboxText="I understand that I won't be able to recover my account."
            onConfirm={onConfirmDelete}
            onCancel={onCancelDelete}
            isChecked={deleteModal.isDeleteChecked}
            onCheckboxChange={onCheckboxChange}
          />
        </View>
      </Modal>
    </>
  );
}
