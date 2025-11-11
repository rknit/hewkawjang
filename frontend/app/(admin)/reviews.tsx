import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { fetchReportedReviews, handleReport } from '@/apis/admin.api';
import { normalizeError } from '@/utils/api-error';
import ProfileImage from '@/components/profile-image';

interface Review {
  id: number;
  targetReviewId: number;
  reportType: string;
  isSolved: boolean;
  createdAt: string;
  updatedAt: string;
  reviewText: string;
  reviewImageUrl?: string;
  reviewAuthor: string;
  reviewRating: number;
  reviewImages: string[];
  reviewAuthorImage: string;
  restaurantName: string | null;
}

export default function ReviewsAdminPage() {
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadReportedReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reviews = await fetchReportedReviews(false, 1, 10);
      const transformedReviews = reviews.map((review: any) => ({
        id: review.id,
        targetReviewId: review.reviewId,
        reportType: review.reportType,
        isSolved: review.isSolved,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        reviewText: review.reviewComment || 'No review text available',
        reviewAuthor: review.reviewAuthorName || 'Unknown Author',
        reviewRating: review.reviewRating,
        reviewImages: review.reviewImages || [],
        reviewAuthorImage: review.userImage || [],
        restaurantName: review.reviewRestaurant || 'Unknown Restaurant',
      }));
      setReportedReviews(transformedReviews);
      console.log('img', reviews);
    } catch (error) {
      setError('Failed to fetch reported reviews');
    } finally {
      setIsLoading(false);
    }
  };

  // Load reviews when the component mounts
  useEffect(() => {
    loadReportedReviews();
  }, []);

  const handleRejectReview = async (id: number) => {
    try {
      await handleReport(id, false); // Reject report
      alert(`Review ${id} rejected`);
      loadReportedReviews(); // Re-fetch the list of reported reviews
    } catch (error) {
      normalizeError(error);
      alert('Failed to reject the review');
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      await handleReport(id, true); // Ban (delete) the review
      alert(`Review ${id} deleted`);
      loadReportedReviews(); // Re-fetch the list after deletion
    } catch (error) {
      normalizeError(error);
      alert('Failed to delete the review');
    }
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri:
              Array.isArray(item.reviewAuthorImage) &&
              item.reviewAuthorImage.length === 0
                ? 'https://uhrpfnyjcvpwoaioviih.supabase.co/storage/v1/object/public/profile-images/default/default_profile.png' // Default image if empty array
                : item.reviewAuthorImage, // Use the URI if it's a string
          }}
          style={styles.profileImage}
        />

        <View style={styles.cardHeaderText}>
          <Text style={styles.reviewAuthor}>{item.reviewAuthor}</Text>
          {/* Star rating */}
          <Text style={styles.reviewRating}>
            {Array.from({ length: 5 }, (_, index) => (
              <FontAwesome
                key={index}
                name={index < item.reviewRating ? 'star' : 'star-o'}
                size={16}
                color="#ffcc00"
              />
            ))}
          </Text>
        </View>
      </View>

      <View style={styles.cardTopRight}>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.restaurantName}>
          {`Reviewed on ${item.restaurantName}`}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.reviewText}>{item.reviewText}</Text>
        {item.reviewImages.length > 0 && (
          <ScrollView horizontal style={styles.imageScroll}>
            {item.reviewImages.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={styles.reviewImage}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <TouchableOpacity
            onPress={() => handleDeleteReview(item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.button}>
          <TouchableOpacity
            onPress={() => handleRejectReview(item.id)}
            style={styles.rejectButton}
          >
            <Text style={[styles.buttonText, styles.rejectText]}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reported Reviews</Text>
      <FlatList
        data={reportedReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.targetReviewId.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    marginRight: 30,
    marginLeft: 30,
    paddingBottom: 70,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  profileImage: {
    width: 60, // Increased profile image size
    height: 60,
    borderRadius: 30, // Circular shape
    marginRight: 12, // Increased spacing
  },
  cardHeaderText: {
    justifyContent: 'center',
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewRating: {
    fontSize: 14,
    color: '#ffcc00',
    flexDirection: 'row',
    marginBottom: 8, // Space between rating and review text
  },
  cardTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
  },
  restaurantName: {
    fontSize: 14,
    color: '#5f5f5f',
    marginTop: 4,
  },
  cardBody: {
    marginBottom: 12,
    marginLeft: 70, // Set left margin to 20 for text, rating, and images
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
  },
  imageScroll: {
    marginTop: 10,
    flexDirection: 'row',
  },
  reviewImage: {
    width: 120,
    height: 120,
    marginRight: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  button: {
    marginBottom: 10, // Space between buttons (Delete on top)
    width: 120, // Adjust width if needed
  },
  deleteButton: {
    backgroundColor: '#E05910',
    color: 'white', // Text color inside the button
    borderRadius: 5, // Optional: rounded corners
    padding: 10, // Padding inside the button
  },

  // Styling for "Reject" Button (White with Underline)
  rejectButton: {
    backgroundColor: 'white', // White background
    color: '#E05910', // Text color (same as delete button for consistency)
    textDecorationLine: 'underline', // Underline text
    padding: 10, // Padding inside the button
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffffff',
  },

  // Specific text style for the Reject Button (Underline)
  rejectText: {
    color: '#5f5f5f',
    textDecorationLine: 'underline', // Underline text
  },
});
