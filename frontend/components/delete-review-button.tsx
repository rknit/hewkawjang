// components/DeleteReviewButton.tsx
import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { deleteReview } from '@/apis/user.api';

type Props = {
  reviewId: number;
  onDeleted?: (id: number) => void; // callback to notify parent
};

export default function DeleteReviewButton({ reviewId, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const confirm = () => {
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined' && window.confirm('Delete this review?');
      if (ok) void handleDelete();
      return;
    }
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const ok = await deleteReview(reviewId);
      if (ok) onDeleted?.(reviewId);
      else Alert.alert('Failed', 'Could not delete review.');
    } catch {
      Alert.alert('Error', 'Unexpected error deleting review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={confirm}
      disabled={loading}
      accessibilityLabel="Delete review"
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Feather name="trash-2" size={16} color="#EF4444" />
      )}
    </TouchableOpacity>
  );
}
