import { ActivityIndicator, SafeAreaView } from 'react-native';

export default function CenteredLoadingIndicator() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator
        size="large"
        color="#C54D0E"
        className="justify-center items-center"
      />
    </SafeAreaView>
  );
}
