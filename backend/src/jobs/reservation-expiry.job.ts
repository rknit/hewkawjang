import cron from 'node-cron';
import ReservationService from '../service/reservation.service';

// Configuration - Change these values as needed
const RESERVATION_EXPIRY_MINUTES = 1; // Minutes before unconfirmed reservations expire (set to 1 for testing)
const EXPIRY_CHECK_INTERVAL = '* * * * *'; // Cron schedule: every minute

/**
 * Scheduled job that automatically expires unconfirmed reservations
 * after they have been pending for RESERVATION_EXPIRY_MINUTES.
 */
export function startReservationExpiryJob() {
  console.log(
    `[Job] Reservation expiry job started. Checking every minute for reservations older than ${RESERVATION_EXPIRY_MINUTES} minutes.`,
  );

  cron.schedule(EXPIRY_CHECK_INTERVAL, async () => {
    try {
      const expiredCount =
        await ReservationService.expireUnconfirmedReservations(
          RESERVATION_EXPIRY_MINUTES,
        );

      if (expiredCount > 0) {
        console.log(
          `[${new Date().toISOString()}] Expired ${expiredCount} unconfirmed reservation(s)`,
        );
      }
    } catch (error) {
      console.error(
        '[Job] Error expiring reservations:',
        error instanceof Error ? error.message : error,
      );
    }
  });
}
