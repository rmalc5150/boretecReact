// pages/api/createInvoice.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createInvoice } from '../../src/services/apiService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { company_id, invoice } = req.body;

  if (!company_id || !invoice) {
    res.status(400).json({ error: 'Missing company_id or invoice data' });
    return;
  }

  try {
    const result = await createInvoice(invoice, company_id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error creating invoice:', error); // Log the error for debugging
    res.status(500).json({ error: 'Error creating invoice', details: error }); // Include error details
  }
};