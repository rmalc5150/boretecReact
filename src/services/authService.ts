// src/services/authService.ts
import axios, { AxiosError } from 'axios';
import { Token } from '../types/Token';

const isDevelopment = process.env.NODE_ENV === 'development';
const redirectUri = isDevelopment
  ? `${process.env.NEXT_PUBLIC_DEV_URL}/api/callback`
  : `${process.env.NEXT_PUBLIC_PROD_URL}/api/callback`;

const clientId = process.env.NEXT_PUBLIC_INTUIT_CLIENT_ID as string;
const clientSecret = process.env.INTUIT_CLIENT_SECRET as string;
const environment = 'sandbox'; // or 'production'
const tokenUrl = environment === 'sandbox'
  ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
  : 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const authUrl = 'https://appcenter.intuit.com/connect/oauth2';

export const getAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    state: 'testState'
  });
  return `${authUrl}?${params.toString()}`;
};

export const getToken = async (authCode: string): Promise<Token> => {
  try {
    const response = await axios.post(tokenUrl, new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: redirectUri,
      client_id: 'ABZfPF9RNNskcKhRenkn3Fdh4l7G9ebHtJj4o7gAan82N7A4zi',
      client_secret: 'NdCnSB6u5qjqLgdJl0MkDwpv07hL68n0QnH9M5pW'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token } = response.data;
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error getting token:', error.response ? error.response.data : error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};

export const refreshToken = async (refreshToken: string): Promise<Token> => {
  try {
    const response = await axios.post(tokenUrl, new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token } = response.data;
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error refreshing token:', error.response ? error.response.data : error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};