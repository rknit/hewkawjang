import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';

interface PaymentMethodSelectorProps {
  selectedMethods: string[];
  onMethodSelect: (methods: string[]) => void;
  className?: string;
}

export default function PaymentMethodSelector({
  selectedMethods,
  onMethodSelect,
  className = '',
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'mastercard',
      label: 'MasterCard',
      image: require('../assets/images/mastercard-logo.png'),
      description: 'Secure payment with MasterCard',
    },
    {
      id: 'visa',
      label: 'Visa',
      image: require('../assets/images/visa-logo.png'),
      description: 'Secure payment with Visa',
    },
    {
      id: 'hewkawjang',
      label: 'Hewkawjang Wallet',
      icon: '💰',
      description: 'Pay with your Hewkawjang wallet balance',
    },
    {
      id: 'promptpay',
      label: 'PromptPay',
      image: require('../assets/images/promptpay-logo.png'),
      description: 'Fast payment with PromptPay',
    },
  ];

  return (
    <View className={`${className}`}>
      <View className="bg-[#FEF9F3] rounded-2xl border border-[#FAE8D1] shadow p-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Accepted Payment Methods
        </Text>
        <Text className="text-base text-gray-600 mb-6">
          Select which payment methods your restaurant accepts
        </Text>

        <View className="space-y-3">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethods.includes(method.id);

            const handleMethodToggle = () => {
              if (isSelected) {
                onMethodSelect(
                  selectedMethods.filter((id) => id !== method.id),
                );
              } else {
                onMethodSelect([...selectedMethods, method.id]);
              }
            };

            return (
              <TouchableOpacity
                key={method.id}
                className={`flex-row items-center p-4 rounded-lg border-2  ${
                  isSelected
                    ? 'border-[#E05910] bg-[#FEF9F3]'
                    : 'border-[#FAE8D1] bg-white'
                }`}
                onPress={handleMethodToggle}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-4 ${
                    isSelected
                      ? 'border-[#E05910] bg-[#E05910]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <View className="w-full h-full rounded-full bg-[#E05910] flex items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-white" />
                    </View>
                  )}
                </View>

                <View className="flex-1 flex-row items-center pl-4">
                  {method.image ? (
                    <Image
                      source={method.image}
                      className="w-12 h-8 mr-3"
                      resizeMode="contain"
                    />
                  ) : (
                    <Text className="text-2xl mr-3">{method.icon}</Text>
                  )}
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      {method.label}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {method.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
