import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useAdmin } from '@/context/AdminContext';

export default function AdminDropdown({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { logout } = useAuth();
  const { admin } = useAdmin();

  const fullname = `${admin?.firstName || 'Admin'} ${admin?.lastName || 'User'}`;
  const email = admin?.email || 'Loading...';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Backdrop to dismiss modal */}
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          activeOpacity={1}
          onPress={onClose}
        />
        {/* Dropdown container - positioned absolutely */}
        <View
          style={{ position: 'absolute', top: 65, right: 20 }}
          pointerEvents="box-none"
        >
          <View className="w-64 bg-white border rounded boxShadow-lg z-50">
            {/* info */}
            <View className="p-4 border-b">
              <Text className="font-semibold">{fullname}</Text>
              <Text className="text-sm text-gray-500">{email}</Text>
            </View>

            {/* logout button */}
            <View className="border-t p-2">
              <TouchableOpacity
                className="flex-row items-center gap-2 p-2 rounded w-full active:bg-gray-200 focus:bg-gray-100 hover:bg-gray-100"
                onPress={logout}
              >
                <Feather name="log-out" size={16} color="black" />
                <Text>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
