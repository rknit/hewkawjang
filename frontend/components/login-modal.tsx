import React, { useState } from 'react';
import { View, Image } from 'react-native';
import BaseModal from './base-modal';
import FormField from './form-field';
import FormButton from './form-button';
import PressableText from './pressable-text';
import SimpleAlert from './simple-alert';
import { useAuth } from '@/context/AuthContext';
import { isAxiosError } from 'axios';
import SignUpModal from './signup-modal';

interface LoginModalProps {
  visible: boolean;
  onClose?: () => void;
}

export default function LoginModal({ visible, onClose }: LoginModalProps) {
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const resetComponent = () => {
    setEmail('');
    setPassword('');
    setIsLoading(false);
    setErrors({});
    setShowAlert(false);
    setAlertMessage('');
  };

  const handleClose = () => {
    resetComponent();
    onClose?.();
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authLogin(email, password);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (isAxiosError(error)) {
        let errorMessage = 'Login failed. Please try again.';

        if (error.response?.data?.error) {
          // Backend sends error as { error: { message: "...", ... } }
          if (typeof error.response.data.error === 'string') {
            errorMessage = error.response.data.error;
          } else if (error.response.data.error.message) {
            errorMessage = error.response.data.error.message;
          }
        } else if (error.response?.status === 401) {
          errorMessage = 'Invalid email or password';
        }

        setAlertMessage(errorMessage);
        setShowAlert(true);
      } else {
        setAlertMessage('An unexpected error occurred. Please try again.');
        setShowAlert(true);
      }
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={handleClose}
      showCloseButton={!!onClose}
    >
      {/* Mascot Image */}
      <View className="items-center mb-8">
        <Image
          source={require('../assets/images/sign-in-img.png')}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </View>

      {/* Email Field */}
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        required
      />

      {/* Password Field */}
      <View className="mb-6">
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
          required
        />
      </View>

      {/* Login Button */}
      <FormButton
        title="Log in"
        onPress={handleLogin}
        disabled={isLoading}
        isLoading={isLoading}
        loadingText="Logging in..."
      />

      {/* Sign up link */}
      <PressableText
        text="Don't have an account?"
        linkText="Sign up"
        onPress={() => {
          onClose?.();
          setShowSignUpModal(true);
        }}
      />

      <SignUpModal
        visible={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
      />

      {/* Alert Box */}
      {showAlert && (
        <View className="absolute inset-0 flex items-center justify-center">
          <SimpleAlert
            title="Login Error"
            message={alertMessage}
            buttonText="OK"
            onClose={() => setShowAlert(false)}
            type="error"
          />
        </View>
      )}
    </BaseModal>
  );
}
