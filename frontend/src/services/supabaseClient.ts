import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real-time subscription for notifications
export const subscribeToNotifications = (userId: string, callback: (notification: any) => void) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// Real-time subscription for swap requests
export const subscribeToSwapRequests = (userId: string, callback: (swapRequest: any) => void) => {
  return supabase
    .channel('swap_requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'realtime_swap_requests',
        filter: `requester_id=eq.${userId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'realtime_swap_requests',
        filter: `responder_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// Real-time subscription for events
export const subscribeToEvents = (userId: string, callback: (event: any) => void) => {
  return supabase
    .channel('events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'realtime_events',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};
