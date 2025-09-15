import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface AvailableTimeDropdownProps {
  value: any;
  onChange: (val: any) => void;
  onClose: () => void;
}

export default function AvailableTimeDropdown({
  value,
  onChange,
  onClose,
}: AvailableTimeDropdownProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeRanges, setTimeRanges] = useState<{
    [key: number]: { start: string; end: string };
  }>({});
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});

  const sortedSelectedDays = [...selectedDays].sort((a, b) => a - b);

  // Only allow selecting dates in the calendar that match selectedDays
  const handleDayPress = (day: any) => {
    const dow = new Date(day.dateString).getDay();
    if (!selectedDays.includes(dow)) return;
    setMarkedDates({
      ...markedDates,
      [day.dateString]: {
        selected: true,
        selectedColor: '#E05910',
      },
    });
  };

  const handleDone = () => {
    const missing = sortedSelectedDays.some(
      (dayIdx) =>
        !timeRanges[dayIdx]?.start?.trim() || !timeRanges[dayIdx]?.end?.trim(),
    );
    if (missing) {
      alert('Please fill in all start and end times.');
      return;
    }
    onChange({ selectedDays, timeRanges, markedDates });
    onClose();
  };

  return (
    <View className="border-2 border-orange-400 rounded-lg bg-white p-6 w-full max-w-[600px] mx-auto my-4">
      {/* Set Weekly Patterns */}
      <Text className="text-2xl font-medium mb-4">Set Weekly Patterns</Text>
      <View className="flex-row justify-center">
        {WEEKDAYS.map((d, i) => (
          <TouchableOpacity
            key={i}
            className={`w-10 h-10 mx-3 rounded border items-center justify-center ${selectedDays.includes(i) ? 'bg-orange-600 border-orange-600' : 'bg-white border-orange-600'}`}
            onPress={() => {
              if (selectedDays.includes(i)) {
                setSelectedDays(selectedDays.filter((day) => day !== i));
              } else {
                setSelectedDays([...selectedDays, i].sort((a, b) => a - b));
              }
            }}
          >
            <Text
              className={
                selectedDays.includes(i) ? 'text-white' : 'text-orange-600'
              }
            >
              {d[0] + d[1] + d[2]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time range inputs for selected days */}
      {sortedSelectedDays.map((dayIdx) => (
        <View key={dayIdx} className="flex-row items-center mb-2">
          <Text className="w-20">{WEEKDAYS[dayIdx]} :</Text>
          <TextInput
            className="border border-orange-400 rounded px-2 py-1 mx-1 w-20 bg-[#FEF9F3] text-black"
            placeholder="start"
            value={timeRanges[dayIdx]?.start || ''}
            onChangeText={(text) =>
              setTimeRanges({
                ...timeRanges,
                [dayIdx]: { ...timeRanges[dayIdx], start: text },
              })
            }
            placeholderTextColor="#E05910"
          />
          <Text>to</Text>
          <TextInput
            className="border border-orange-400 rounded px-2 py-1 mx-1 w-20 bg-[#FEF9F3] text-black"
            placeholder="end"
            value={timeRanges[dayIdx]?.end || ''}
            onChangeText={(text) =>
              setTimeRanges({
                ...timeRanges,
                [dayIdx]: { ...timeRanges[dayIdx], end: text },
              })
            }
            placeholderTextColor="#E05910"
          />
        </View>
      ))}
      {/* Calendar Section */}
      <Text className="text-xl font-bold mb-2 mt-6">Calendar</Text>
      <View className="border border-orange-300 rounded-lg bg-[#FEF9F3] p-4 mb-4">
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          dayComponent={({ date, state }) => {
            if (!date) return null;
            const dow = new Date(date.dateString).getDay();
            const isDisabled = !selectedDays.includes(dow);
            return (
              <TouchableOpacity
                disabled={isDisabled}
                style={{
                  opacity: isDisabled ? 0.3 : 1,
                  backgroundColor: markedDates[date.dateString]?.selected
                    ? '#E05910'
                    : 'transparent',
                  borderRadius: 20,
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleDayPress({ dateString: date.dateString })}
              >
                <Text
                  style={{
                    color: markedDates[date.dateString]?.selected
                      ? '#fff'
                      : '#E05910',
                    fontWeight: 'bold',
                  }}
                >
                  {date.day}
                </Text>
              </TouchableOpacity>
            );
          }}
          theme={{
            backgroundColor: '#FEF9F3',
            calendarBackground: '#FEF9F3',
            todayTextColor: '#E05910',
            selectedDayBackgroundColor: '#E05910',
            selectedDayTextColor: '#fff',
            arrowColor: '#E05910',
            monthTextColor: '#000',
            textMonthFontWeight: 'bold',
          }}
        />
      </View>
      <View className="flex-row justify-end">
        <TouchableOpacity
          className="bg-orange-600 rounded px-6 py-2"
          onPress={handleDone}
        >
          <Text className="text-white font-bold text-base">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
