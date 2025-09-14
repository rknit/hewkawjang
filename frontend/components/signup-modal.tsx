import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BaseModal from './base-modal';
import FormField from './form-field';
import FormButton from './form-button';
import PressableText from './pressable-text';
import { register } from '@/apis/auth.api';
import { isAxiosError } from 'axios';
import OtpModal from './OTP-Modal';
import PolicyModal from './policy-modal';
import { PRIVACY_POLICY } from '../constants/policy-content';

interface SignUpModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginPress?: () => void;
}

export default function SignUpModal({
  visible,
  onClose,
  onLoginPress,
}: SignUpModalProps) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [otpModalVisible, setotpModalVisible] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  // Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const resetComponent = () => {
    setFirstname('');
    setLastname('');
    setPhone('');
    setEmail('');
    setPassword('');
    setChecked(false);
  };

  const handleClose = () => {
    resetComponent();
    onClose();
  };

  const handleSignUp = async () => {
    try {
      await register(email);
      // Handle successful registration (e.g., show a success message, close modal, etc.)
      setotpModalVisible(true);
    } catch (error) {
      // Handle registration error (e.g., show an error message)
      if (isAxiosError(error)) {
        let errorMessage = 'sign up failed. Please try again.';

        if (error.response?.data?.error) {
          // Backend sends error as { error: { message: "...", ... } }
          if (typeof error.response.data.error === 'string') {
            errorMessage = error.response.data.error;
          } else if (error.response.data.error.message) {
            errorMessage = error.response.data.error.message;
          }
        } else if (error.response?.status === 409) {
          errorMessage = 'email already registered. Please login instead.';
        }

        setAlertMessage(errorMessage);
        setShowAlert(true);
      } else {
        setAlertMessage('An unexpected error occurred. Please try again.');
        setShowAlert(true);
      }
    }
  };

  const allFilled =
    firstname && lastname && phone && email && password && checked;

  return (
    <BaseModal visible={visible} onClose={handleClose}>
      {/* Sign Up content */}
      <Text className="text-xl font-bold mb-6 text-center">Sign Up</Text>

      {/* Firstname */}
      <FormField
        label="Firstname"
        value={firstname}
        onChangeText={setFirstname}
        placeholder="Enter your firstname"
        required
      />

      {/* Lastname */}
      <FormField
        label="Lastname"
        value={lastname}
        onChangeText={setLastname}
        placeholder="Enter your lastname"
        required
      />

      {/* Phone Number */}
      <FormField
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        maxLength={10}
        required
      />

      {/* Email */}
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      {/* Password */}
      <View className="mb-6">
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          required
        />
      </View>

      {/* Checkbox and Privacy Policy */}
      <View className="flex-row items-center justify-center mb-4">
        <TouchableOpacity
          onPress={() => setChecked(!checked)}
          className={`w-5 h-5 border rounded mr-2 items-center justify-center ${checked ? 'bg-black border-black' : 'bg-white border-black'}`}
        >
          {checked && <Text className="text-white font-bold">✓</Text>}
        </TouchableOpacity>

        <Text className="text-xs flex-row flex-wrap text-center">
          {"I've read and accept the "}
          <Text
            className="underline text-black"
            onPress={() => setShowPolicy(true)}
          >
            Privacy Policy.
          </Text>
        </Text>
      </View>

      {/* Sign Up Button */}
      <FormButton
        title="Sign Up"
        onPress={() => {
          // TODO: Handle sign up logic
          handleSignUp();
        }}
        disabled={!allFilled}
      />

      {/* Already have an account? Login */}
      <PressableText
        text="Already have an account?"
        linkText="Login"
        onPress={onLoginPress || (() => {})}
      />

      {/* OTP */}
      <OtpModal
        firstname={firstname}
        lastname={lastname}
        phone={phone}
        email={email}
        password={password}
        visible={otpModalVisible}
        onClose={() => setotpModalVisible(false)}
        onVerifySuccess={() => {
          setotpModalVisible(false);
          handleClose();
        }}
      />

      {/* Privacy Policy Modal */}
      <PolicyModal
        visible={showPolicy}
        onClose={() => setShowPolicy(false)}
        title="Privacy Policy"
        content={PRIVACY_POLICY}
      />
    </BaseModal>
  );
}
