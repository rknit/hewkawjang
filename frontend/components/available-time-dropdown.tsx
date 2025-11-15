import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

const WEEKDAYS = [
  { short: 'S', full: 'Sunday' },
  { short: 'M', full: 'Monday' },
  { short: 'T', full: 'Tuesday' },
  { short: 'W', full: 'Wednesday' },
  { short: 'T', full: 'Thursday' },
  { short: 'F', full: 'Friday' },
  { short: 'S', full: 'Saturday' },
];

interface RestaurantHours {
  dayOfWeek:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
  openTime: string;
  closeTime: string;
}

interface AvailableTimeDropdownProps {
  value: RestaurantHours[];
  daysOff: string[]; // YYYY-MM-DD
  onChange: (val: RestaurantHours[]) => void;
  onDaysOffChange: (days: string[]) => void;
  onClose: () => void;
}

export default function AvailableTimeDropdown({
  value,
  daysOff,
  onChange,
  onDaysOffChange,
  onClose,
}: AvailableTimeDropdownProps) {
  const dayOrder: RestaurantHours['dayOfWeek'][] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  // Validate final HH:MM format
  const validateTimeFormat = (time: string) =>
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

  // Format final value to proper HH:MM
  const formatTimeInput = (text: string) => {
    const numbers = text.replace(/[^\d]/g, '').slice(0, 4);
    if (numbers.length >= 3) {
      let h = parseInt(numbers.slice(0, 2), 10);
      let m = parseInt(numbers.slice(2, 4), 10);
      h = Math.min(h, 23);
      m = Math.min(m, 59);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    return numbers;
  };

  // Format while typing (auto-colon)
  const formatTimeWhileTyping = (text: string) => {
    const numbers = text.replace(/[^\d]/g, '').slice(0, 4);
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    return numbers.slice(0, 2) + ':' + numbers.slice(2);
  };

  const getDatesBetween = (start: Date, end: Date) => {
    const dates: Date[] = [];
    const d = new Date(start);
    while (d <= end) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };

  const buildMarkedDates = (dates: string[]) => {
    const marked: { [date: string]: any } = {};
    dates.forEach((date) => {
      marked[date] = { selected: true, selectedColor: '#E05910' };
    });
    return marked;
  };

  // --- Initialize state ---
  const initialSelectedDays = value?.map((v) => dayOrder.indexOf(v.dayOfWeek)) || [];
  const initialTimeRanges: { [key: number]: { start: string; end: string } } = {};
  value?.forEach((v) => {
    const idx = dayOrder.indexOf(v.dayOfWeek);
    initialTimeRanges[idx] = { start: v.openTime, end: v.closeTime };
  });

  const [selectedDays, setSelectedDays] = useState<number[]>(initialSelectedDays);
  const [timeRanges, setTimeRanges] = useState<{ [key: number]: { start: string; end: string } }>(
    initialTimeRanges
  );
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // --- Derived workDates & markedDates ---
  const workDates = useMemo(() => {
    const allDates = getDatesBetween(today, maxDate);
    return allDates
      .map((d) => d.toISOString().split('T')[0])
      .filter((dateStr) => selectedDays.includes(new Date(dateStr).getDay()) && !daysOff.includes(dateStr));
  }, [selectedDays, daysOff]);

  const markedDates = useMemo(() => buildMarkedDates(workDates), [workDates]);

  // --- Handlers ---
  const handleDaySelect = (dayIdx: number) => {
    setSelectedDays((prev) => {
      const newSelected = prev.includes(dayIdx)
        ? prev.filter((d) => d !== dayIdx)
        : [...prev, dayIdx].sort((a, b) => a - b);

      if (!newSelected.includes(dayIdx)) {
        setTimeRanges((prevTR) => {
          const tr = { ...prevTR };
          delete tr[dayIdx];
          return tr;
        });
      }

      return newSelected;
    });
  };

  const handleDayPress = (day: DateData) => {
    const dateStr = day.dateString;
    const dayIdx = new Date(dateStr).getDay();
    if (!selectedDays.includes(dayIdx)) return;

    if (daysOff.includes(dateStr)) {
      onDaysOffChange(daysOff.filter((d) => d !== dateStr));
    } else {
      onDaysOffChange([...daysOff, dateStr]);
    }
  };

  const handleDone = () => {
    if (selectedDays.length === 0) return alert('Please select at least one day.');

    for (let idx of selectedDays) {
      const { start, end } = timeRanges[idx] || {};
      if (!start?.trim() || !end?.trim()) return alert('Fill all start/end times');
      if (!validateTimeFormat(start) || !validateTimeFormat(end)) return alert('Time must be HH:MM');
    }

    const converted: RestaurantHours[] = selectedDays.map((idx) => ({
      dayOfWeek: dayOrder[idx],
      openTime: timeRanges[idx].start,
      closeTime: timeRanges[idx].end,
    }));

    onChange(converted);
    onClose();
  };

  const isPrevDisabled = currentMonth <= today.getMonth();
  const isNextDisabled = currentMonth >= maxDate.getMonth();

  return (
    <View className="border-2 border-orange-400 rounded-lg bg-white p-6 w-full shadow-lg">
      <Text className="text-lg font-semibold mb-4">Set Weekly Patterns</Text>

      {/* Day Buttons */}
      <View className="flex-row justify-between mb-6">
        {WEEKDAYS.map((d, i) => (
          <TouchableOpacity
            key={i}
            className={`w-12 h-12 rounded border-2 items-center justify-center ${
              selectedDays.includes(i) ? 'bg-orange-600 border-orange-600' : 'bg-white border-orange-400'
            }`}
            onPress={() => handleDaySelect(i)}
          >
            <Text className={`font-bold ${selectedDays.includes(i) ? 'text-white' : 'text-orange-600'}`}>
              {d.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time Inputs */}
      {selectedDays.length > 0 && (
        <View className="mb-6">
          {selectedDays.map((dayIdx) => (
            <View key={dayIdx} className="flex-row items-center mb-3">
              <Text className="w-24 font-medium">{WEEKDAYS[dayIdx].full} :</Text>

              {/* Start Time */}
              <TextInput
                placeholder="09:00"
                value={timeRanges[dayIdx]?.start || ''}
                onChangeText={(text) => {
                  const formatted = formatTimeWhileTyping(text);
                  setTimeRanges((prev) => ({ ...prev, [dayIdx]: { ...prev[dayIdx], start: formatted } }));
                }}
                onEndEditing={() => {
                  const formatted = formatTimeInput(timeRanges[dayIdx]?.start || '');
                  setTimeRanges((prev) => ({ ...prev, [dayIdx]: { ...prev[dayIdx], start: formatted } }));
                }}
                className="border border-orange-400 rounded px-3 py-2 mx-2 flex-1 bg-[#FEF9F3] text-black"
                keyboardType="number-pad"
                maxLength={5}
                placeholderTextColor="#9ca3af"
              />

              <Text className="mx-2 font-medium">to</Text>

              {/* End Time */}
              <TextInput
                placeholder="18:00"
                value={timeRanges[dayIdx]?.end || ''}
                onChangeText={(text) => {
                  const formatted = formatTimeWhileTyping(text);
                  setTimeRanges((prev) => ({ ...prev, [dayIdx]: { ...prev[dayIdx], end: formatted } }));
                }}
                onEndEditing={() => {
                  const formatted = formatTimeInput(timeRanges[dayIdx]?.end || '');
                  setTimeRanges((prev) => ({ ...prev, [dayIdx]: { ...prev[dayIdx], end: formatted } }));
                }}
                className="border border-orange-400 rounded px-3 py-2 mx-2 flex-1 bg-[#FEF9F3] text-black"
                keyboardType="number-pad"
                maxLength={5}
                placeholderTextColor="#9ca3af"
              />
            </View>
          ))}
        </View>
      )}

      {/* Calendar */}
      <Text className="text-lg font-semibold mb-4">Calendar</Text>
      <View className="border border-orange-300 rounded-lg bg-[#FEF9F3] p-2 mb-6">
        <Calendar
          current={today.toISOString().split('T')[0]}
          markedDates={markedDates}
          minDate={today.toISOString().split('T')[0]}
          maxDate={maxDate.toISOString().split('T')[0]}
          hideExtraDays
          onMonthChange={(month: DateData) =>
            setCurrentMonth(new Date(month.year, month.month - 1).getMonth())
          }
          disableArrowLeft={isPrevDisabled}
          disableArrowRight={isNextDisabled}
          renderArrow={(direction) => (
            <Text
              style={{
                color:
                  (direction === 'left' && isPrevDisabled) || (direction === 'right' && isNextDisabled)
                    ? '#ccc'
                    : '#E05910',
                fontSize: 18,
              }}
            >
              {direction === 'left' ? '◀' : '▶'}
            </Text>
          )}
          onDayPress={handleDayPress}
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

      {/* Done Button */}
      <View className="flex-row justify-end pt-4">
        <TouchableOpacity className="bg-orange-600 rounded-lg px-8 py-3 shadow-sm" onPress={handleDone}>
          <Text className="text-white font-bold text-base">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
