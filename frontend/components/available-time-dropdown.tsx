import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';

const WEEKDAYS = [
  { short: 'S', full: 'Sunday' },
  { short: 'M', full: 'Monday' },
  { short: 'T', full: 'Tuesday' },
  { short: 'W', full: 'Wednesday' },
  { short: 'T', full: 'Thursday' },
  { short: 'F', full: 'Friday' },
  { short: 'S', full: 'Saturday' },
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
  const [selectedDays, setSelectedDays] = useState<number[]>(
    value?.selectedDays || [],
  );
  const [timeRanges, setTimeRanges] = useState<{
    [key: number]: { start: string; end: string };
  }>(value?.timeRanges || {});
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>(
    value?.markedDates || {},
  );

  // Time validation function
  const validateTimeFormat = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const formatTimeInput = (text: string) => {
    // Remove all non-numeric characters
    const numbers = text.replace(/[^\d]/g, '');

    // Limit to 4 digits
    const limitedNumbers = numbers.slice(0, 4);

    // Add colon after 2 digits
    if (limitedNumbers.length >= 3) {
      const hours = limitedNumbers.slice(0, 2);
      const minutes = limitedNumbers.slice(2, 4);

      // Validate hours (00-23)
      const hoursNum = parseInt(hours, 10);
      const validHours = hoursNum <= 23 ? hours : '23';

      // Validate minutes (00-59)
      const minutesNum = parseInt(minutes, 10);
      const validMinutes = minutesNum <= 59 ? minutes : '59';

      return validHours + ':' + validMinutes;
    } else if (limitedNumbers.length >= 1) {
      return limitedNumbers;
    }
    return '';
  };

  const sortedSelectedDays = [...selectedDays].sort((a, b) => a - b);

  // Only allow selecting dates in the calendar that match selectedDays
  const handleDayPress = (day: any) => {
    const dow = new Date(day.dateString).getDay();
    if (!selectedDays.includes(dow)) return;

    const isCurrentlySelected = markedDates[day.dateString]?.selected;
    const newMarkedDates = { ...markedDates };

    if (isCurrentlySelected) {
      // Remove the date if it's currently selected
      delete newMarkedDates[day.dateString];
    } else {
      // Add the date if it's not currently selected
      newMarkedDates[day.dateString] = {
        selected: true,
        selectedColor: '#E05910',
      };
    }

    setMarkedDates(newMarkedDates);
  };

  const handleDone = () => {
    // Check if at least one day is selected
    if (selectedDays.length === 0) {
      alert('Please select at least one day.');
      return;
    }

    // Check if all selected days have time ranges and validate format
    const missing = sortedSelectedDays.some(
      (dayIdx) =>
        !timeRanges[dayIdx]?.start?.trim() || !timeRanges[dayIdx]?.end?.trim(),
    );
    if (missing) {
      alert('Please fill in all start and end times for selected days.');
      return;
    }

    // Validate time format
    const invalidTimes = sortedSelectedDays.some((dayIdx) => {
      const start = timeRanges[dayIdx]?.start?.trim();
      const end = timeRanges[dayIdx]?.end?.trim();
      return !validateTimeFormat(start) || !validateTimeFormat(end);
    });

    if (invalidTimes) {
      alert('Please enter time in HH:MM format (e.g., 09:00, 18:30)');
      return;
    }

    // Check if at least one date is selected in the calendar
    const selectedCalendarDates = Object.keys(markedDates).filter(
      (date) => markedDates[date]?.selected,
    );

    if (selectedCalendarDates.length === 0) {
      alert(
        'Please select at least one date in the calendar to open the restaurant.',
      );
      return;
    }

    onChange({ selectedDays, timeRanges, markedDates });
    onClose();
  };

  return (
    <View className="border-2 border-orange-400 rounded-lg bg-white p-6 w-full shadow-lg">
      {/* Set Weekly Patterns */}
      <Text className="text-lg font-semibold mb-4">Set Weekly Patterns</Text>
      <View className="flex-row justify-between mb-6">
        {WEEKDAYS.map((d, i) => (
          <TouchableOpacity
            key={i}
            className={`w-12 h-12 rounded border-2 items-center justify-center ${
              selectedDays.includes(i)
                ? 'bg-orange-600 border-orange-600'
                : 'bg-white border-orange-400'
            }`}
            onPress={() => {
              if (selectedDays.includes(i)) {
                setSelectedDays(selectedDays.filter((day) => day !== i));
                // Remove time range for this day
                const newTimeRanges = { ...timeRanges };
                delete newTimeRanges[i];
                setTimeRanges(newTimeRanges);
              } else {
                setSelectedDays([...selectedDays, i].sort((a, b) => a - b));
                // Initialize time range for this day
                setTimeRanges({
                  ...timeRanges,
                  [i]: { start: '', end: '' },
                });
              }
            }}
          >
            <Text
              className={`font-bold ${
                selectedDays.includes(i) ? 'text-white' : 'text-orange-600'
              }`}
            >
              {d.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time range inputs for selected days */}
      {sortedSelectedDays.length > 0 && (
        <View className="mb-6">
          {sortedSelectedDays.map((dayIdx) => (
            <View key={dayIdx} className="flex-row items-center mb-3">
              <Text className="w-24 font-medium">
                {WEEKDAYS[dayIdx].full} :
              </Text>
              <TextInput
                className="border border-orange-400 rounded px-3 py-2 mx-2 flex-1 bg-[#FEF9F3] text-black"
                placeholder="09:00"
                value={timeRanges[dayIdx]?.start || ''}
                onChangeText={(text) => {
                  const formattedTime = formatTimeInput(text);
                  setTimeRanges({
                    ...timeRanges,
                    [dayIdx]: { ...timeRanges[dayIdx], start: formattedTime },
                  });
                }}
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={5}
              />
              <Text className="mx-2 font-medium">to</Text>
              <TextInput
                className="border border-orange-400 rounded px-3 py-2 mx-2 flex-1 bg-[#FEF9F3] text-black"
                placeholder="18:00"
                value={timeRanges[dayIdx]?.end || ''}
                onChangeText={(text) => {
                  const formattedTime = formatTimeInput(text);
                  setTimeRanges({
                    ...timeRanges,
                    [dayIdx]: { ...timeRanges[dayIdx], end: formattedTime },
                  });
                }}
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          ))}
        </View>
      )}
      {/* Calendar Section */}
      <Text className="text-lg font-semibold mb-4">Calendar</Text>
      <View className="border border-orange-300 rounded-lg bg-[#FEF9F3] p-2 mb-6">
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          dayComponent={({ date, state }) => {
            if (!date) return null;
            const dow = new Date(date.dateString).getDay();
            const isDisabled = !selectedDays.includes(dow);
            const isSelected = markedDates[date.dateString]?.selected;

            return (
              <TouchableOpacity
                disabled={isDisabled}
                style={{
                  opacity: isDisabled ? 0.3 : 1,
                  backgroundColor: isSelected ? '#E05910' : 'transparent',
                  borderRadius: 16,
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 2,
                }}
                onPress={() => handleDayPress({ dateString: date.dateString })}
              >
                <Text
                  style={{
                    color: isSelected ? '#fff' : '#E05910',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    fontSize: 14,
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
            monthTextColor: '#E05910',
            textMonthFontWeight: 'bold',
            textMonthFontSize: 18,
            dayTextColor: '#E05910',
            textDayFontWeight: '500',
          }}
        />
      </View>
      <View className="flex-row justify-end pt-4">
        <TouchableOpacity
          className="bg-orange-600 rounded-lg px-8 py-3 shadow-sm"
          onPress={handleDone}
        >
          <Text className="text-white font-bold text-base">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
