import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const order = req.body;
    
    // Mock CJ Order Fulfillment Response
    const mockFulfillment = {
      cj_order_id: `CJ_ORD_${Math.floor(Math.random() * 1000000)}`,
      status: 'pending',
      tracking_number: null
    };

    res.status(200).json({ success: true, fulfillment: mockFulfillment });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
