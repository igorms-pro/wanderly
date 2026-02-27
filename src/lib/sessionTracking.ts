import { supabase } from './supabase';

interface CreateSessionParams {
  userId: string;
}

// Basic device detection (simplified version of OneLink's getDeviceInfo)
function getDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return {
      os: 'unknown',
      browser: 'unknown',
      userAgent: 'unknown',
    };
  }

  const ua = navigator.userAgent;
  let os = 'unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';

  let browser = 'unknown';
  if (/Chrome\/\d+/i.test(ua) && !/Edge\/\d+/i.test(ua)) browser = 'Chrome';
  else if (/Safari\/\d+/i.test(ua) && !/Chrome\/\d+/i.test(ua)) browser = 'Safari';
  else if (/Firefox\/\d+/i.test(ua)) browser = 'Firefox';
  else if (/Edg\/\d+/i.test(ua)) browser = 'Edge';

  return {
    os,
    browser,
    userAgent: ua,
  };
}

/**
 * Create or update a user session in the database.
 * If an active session exists for this user/device combination, update last_activity.
 * Otherwise, create a new session.
 */
export async function createUserSession(params: CreateSessionParams): Promise<string | null> {
  try {
    const deviceInfo = getDeviceInfo();

    const { data: existingSession, error: checkError } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', params.userId)
      .eq('device_os', deviceInfo.os)
      .eq('device_browser', deviceInfo.browser)
      .is('revoked_at', null)
      .order('last_activity', { ascending: false })
      .limit(1)
      .single();

    if (existingSession && !checkError) {
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', existingSession.id);

      if (updateError) {
        console.error('Error updating session activity:', updateError);
        return null;
      }

      return existingSession.id;
    }

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: params.userId,
        device_os: deviceInfo.os,
        device_browser: deviceInfo.browser,
        ip_address: null,
        city: null,
        country: null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating user session:', error);
      return null;
    }

    return data?.id ?? null;
  } catch (error) {
    console.error('Error creating user session:', error);
    return null;
  }
}

interface LogLoginAttemptParams {
  email: string;
  status: 'success' | 'failed';
  userId?: string | null;
}

/**
 * Log a login attempt (success or failure) to login_history.
 * This is best-effort and should not block auth flow.
 */
export async function logLoginAttempt(params: LogLoginAttemptParams): Promise<void> {
  try {
    const deviceInfo = getDeviceInfo();

    await supabase.from('login_history').insert({
      user_id: params.userId ?? null,
      email: params.email,
      status: params.status,
      ip_address: null,
      device_info: `${deviceInfo.browser} on ${deviceInfo.os}`,
      user_agent: deviceInfo.userAgent,
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
}
