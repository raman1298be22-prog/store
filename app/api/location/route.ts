import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : realIp || '127.0.0.1';

    console.log('Detected IP:', ip);
    console.log('Forwarded header:', forwarded);
    console.log('Real IP header:', realIp);

    // For local development, default to US
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      console.log('Local IP detected, returning US');
      return Response.json({ country_code: 'US', currency: 'USD' });
    }

    // Fetch location data from ipapi.co using the IP
    console.log('Fetching location for IP:', ip);
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    console.log('ipapi.co response:', data);

    return Response.json(data);
  } catch (error) {
    console.error('Failed to fetch location:', error);
    return Response.json({ country_code: 'US', currency: 'USD' });
  }
}