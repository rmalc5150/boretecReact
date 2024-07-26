// src/services/tokenStorage.ts
import { Token } from '../types/Token';

let tokens: Token = {
  accessToken: '',
  refreshToken: ''
};

export const getTokens = (): Token => tokens;

export const setTokens = (newTokens: Token): void => {
  tokens = newTokens;
  // Persist tokens in localStorage or sessionStorage if running in a browser environment
  if (typeof window !== 'undefined') {
    localStorage.setItem('tokens', JSON.stringify(tokens));
  }
};

// Load tokens from localStorage if running in a browser environment
if (typeof window !== 'undefined') {
  const storedTokens = localStorage.getItem('tokens');
  if (storedTokens) {
    tokens = JSON.parse(storedTokens);
  }
}