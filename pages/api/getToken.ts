// src/services/getToken.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from '../../src/services/authService';
import { setTokens } from '../../src/services/tokenStorage';
import { Token } from '../../src/types/Token';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const authCode = req.query.code as string;

  if (!authCode) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const tokens: Token = await getToken(authCode);
    setTokens(tokens);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching token' });
  }
};