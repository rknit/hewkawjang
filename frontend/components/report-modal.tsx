import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Feather from '@expo/vector-icons/Feather';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportWhat: string;
  onPressReport: () => void;
}

export function ReportModal({
  visible,
  onClose,
  reportWhat,
  onPressReport,
}: ReportModalProps) {
  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={onClose}
      backdropColor="white"
      backdropOpacity={0.7}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View className="bg-white rounded-lg border border-black p-6 gap-y-6">
        {/* Title */}
        <View className="flex-row items-center gap-x-2">
          <Feather name="flag" size={32} color="red" />
          <Text className="text-lg font-bold">Report</Text>
        </View>

        {/* Content */}
        <View className="justify-center items-center">
          <Text className="text-sm text-[#2B2B2B] text-center max-w-48">
            Are you sure you want to report this {reportWhat}?
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row justify-center items-center gap-x-8">
          <TouchableOpacity
            className="bg-[#DE0E0E] px-8 py-2 rounded-lg"
            onPress={onPressReport}
          >
            <Text className="text-white text-sm font-bold">Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#AAAAAA] px-8 py-2 rounded-lg"
            onPress={onClose}
          >
            <Text className="text-white text-sm font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
