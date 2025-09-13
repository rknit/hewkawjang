import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Linking } from 'react-native';
import SimpleTextField from './simple-text-filed';

interface SignUpModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SignUpModal({ visible, onClose }: SignUpModalProps) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);

  const allFilled =
    firstname && lastname && phone && email && password && checked;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white/70 justify-center items-center">
        <View className="bg-white border-[#E05910] rounded-2xl p-6 mx-4 shadow-lg max-w-md w-full border relative">
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10"
          >
            <Text className="text-2xl text-gray-500">{'×'}</Text>
          </TouchableOpacity>

          {/* Sign Up content */}
          <Text className="text-xl font-bold mb-6 text-center">Sign Up</Text>

          {/* Firstname */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Firstname *</Text>
            <SimpleTextField
              value={firstname}
              onChangeText={setFirstname}
              placeholder="Enter your firstname"
            />
          </View>

          {/* Lastname */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Lastname *</Text>
            <SimpleTextField
              value={lastname}
              onChangeText={setLastname}
              placeholder="Enter your lastname"
            />
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Phone Number *
            </Text>
            <SimpleTextField
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email *</Text>
            <SimpleTextField
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Password *</Text>
            <SimpleTextField
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
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
              {"I've read and accept the"}
              <Text
                className="underline text-black"
                onPress={() =>
                  Linking.openURL('https://www.youtube.com/watch?v=PbWFpzi8C94')
                }
              >
                Privacy Policy.
              </Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={() => {
              // TODO: Handle sign up logic
            }}
            disabled={!allFilled}
            className={`bg-[#8B5A3C] rounded-lg py-3 px-4 mb-6 ${
              !allFilled ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>

          {/* Already have an account? Login */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                /* TODO: Handle login navigation */
              }}
            >
              <Text className="text-[#8B5A3C] font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
