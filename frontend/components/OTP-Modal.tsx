// components/OtpModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import BaseModal from './base-modal';
import FormButton from './form-button';
import PressableText from './pressable-text';
import MailIcon from './mailIcon'; // Corrected import path
import { verify, register } from '@/apis/auth.api'; // Assume a dedicated resendOtp function

interface OtpModalProps {
  firstname: string;
  lastname: string;
  phone: string;
  password: string;
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerifySuccess: () => void; // Callback for when OTP is verified
}

const OTP_LENGTH = 6;
const RESEND_TIMEOUT_SECONDS = 3 * 60;

export default function OtpModal({
  firstname,
  lastname,
  phone,
  password,
  visible,
  email,
  onClose,
  onVerifySuccess,
}: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(RESEND_TIMEOUT_SECONDS);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRef = useRef<TextInput>(null);

  // Effect to handle the countdown timer
  useEffect(() => {
    let interval: number; // Using NodeJS.Timeout is slightly more idiomatic
    if (visible) {
      setTimer(RESEND_TIMEOUT_SECONDS);
      setIsResendDisabled(true);

      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [visible]);

  const handleOtpChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setOtp(numericText.slice(0, OTP_LENGTH));
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }
    try {
      // API call is now much simpler and more secure
      await verify(firstname, lastname, phone, password, email, otp);
      Alert.alert('Success', 'Your account has been verified!');
      onVerifySuccess();
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        'The OTP is incorrect. Please try again.',
      );
    }
  };

  const handleResend = async () => {
    if (isResendDisabled) return;
    try {
      // It's better to have a dedicated `resendOtp` endpoint
      await register(email);
      Alert.alert('Success', 'A new OTP has been sent to your email.');
      setTimer(RESEND_TIMEOUT_SECONDS);
      setIsResendDisabled(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again later.');
    }
  };
  // This is now 180 seconds
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View className="items-center p-4">
        {/* Icon with direct props */}
        <View className="mb-4">
          <MailIcon width={80} height={80} color="black" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold mb-2">OTP Verification</Text>

        {/* Info Text */}
        <Text className="text-sm text-center text-gray-600 mb-4">
          One Time Password (OTP) has been sent via Email to{' '}
          <Text className="font-bold text-black">{email}</Text>
        </Text>

        {/* OTP Input Fields */}
        <Pressable onPress={() => inputRef.current?.focus()} className="w-full">
          <View className="flex-row justify-center items-center space-x-2 mb-4">
            {Array.from({ length: OTP_LENGTH }).map((_, index) => {
              const digit = otp[index] || '';
              const isFocused = index === otp.length;

              return (
                <View
                  key={index}
                  className={`w-12 h-14 border rounded-md justify-center items-center ${
                    isFocused ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  <Text className="text-2xl font-semibold">{digit}</Text>
                </View>
              );
            })}
          </View>
          {/* Hidden text input to capture user input */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            className="absolute w-0 h-0 opacity-0"
            autoFocus={true}
          />
        </Pressable>

        {/* Resend OTP */}
        <View className="mb-6">
          {isResendDisabled ? (
            <Text className="text-sm text-gray-500">
              Resend OTP in {formattedTimer}
            </Text>
          ) : (
            <PressableText
              text="Didn't receive the code?"
              linkText="Resend OTP"
              onPress={handleResend}
            />
          )}
        </View>

        {/* Verify Button */}
        <FormButton
          title="Verify OTP"
          onPress={handleVerify}
          disabled={otp.length !== OTP_LENGTH}
        />
      </View>
    </BaseModal>
  );
}
