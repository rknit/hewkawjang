import { View, Text, TouchableOpacity, Image } from 'react-native';

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string | null) => void;
  className?: string;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  className = '',
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'MasterCard',
      label: 'MasterCard',
      image: require('../assets/images/mastercard-logo.png'),
      description: 'Secure payment with MasterCard',
    },
    {
      id: 'Visa',
      label: 'Visa',
      image: require('../assets/images/visa-logo.png'),
      description: 'Secure payment with Visa',
    },
    {
      id: 'HewkawjangWallet',
      label: 'Hewkawjang Wallet',
      icon: '💰',
      description: 'Pay with your Hewkawjang wallet balance',
    },
    // {
    //   id: 'PromptPay',
    //   label: 'PromptPay',
    //   image: require('../assets/images/promptpay-logo.png'),
    //   description: 'Fast payment with PromptPay',
    // },
  ];

  return (
    <View className={className}>
      <View className="bg-[#FEF9F3] rounded-2xl border border-[#FAE8D1] shadow p-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Accepted Payment Method
        </Text>
        <Text className="text-base text-gray-600 mb-6">
          Select which payment method your restaurant accepts
        </Text>

        <View className="space-y-3">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.id;

            const handleSelect = () => {
              if (isSelected) {
                onMethodSelect(null); // deselect if clicked again
              } else {
                onMethodSelect(method.id);
              }
            };

            return (
              <TouchableOpacity
                key={method.id}
                className={`flex-row items-center p-4 rounded-lg border-2 ${
                  isSelected
                    ? 'border-[#E05910] bg-[#FEF9F3]'
                    : 'border-[#FAE8D1] bg-white'
                }`}
                onPress={handleSelect}
              >
                {/* Radio Circle */}
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

                {/* Label & Image */}
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
