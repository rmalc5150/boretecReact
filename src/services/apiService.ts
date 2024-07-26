import axios, { AxiosError } from 'axios';
import { getTokens, setTokens } from './tokenStorage';
import { refreshToken } from './authService';
import { Token } from '../types/Token';

const API_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com'; // or 'https://quickbooks.api.intuit.com' for production

const fetchNewToken = async (): Promise<string> => {
  const { refreshToken: storedRefreshToken } = getTokens();
  const newTokens = await refreshToken(storedRefreshToken);
  setTokens(newTokens);
  return newTokens.accessToken;
};

export const makeApiCall = async (endpoint: string, method: string = 'GET', data: any = null): Promise<any> => {
  let { accessToken } = getTokens();

  try {
    const response = await axios({
      url: `${API_BASE_URL}${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 401) {
        // Token might be expired, refresh it
        accessToken = await fetchNewToken();
        const tokens: Token = { accessToken, refreshToken: getTokens().refreshToken };
        setTokens(tokens);

        // Retry the API call with the new token
        const retryResponse = await axios({
          url: `${API_BASE_URL}${endpoint}`,
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          data,
        });
        return retryResponse.data;
      }
    }
    console.error('Error making API call:', error);
    throw error;
  }
};

export const createInvoice = async (invoice: any, company_id: string): Promise<any> => {
  const endpoint = `/v3/company/${company_id}/invoice`;
  console.log('Creating invoice with endpoint:', endpoint, 'and invoice data:', invoice); // Log for debugging
  return await makeApiCall(endpoint, 'POST', invoice);
};