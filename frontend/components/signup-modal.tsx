import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  Linking,
} from 'react-native';
import SimpleButton from './simple-button';
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
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-lg w-11/12 max-w-md p-6 relative">
          {/* Exit icon (X) */}
          <Pressable
            onPress={onClose}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>×</Text>
          </Pressable>

          {/* Sign Up content */}
          <Text className="text-xl font-bold mb-6 text-center">Sign Up</Text>
          <View className="mb-2">
            {/* Firstname */}
            <Text className={`text-xs mb-1 text-black'}`}>Firstname</Text>
            <SimpleTextField
              value={firstname}
              onChangeText={setFirstname}
              placeholder="Enter your firstname"
            />

            {/* Lastname */}
            <Text className={`text-xs mb-1 text-black'}`}>Lastname</Text>
            <SimpleTextField
              value={lastname}
              onChangeText={setLastname}
              placeholder="Enter your lastname"
            />

            {/* Phone Number */}
            <Text className={`text-xs mb-1 text-black'}`}>Phone Number</Text>
            <SimpleTextField
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              maxLength={10}
            />

            {/* Email */}
            <Text className={`text-xs mb-1 text-black'}`}>Email</Text>
            <SimpleTextField
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <Text className={`text-xs mb-1 text-black'}`}>Password</Text>
            <SimpleTextField
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>

          {/* Checkbox and Privacy Policy */}
          <View className="flex-row items-center justify-center mb-4">
            <Pressable
              onPress={() => setChecked(!checked)}
              className={`w-5 h-5 border rounded mr-2 items-center justify-center ${checked ? 'bg-black border-black' : 'bg-white border-black'}`}
            >
              {checked && <Text className="text-white font-bold">✓</Text>}
            </Pressable>

            <Text className="text-xs flex-row flex-wrap text-center">
              I've read and accept the{' '}
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
          <SimpleButton
            title="Sign Up"
            onPress={() => {
              // TODO: Handle sign up logic
            }}
            disabled={!allFilled}
            className="mb-3"
          />

          {/* Already have an account? Login */}
          <View className="flex-row justify-center items-center">
            <Text className="text-xs">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                /* TODO: Handle login navigation */
              }}
            >
              <Text className="font-bold text-xs">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
