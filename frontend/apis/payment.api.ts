import ApiService from '@/services/api.service';

export async function makeWithdraw(restaurantId: number, amount: number) {
  try {
    const res = await ApiService.post(`/payment/withdraw/${restaurantId}`, {
      amount: amount,
    });
    return res.data.success;
  } catch (error) {
    console.error('Withdrawal failed:', error);
    throw error;
  }
}

export async function createStripeCheckoutSession(
  amount: number,
): Promise<string> {
  try {
    const res = await ApiService.post('/payment/create-checkout-session', {
      amount: amount,
    });
    return res.data.url;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    throw error;
  }
}

export async function getUserBalance(): Promise<number> {
  try {
    const res = await ApiService.get('/payment/balance');
    return res.data.balance;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw error;
  }
}

export async function verifyPaymentSession(
  sessionId: string,
): Promise<boolean> {
  try {
    const res = await ApiService.post('/payment/verify-session', { sessionId });
    return res.data.success;
  } catch (error) {
    console.error('Failed to verify payment session:', error);
    throw error;
  }
}
