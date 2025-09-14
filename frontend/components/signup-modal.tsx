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
        content={` Privacy Policy
Last Updated: September 14, 2025

 1. Introduction
This Privacy Policy outlines how we collect, use, and safeguard your personal information when you use our restaurant reservation service. By accessing or using our service, you agree to the terms described in this policy.

 2. Information We Collect
  2.1 Personal Information
  We may collect the following personal details:
  - Full name  
  - Email address  
  - Phone number  
  - User authentication details  
  - Reservation history  
  - Dining preferences and special requests  

 2.2 Usage Information
We may also collect information about how you use our service, including:
- Device information  
- IP address  
- Browser type  
- Access times and dates  
- Pages visited  

 3. How We Use Your Information
Your information may be used to:
- Process and manage restaurant reservations  
- Send confirmations and updates about reservations  
- Improve our platform and services  
- Provide relevant notifications regarding bookings  
- Respond to customer support inquiries  
- Detect and prevent fraudulent activities  

 4. Data Sharing
We may share your information with:
- Restaurants where you make reservations  
- Third-party service providers who support our operations  
- Legal authorities when required by applicable law  

 5. Data Security
We use appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.

 6. Your Rights
You have the right to:
- Access the personal data we hold about you  
- Request corrections to your data  
- Request deletion of your data  
- Withdraw your consent at any time  
- Export your personal data in a portable format  

 7. Data Retention
We retain personal information only as long as necessary to provide services, comply with legal obligations, and resolve disputes.

 8. Changes to This Policy
We may update this Privacy Policy from time to time. Material changes will be communicated via email or notifications through our platform.

 9. Contact Us
If you have questions or concerns about this Privacy Policy, please contact us at support@hewkawjang.com.

 10. Consent
By using our service, you acknowledge and agree to this Privacy Policy and consent to the collection, use, and processing of your personal data as described herein.`}
      />
    </BaseModal>
  );
}
