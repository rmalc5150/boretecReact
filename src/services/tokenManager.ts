// src/services/tokenManager.ts
import { refreshToken } from './authService';

const refreshTokens = async () => {
  const storedRefreshToken = 'your-stored-refresh-token'; // Retrieve this from your database
  try {
    const newTokens = await refreshToken(storedRefreshToken);
    // Store new tokens in your database
  } catch (error) {
    console.error('Error refreshing tokens:', error);
  }
};

export default refreshTokens;