import { Reservation } from '../service/reservation.service';
import createHttpError from 'http-errors';

export type ReservationNotificationMessages = {
  title: string;
  message: string;
};

export function getUserReservationNotificationMessages(
  reservation: Reservation,
  restaurantName: string,
): ReservationNotificationMessages {
  let title = '';
  let message = '';

  switch (reservation.status) {
    case 'confirmed':
      title = `Reservation Confirmed at ${restaurantName}`;
      message = `Your reservation at ${restaurantName} has been confirmed. We look forward to serving you!`;
      break;
    case 'rejected':
      title = `Reservation Rejected at ${restaurantName}`;
      message = `Unfortunately, your reservation at ${restaurantName} has been rejected. Please try booking at a different time.`;
      break;
    case 'cancelled':
      title = `Reservation Cancelled at ${restaurantName}`;
      message = `Your reservation at ${restaurantName} has been cancelled by the restaurant. We apologize for any inconvenience caused.`;
      break;
    case 'expired':
      title = `Reservation Expired at ${restaurantName}`;
      message = `Your reservation request at ${restaurantName} has expired due to no response from the restaurant. Please try booking again.`;
      break;
    case 'completed':
      title = `Reservation Completed at ${restaurantName}`;
      message = `Thank you for dining with us at ${restaurantName}! We hope you had a great experience. Please consider leaving a review.`;
      break;
    default:
      throw new createHttpError.InternalServerError(
        'Invalid reservation status for notification',
      );
  }

  return { title, message };
}

export function getRestaurantOwnerReservationNotificationMessages(
  reservation: Reservation,
  restaurantName: string,
  userName: string,
): ReservationNotificationMessages {
  let title = '';
  let message = '';

  switch (reservation.status) {
    case 'cancelled':
      title = `Reservation Cancelled by ${userName} at ${restaurantName}`;
      message = `${userName} has cancelled their reservation at ${restaurantName}.`;
      break;
    case 'expired':
      title = `Reservation Expired for ${userName} at ${restaurantName}`;
      message = `The reservation request from ${userName} at ${restaurantName} has expired.`;
      break;
    case 'completed':
      title = `Reservation Completed for ${userName} at ${restaurantName}`;
      message = `The reservation for ${userName} at ${restaurantName} has been completed.`;
      break;
    default:
      throw new createHttpError.InternalServerError(
        'Invalid reservation status for notification',
      );
  }

  return { title, message };
}
