import { useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';

interface MonthDropdownProps {
  month: number;
  handleMonth(month: string): void;
}

function MonthDropdown({ month, handleMonth }: MonthDropdownProps) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const textMonth = months[month - 1] || 'January';

  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(textMonth);

  function handleSelect(monthName: string) {
    setSelectedMonth(monthName);
    handleMonth(monthName);
    setIsOpen(false);
  }

  function toggleDropdown() {
    console.log('Toggling dropdown, current state:', isOpen);
    setIsOpen(!isOpen);
  }

  return (
    <View style={{ zIndex: 1000 }}>
      <TouchableOpacity
        onPress={toggleDropdown}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#D1D5DB',
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          minWidth: 150,
        }}
      >
        <Text style={{ fontSize: 14, color: '#1F2937' }}>{selectedMonth}</Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: '85%',
              maxWidth: 400,
              backgroundColor: 'white',
              borderRadius: 12,
              maxHeight: '70%',
            }}
          >
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}
              >
                Choose a Month
              </Text>
            </View>

            <ScrollView>
              {months.map((monthName, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelect(monthName)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                    backgroundColor:
                      selectedMonth === monthName ? '#EFF6FF' : 'white',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        selectedMonth === monthName ? '#2563EB' : '#374151',
                      fontWeight: selectedMonth === monthName ? '600' : '400',
                    }}
                  >
                    {monthName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              style={{
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ fontSize: 16, color: '#6B7280', fontWeight: '500' }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default MonthDropdown;
