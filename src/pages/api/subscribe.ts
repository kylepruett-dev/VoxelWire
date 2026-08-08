import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error('BREVO_API_KEY is missing in environment variables.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: BREVO_API_KEY is not set.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: email.trim(),
        updateEnabled: true,
      }),
    });

    if (brevoResponse.ok || brevoResponse.status === 201 || brevoResponse.status === 204) {
      return new Response(
        JSON.stringify({ message: 'Subscribed successfully!' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const errorData = await brevoResponse.json().catch(() => ({}));
    const errorMessage = errorData?.message || 'Failed to subscribe with Brevo';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: brevoResponse.status || 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('API Error in /api/subscribe:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
