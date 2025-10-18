import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { deleteCurrentUser } from '@/apis/user.api';
import { useAuth } from '@/context/AuthContext';

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
  const { user, isLoading: authLoading, logout } = useAuth();
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
  const saveProfile = () => {
    // Validation
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
    // Add more validations as needed

    // If all validations pass
    alert('Profile saved successfully!');
    // TODO: Implement save profile API call
    alert('TODO: Save Change');
  };

  // Change profile image
  const changeProfileImage = () => {
    // TODO: Implement change profile image
    alert('TODO: Change Profile Image');
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
        router.replace('/');
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
