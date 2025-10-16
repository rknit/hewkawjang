// components/DeleteReviewButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { deleteReview } from '@/apis/user.api';

type Props = {
  reviewId: number;
  onDeleted?: (id: number) => void; // callback to notify parent
  style?: any; // optional style prop if you need to customize touchable
};

export default function DeleteReviewButton({ reviewId, onDeleted, style }: Props) {
  const [loading, setLoading] = useState(false);

  const confirmAndDelete = () => {
    Alert.alert(
      'Delete review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
      { cancelable: true },
    );
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const ok = await deleteReview(reviewId);
      if (ok) {
        // notify parent to remove from UI
        onDeleted?.(reviewId);
      } else {
        Alert.alert('Delete failed', 'Unable to delete review. Please try again.');
      }
    } catch (err) {
      console.log('delete review error', err);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={confirmAndDelete}
      disabled={loading}
      style={style}
      accessibilityLabel="Delete review"
      accessibilityHint="Deletes this review"
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Trash2 size={20} color="#ef4444" />
      )}
    </TouchableOpacity>
  );
}
