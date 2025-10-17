import { startReservationExpiryJob } from './reservation-expiry.job';

/**
 * Initializes and starts all scheduled background jobs.
 * Call this function once when the server starts.
 */
export function startScheduledJobs() {
  console.log('[Jobs] Starting scheduled jobs...');

  // Start reservation expiry job
  startReservationExpiryJob();

  console.log('[Jobs] All scheduled jobs initialized successfully');
}
