import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import type { EventStatus } from '../types';
import type { AxiosError } from 'axios';
import { DashboardIcon, CalendarIcon, ClockIcon, PendingIcon } from '../components/Icons';

interface IEvent {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  owner: string;
}

export default function Dashboard() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get('/events/my');
      setEvents(res.data);
    } catch {
      setError('Failed to fetch events.');
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', { title, startTime, endTime });
      setTitle('');
      setStartTime('');
      setEndTime('');
      fetchEvents();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as AxiosError<{ error?: string }>;
        setError(axiosErr.response?.data?.error || 'Failed to create event.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create event.');
      }
    }
  };

  const handleStatusChange = async (id: string, status: EventStatus) => {
    try {
      await api.put(`/events/${id}/status`, { status });
      fetchEvents();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as AxiosError<{ error?: string }>;
        setError(axiosErr.response?.data?.error || 'Failed to update status.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update status.');
      }
    }
  };

  return (
    <div>
      <h2 className="flex-row align-center justify-center gap-2">
        <DashboardIcon size={40} />
        <span>My Dashboard</span>
      </h2>
      
      <form onSubmit={handleCreateEvent}>
        <h3>Create New Event</h3>
        <input 
          type="text" 
          placeholder="Event Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
        />
        <label htmlFor="start-time">Start Time</label>
        <input 
          id="start-time"
          type="datetime-local" 
          value={startTime} 
          onChange={e => setStartTime(e.target.value)} 
          required 
        />
        <label htmlFor="end-time">End Time</label>
        <input 
          id="end-time"
          type="datetime-local" 
          value={endTime} 
          onChange={e => setEndTime(e.target.value)} 
          required 
        />
        <button type="submit">Create Event</button>
      </form>

      <hr />

      <h3>My Events</h3>
      {error && <p className="error">{error}</p>}
      <div className="event-list">
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events yet. Create your first event above!</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event._id} className="event-card">
              <h3>{event.title}</h3>
              <p>
                <span className={`status-badge status-${event.status.toLowerCase().replace('_', '-')}`}>
                  {event.status.replace('_', ' ')}
                </span>
              </p>
              <p className="flex-row align-center gap-1">
                <CalendarIcon size={16} />
                <span><strong>Start:</strong> {new Date(event.startTime).toLocaleString()}</span>
              </p>
              <p className="flex-row align-center gap-1">
                <ClockIcon size={16} />
                <span><strong>End:</strong> {new Date(event.endTime).toLocaleString()}</span>
              </p>
              <div className="actions">
                {event.status === 'BUSY' && (
                  <button className="success" onClick={() => handleStatusChange(event._id, 'SWAPPABLE')}>
                    Make Swappable
                  </button>
                )}
                {event.status === 'SWAPPABLE' && (
                  <button className="secondary" onClick={() => handleStatusChange(event._id, 'BUSY')}>
                    Make Busy
                  </button>
                )}
                {event.status === 'SWAP_PENDING' && (
                  <button disabled className="flex-row align-center gap-1">
                    <PendingIcon size={16} />
                    <span>Pending Swap</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
