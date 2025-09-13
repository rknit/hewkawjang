import { login } from '@/apis/auth.api';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View, Modal } from 'react-native';
import LoginPane from '@/components/login-pane';

export default function Index() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  // FIXME: for testing purpose
  useEffect(() => {
    login('test@user.com', 'password').catch((error) => {
      console.error('Login failed:', error);
    });
  });

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // You can add navigation or other success actions here
    console.log('Login successful!');
  };

  const handleSignUpPress = () => {
    setShowLoginModal(false);
    // You can add navigation to sign up page here
    console.log('Navigate to sign up');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>

      {/* FIXME: for testing purpose */}
      <Button title="Go to Profile" onPress={() => router.push('/profile')} />

      <Button title="Sign In" onPress={() => setShowLoginModal(true)} />

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <LoginPane
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onSignUpPress={handleSignUpPress}
        />
      </Modal>
    </View>
  );
}
