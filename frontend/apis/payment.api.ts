import ApiService from '@/services/api.service';

export async function makeWithdraw(restaurantId: number, amount: number) {
  try {
    const res = await ApiService.post(`/payment/withdraw/${restaurantId}`, {
      amount: amount,
    });
    return res.data.success; // or return res; depending on your ApiService implementation
  } catch (error) {
    console.error('Withdrawal failed:', error);
    throw error; // Re-throw to let caller handle it, or return a default value
  }
}
