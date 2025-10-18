import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterProps {
  onApply: (filters: { minRating?: number; maxRating?: number }) => void;
}

export default function RatingFilter({ onApply }: FilterProps) {
  const [minRating, setMinRating] = useState(1);
  const [maxRating, setMaxRating] = useState(5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter by Rating</Text>

      <View style={styles.sliderContainer}>
        <Text>Min: {minRating}</Text>
        <Slider
          style={{ width: 200 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={minRating}
          onValueChange={setMinRating}
        />
      </View>

      <View style={styles.sliderContainer}>
        <Text>Max: {maxRating}</Text>
        <Slider
          style={{ width: 200 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={maxRating}
          onValueChange={setMaxRating}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onApply({ minRating, maxRating })}
      >
        <Text style={styles.buttonText}>Apply Filter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  sliderContainer: { marginVertical: 10 },
  button: {
    backgroundColor: '#E05910',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
