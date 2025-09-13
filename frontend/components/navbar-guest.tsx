import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import SignUpModal from './signup-modal';
import LoginModal from './login-modal';

export default function NavBarGuest() {
  const [signUpModalVisible, setSignUpModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);
  const [signUpHovered, setSignUpHovered] = useState(false);

  return (
    <View className="flex-row items-center bg-[#FEF9F3] border-b border-[#E05910] h-16">
      {/* Logo on the left edge */}
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: 64, height: 64, marginLeft: 15 }}
      />

      {/* Spacer to push links to the right */}
      <View className="flex-1" />

      {/* Navigation links on the right */}
      <View className="flex-row items-center space-x-1 pr-6">
        <TouchableOpacity
          onPress={() => setLoginModalVisible(true)}
          onPressIn={() => setLoginHovered(true)}
          onPressOut={() => setLoginHovered(false)}
          {...({
            onMouseEnter: () => setLoginHovered(true),
            onMouseLeave: () => setLoginHovered(false),
          } as any)}
        >
          <Text
            className="text-black text-base decoration-2"
            style={{ textDecorationLine: loginHovered ? 'underline' : 'none' }}
          >
            Login
          </Text>
        </TouchableOpacity>

        <Text className="text-black text-base">/</Text>

        <TouchableOpacity
          onPress={() => setSignUpModalVisible(true)}
          onPressIn={() => setSignUpHovered(true)}
          onPressOut={() => setSignUpHovered(false)}
          {...({
            onMouseEnter: () => setSignUpHovered(true),
            onMouseLeave: () => setSignUpHovered(false),
          } as any)}
        >
          <Text
            className="text-black text-base decoration-2"
            style={{ textDecorationLine: signUpHovered ? 'underline' : 'none' }}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Modal */}
      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onSignUpPress={() => {
          setLoginModalVisible(false);
          setSignUpModalVisible(true);
        }}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        visible={signUpModalVisible}
        onClose={() => setSignUpModalVisible(false)}
      />
    </View>
  );
}
