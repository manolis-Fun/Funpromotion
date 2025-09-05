import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = 'https://react.woth.gr/wp-json/wc/store/cart';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('woocommerce_cart_hash')?.value;

    const res = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie && {
          'Cookie': `woocommerce_cart_hash=${sessionCookie}`,
        }),
      },
    });

    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');
    const headers = new Headers();
    if (setCookie) headers.set('set-cookie', setCookie);

    return new NextResponse(JSON.stringify(data), { status: 200, headers });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
