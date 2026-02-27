import { http, HttpResponse } from 'msw';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';

export const handlers = [
  // Example: stub auth signInWithOtp if we ever call it via fetch
  http.post(`${SUPABASE_URL}/auth/v1/otp`, async () => {
    return HttpResponse.json({}, { status: 200 });
  }),
];
