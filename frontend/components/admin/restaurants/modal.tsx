import { View, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import RestaurantScreenVertical from './vertRestaurant';
import { useState, useEffect } from 'react';

interface RestaurantModalProps {
  visible: boolean;
  onClose?: () => void;

  restaurantId: number;
}

export default function RestaurantModal({
  visible,
  onClose,
  restaurantId,
}: RestaurantModalProps) {
  const [isModalVisible, setIsModalVisible] = useState(visible);

  // Sync internal state with prop
  useEffect(() => {
    setIsModalVisible(visible);
  }, [visible]);

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const handleModalHide = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      isVisible={isModalVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={handleClose}
      onModalHide={handleModalHide}
      backdropColor="white"
      backdropOpacity={0.7}
      style={{
        margin: 0,
        paddingVertical: 20,
        justifyContent: 'flex-end',
      }}
    >
      <View className="w-2/3 h-full border border-[#E0E0E0] bg-white rounded-lg self-center">
        <ScrollView showsVerticalScrollIndicator={true}>
          <RestaurantScreenVertical restaurantId={restaurantId} />
        </ScrollView>
      </View>
    </Modal>
  );
}
