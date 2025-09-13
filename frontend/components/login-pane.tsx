import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import TextField from './text-field';
import SimpleAlert from './simple-alert';
import { login } from '@/apis/auth.api';
import { isAxiosError } from 'axios';

interface LoginPaneProps {
  onClose?: () => void;
  onSignUpPress?: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginPane({
  onClose,
  onSignUpPress,
  onLoginSuccess,
}: LoginPaneProps) {
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
    <View className="bg-white rounded-2xl p-6 mx-4 shadow-lg max-w-md w-full">
      {/* Close button */}
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-4 right-4 z-10"
        >
          <Text className="text-2xl text-gray-500">×</Text>
        </TouchableOpacity>
      )}

      {/* Mascot Image */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-yellow-100 rounded-full items-center justify-center">
          <Text className="text-4xl">🐱</Text>
        </View>
      </View>

      {/* Email Field */}
      <TextField
        label="Email"
        value={email}
        onValueChange={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        containerClassName="mb-4"
        required
      />

      {/* Password Field */}
      <TextField
        label="Password"
        value={password}
        onValueChange={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        error={errors.password}
        containerClassName="mb-6"
        required
      />

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
  );
}
