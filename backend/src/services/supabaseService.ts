import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Real-time notification types
export interface RealtimeNotification {
  id?: string;
  user_id: string;
  type: 'swap_request' | 'swap_accepted' | 'swap_rejected' | 'event_update';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at?: string;
}

export interface RealtimeEvent {
  id?: string;
  user_id: string;
  event_id: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  event_data: any;
  created_at?: string;
}

export interface RealtimeSwapRequest {
  id?: string;
  swap_request_id: string;
  requester_id: string;
  responder_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  my_slot_data: any;
  their_slot_data: any;
  created_at?: string;
  updated_at?: string;
}

// Notification functions
export const createNotification = async (notification: RealtimeNotification) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Supabase notification error:', error);
    return null;
  }
};

export const getNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase get notifications error:', error);
    return [];
  }
};

export const markNotificationRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase mark read error:', error);
    return false;
  }
};

// Event functions
export const syncEventToSupabase = async (eventData: RealtimeEvent) => {
  try {
    const { data, error } = await supabase
      .from('realtime_events')
      .upsert([eventData], { onConflict: 'event_id,user_id' })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Supabase sync event error:', error);
    return null;
  }
};

// Swap request functions
export const syncSwapRequestToSupabase = async (swapData: RealtimeSwapRequest) => {
  try {
    const { data, error } = await supabase
      .from('realtime_swap_requests')
      .upsert([swapData], { onConflict: 'swap_request_id' })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Supabase sync swap error:', error);
    return null;
  }
};

export const getActiveSwapRequests = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('realtime_swap_requests')
      .select('*')
      .or(`requester_id.eq.${userId},responder_id.eq.${userId}`)
      .eq('status', 'pending');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase get active swaps error:', error);
    return [];
  }
};
