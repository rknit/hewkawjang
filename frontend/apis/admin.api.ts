import ApiService from '@/services/api.service';
import { Admin, AdminSchema } from '@/types/admin.type';
import { Report, ReportSchema } from '@/types/report.type';
import { Restaurant, RestaurantSchema } from '@/types/restaurant.type';
import { normalizeError } from '@/utils/api-error';

export async function fetchCurrentAdmin(): Promise<Admin | null> {
  try {
    const res = await ApiService.get('/admins/me');
    return AdminSchema.parse(res.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function fetchPendingReports(): Promise<Report[]> {
  try {
    const res = await ApiService.get('/admins/reports/pending');
    return res.data.map((report: any) => ReportSchema.parse(report));
  } catch (error) {
    normalizeError(error);
    return [];
  }
}

export async function fetchPendingRestaurants(): Promise<Restaurant[]> {
  try {
    const res = await ApiService.get(
      '/admins/restaurants/pending-verification',
    );
    return res.data.map((restaurant: any) =>
      RestaurantSchema.parse(restaurant),
    );
  } catch (error) {
    normalizeError(error);
    return [];
  }
}

export async function banRestaurant(restaurantId: number): Promise<void> {
  try {
    await ApiService.delete(`/admins/restaurants/${restaurantId}`);
  } catch (error) {
    normalizeError(error);
  }
}

export async function fetchReportedReviews(
  isSolved: boolean = false,
  page: number = 1,
  limit: number = 10,
): Promise<Report[]> {
  try {
    const queryParams = new URLSearchParams({
      isSolved: isSolved.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });

    const res = await ApiService.get(
      `/admins/reports/review?${queryParams.toString()}`,
    );

    // Ensure we're accessing the 'data' property from the Axios response
    const responseData = res.data; // Axios wraps the actual response in 'data'

    // Check if the response data has the expected structure
    if (responseData && Array.isArray(responseData)) {
      // Map the response to your Report schema
      const reportedReviews: Report[] = responseData.map((review: any) => ({
        id: review.id,
        userId: review.userId,
        adminId: review.adminId,
        reportType: review.reportType,
        targetRestaurantId: review.targetRestaurantId,
        targetReviewId: review.targetReviewId,
        targetUserId: review.targetUserId,
        targetMessageId: review.targetMessageId,
        isSolved: review.isSolved,
        createdAt: review.createdAt,

        // Review fields
        reviewId: review.reviewId,
        reviewRating: review.reviewRating,
        reviewComment: review.reviewComment,
        reviewCreatedAt: review.reviewCreatedAt,
        reviewAuthorId: review.reviewAuthorId,
        reviewAuthorName: review.reviewAuthorName,
        reviewImages: review.reviewImages || [], // Default to an empty array if no images
        userImage: review.userImage || [],
        reviewRestaurant: review.reviewRestaurant,
      }));

      return reportedReviews;
    } else {
      console.error('Invalid response format:', responseData);
      return []; // Return empty array if the response is not in the expected format
    }
  } catch (error) {
    normalizeError(error); // Assuming normalizeError handles and logs errors
    return []; // Return empty array if error occurs
  }
}

export async function handleReport(
  reportId: number,
  action: boolean,
): Promise<void> {
  try {
    // Send the action (true for ban, false for reject) along with the report ID
    await ApiService.post(`/admins/reports/review/${reportId}/handle`, {
      action,
    });
  } catch (error) {
    normalizeError(error);
  }
}

export async function fetchReportedMessages(
  isSolved: boolean = false,
  page: number = 1,
  limit: number = 10,
): Promise<any[]> {
  try {
    const queryParams = new URLSearchParams({
      isSolved: isSolved.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });

    const res = await ApiService.get(
      `/admins/reports/message?${queryParams.toString()}`,
    );
    return res.data;
  } catch (error) {
    normalizeError(error);
    return [];
  }
}

export async function handleMessageReport(
  reportId: number,
  action: boolean,
): Promise<void> {
  try {
    await ApiService.post(`/admins/reports/message/${reportId}/handle`, {
      action,
    });
  } catch (error) {
    normalizeError(error);
  }
}

export async function reportMessage(messageId: number): Promise<void> {
  try {
    await ApiService.post(`/reports/message/${messageId}`);
  } catch (error) {
    normalizeError(error);
  }
}
