import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import SignUpModal from './signup-modal';
import LoginModal from './login-modal';
import UnderlinedPressableText from './underlined-pressable-text';

export default function NavBarGuest() {
  const [signUpModalVisible, setSignUpModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  return (
    <View className="flex-row items-center bg-[#FEF9F3] border-b border-[#E05910] h-16">
      {/* Logo on the left edge */}
      <TouchableOpacity onPress={() => router.push('/')}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: 64, height: 64, marginLeft: 15, marginBottom: 1 }}
        />
      </TouchableOpacity>

      {/* Spacer to push links to the right */}
      <View className="flex-1" />

      {/* Navigation links on the right */}
      <View className="flex-row items-center space-x-1 pr-6">
        <UnderlinedPressableText
          text="Login"
          onPress={() => setLoginModalVisible(true)}
          textClassName="text-black text-base"
        />

        <Text className="text-black text-base">/</Text>

        <UnderlinedPressableText
          text="Sign Up"
          onPress={() => setSignUpModalVisible(true)}
          textClassName="text-black text-base"
        />
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
        onLoginPress={() => {
          setSignUpModalVisible(false);
          setLoginModalVisible(true);
        }}
      />
    </View>
  );
}
