import { Picker } from '@react-native-picker/picker';
import { Text, View } from 'react-native';
import { THAI_PROVINCES } from '../utils/thailand-provinces';

const sortedProvinces = [...THAI_PROVINCES].sort((a, b) => a.localeCompare(b));

interface ProvincesPickerProps {
  province: string;
  setProvince: (province: string) => void;
}

export default function ProvincesPicker({
  province,
  setProvince,
}: ProvincesPickerProps) {
  return (
    <>
      <View className="w-full rounded mb-4 bg-[#FAE8D1]">
        <Picker
          selectedValue={province}
          onValueChange={setProvince}
          style={{ color: '#323232' }}
        >
          <Picker.Item label="Select province" value="" />
          {THAI_PROVINCES.map((prov) => (
            <Picker.Item key={prov} label={prov} value={prov} />
          ))}
        </Picker>
      </View>
    </>
  );
}
