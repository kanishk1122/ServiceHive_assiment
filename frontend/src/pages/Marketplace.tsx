import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import type { IEvent } from '../types';
import { MarketplaceIcon, CalendarIcon, ClockIcon, SwapIcon } from '../components/Icons';
import SwapRequestModal from '../components/SwapRequestModal';

export default function Marketplace() {
  const [slots, setSlots] = useState<IEvent[]>([]);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<IEvent | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await api.get('/swappable-slots');
      setSlots(res.data);
    } catch {
      setError('Failed to fetch swappable slots.');
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <MarketplaceIcon size={40} />
        Marketplace
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>
        Browse and request time slots available for swapping from other users.
      </p>
      {error && <p className="error">{error}</p>}
      <div className="event-list">
        {slots.length === 0 ? (
          <div className="empty-state">
            <p>No swappable slots available at the moment. Check back later!</p>
          </div>
        ) : (
          slots.map(slot => (
            <div key={slot._id} className="event-card">
              <h3>{slot.title}</h3>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarIcon size={16} />
                <strong>Start:</strong> {new Date(slot.startTime).toLocaleString()}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClockIcon size={16} />
                <strong>End:</strong> {new Date(slot.endTime).toLocaleString()}
              </p>
              <div className="actions">
                <button onClick={() => setSelectedSlot(slot)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SwapIcon size={16} />
                  Request Swap
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedSlot && (
        <SwapRequestModal
          theirSlot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSwapRequested={() => {
            setSelectedSlot(null);
            fetchSlots(); // Re-fetch to remove the now-pending slot
          }}
        />
      )}
    </div>
  );
}
