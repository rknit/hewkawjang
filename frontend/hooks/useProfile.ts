import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import {
  uploadProfileImage,
  updateUserProfile,
  deleteCurrentUser,
} from '@/apis/user.api';
import { useUser } from './useUser';

export interface UserFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNo: string;
  email: string;
}

export interface DeleteModalState {
  showDeleteModal: boolean;
  isDeleteChecked: boolean;
}

export const useProfile = () => {
  const { isLoading: authLoading, logout, refreshAuth } = useAuth();
  const { user } = useUser();
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    showDeleteModal: false,
    isDeleteChecked: false,
  });

  // Initialize user form data from user object
  const [userForm, setUserForm] = useState<UserFormData>({
    displayName: '',
    firstName: '',
    lastName: '',
    phoneNo: '',
    email: '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setUserForm({
        displayName: user.displayName ?? user.firstName ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phoneNo: user.phoneNo ?? '',
        email: user.email ?? '',
      });
    }
  }, [user]);

  // Update form field
  const updateFormField = (field: keyof UserFormData, value: string) => {
    setUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save profile changes
  const saveProfile = async () => {
    if (
      !userForm.phoneNo ||
      userForm.phoneNo.length !== 10 ||
      !/^\d+$/.test(userForm.phoneNo)
    ) {
      alert('Error: Phone number must be exactly 10 digits.');
      return;
    }
    if (!userForm.email || !userForm.email.includes('@')) {
      alert('Error: Please enter a valid email address.');
      return;
    }

    try {
      await updateUserProfile(userForm);
      await refreshAuth();
      alert('Profile updated successfully.');
    } catch (error) {
      console.error(error);
    }
  };

  // Change profile image
  const changeProfileImage = async () => {
    console.log('changing frontend profile');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      const uri = image.uri; // 'blob' URL
      const fileType = 'image/jpeg'; // or image/png depending on the image format
      const fileName = 'profile.jpg'; // You can change this as needed

      // Fetch the file content from the Blob URL
      const response = await fetch(uri);
      const fileBlob = await response.blob();

      // Create a File object from the blob
      const file = new File([fileBlob], fileName, { type: fileType });

      console.log(file); // Check if it's a File object now

      try {
        const imageUrl = await uploadProfileImage(file);
        console.log('Uploaded image URL:', imageUrl);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Delete account handlers
  const handleDeleteButtonPress = () => {
    setDeleteModal({
      showDeleteModal: true,
      isDeleteChecked: false,
    });
  };

  const confirmDeleteAccount = async () => {
    if (!deleteModal.isDeleteChecked) return;

    try {
      setDeleteModal((prev) => ({ ...prev, showDeleteModal: false }));
      const success = await deleteCurrentUser();
      if (success) {
        await logout();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const cancelDeleteAccount = () => {
    setDeleteModal({
      showDeleteModal: false,
      isDeleteChecked: false,
    });
  };

  const setIsDeleteChecked = (checked: boolean) => {
    setDeleteModal((prev) => ({
      ...prev,
      isDeleteChecked: checked,
    }));
  };

  return {
    user,
    isLoading: authLoading,
    userForm,
    deleteModal,
    updateFormField,
    saveProfile,
    changeProfileImage,
    handleDeleteButtonPress,
    confirmDeleteAccount,
    cancelDeleteAccount,
    setIsDeleteChecked,
  };
};
