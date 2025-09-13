import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import SimpleTextField from './simple-text-filed';
import SimpleAlert from './simple-alert';
import { login } from '@/apis/auth.api';
import { isAxiosError } from 'axios';

interface LoginModalProps {
  visible: boolean;
  onClose?: () => void;
  onSignUpPress?: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({
  visible,
  onClose,
  onSignUpPress,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

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
      await login(email, password);
      onLoginSuccess?.();
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white/70 justify-center items-center">
        <View className="bg-white border-[#E05910] rounded-2xl p-6 mx-4 shadow-lg max-w-md w-full border">
          {/* Close button */}
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 z-10"
            >
              <Text className="text-2xl text-gray-500">{'×'}</Text>
            </TouchableOpacity>
          )}

          {/* Mascot Image */}
          <View className="items-center mb-8">
            <Image
              source={require('../assets/images/sign-in-img.png')}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
          </View>

          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email *</Text>
            <SimpleTextField
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Password Field */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Password *</Text>
            <SimpleTextField
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`bg-[#8B5A3C] rounded-lg py-3 px-4 mb-6 ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={onSignUpPress}>
              <Text className="text-[#8B5A3C] font-semibold">Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Alert Box */}
          {showAlert && (
            <View className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <SimpleAlert
                title="Login Error"
                message={alertMessage}
                buttonText="OK"
                onClose={() => setShowAlert(false)}
                type="error"
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
