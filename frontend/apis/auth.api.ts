import ApiService from '@/services/api.service';
import { Tokens, TokensSchema } from '@/types/user.type';
import { normalizeError } from '@/utils/api-error';
import axios from 'axios';
import { Platform } from 'react-native';

export async function login(
  email: string,
  password: string,
): Promise<Tokens | null> {
  try {
    // use axios here since we're not logged in yet
    const BASE_URL =
      process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    const res = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email: email,
        password: password,
      },
      {
        headers: {
          'hkj-auth-client-type': Platform.OS === 'web' ? 'web' : 'mobile',
        },
        withCredentials: true,
      },
    );
    return TokensSchema.parse(res.data);
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await ApiService.post(
      '/auth/logout',
      {},
      {
        headers: {
          'hkj-auth-client-type': Platform.OS === 'web' ? 'web' : 'mobile',
        },
        withCredentials: true,
      },
    );
  } catch (error) {
    normalizeError(error);
  }
}

export async function register(email: string): Promise<void> {
  try {
    await axios.post(
      `${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/users/register`,
      {
        email: email,
      },
      {
        headers: {
          'hkj-auth-client-type': Platform.OS === 'web' ? 'web' : 'mobile',
        },
        withCredentials: true,
      },
    );
  } catch (error) {
    normalizeError(error);
  }
}

export async function verify(
  first_name: string,
  last_name: string,
  phone_no: string,
  password: string,
  email: string,
  otp: string,
): Promise<void> {
  try {
    await axios.post(
      `${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/users/verify`,
      {
        firstName: first_name,
        lastName: last_name,
        phoneNo: phone_no,
        password: password,
        email: email,
        otp: otp,
      },
      {
        headers: {
          'hkj-auth-client-type': Platform.OS === 'web' ? 'web' : 'mobile',
        },
        withCredentials: true,
      },
    );
  } catch (error) {
    normalizeError(error);
  }
}
