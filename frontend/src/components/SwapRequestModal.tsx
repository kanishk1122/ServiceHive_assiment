import { useState, useEffect } from 'react';
import api from '../api';
import type { IEvent } from '../types';
import { CloseIcon } from './Icons';

interface Props {
  theirSlot: IEvent;
  onClose: () => void;
  onSwapRequested: () => void;
}

export default function SwapRequestModal({ theirSlot, onClose, onSwapRequested }: Props) {
  const [mySlots, setMySlots] = useState<IEvent[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySlots = async () => {
      try {
        setLoading(true);
        const res = await api.get('/events/my');
        const swappableSlots = res.data.filter((e: IEvent) => e.status === 'SWAPPABLE');
        setMySlots(swappableSlots);
        console.log('My swappable slots:', swappableSlots); // Debug log
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError('Could not fetch your swappable slots.');
      } finally {
        setLoading(false);
      }
    };

    fetchMySlots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setError('Please select one of your slots to offer.');
      return;
    }
    
    try {
      setError('');
      await api.post('/swap-request', {
        mySlotId: selectedSlotId,
        theirSlotId: theirSlot._id,
      });
      onSwapRequested();
    } catch (err: any) {
      console.error('Swap request error:', err);
      setError(err.response?.data?.error || 'Failed to create swap request.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Request Swap</h2>
          <button 
            type="button" 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        
        <p style={{ marginBottom: '1.5rem' }}>
          You want to swap for: <strong>{theirSlot.title}</strong>
        </p>
        
        {loading ? (
          <p>Loading your slots...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="my-slot">Choose one of your swappable slots to offer:</label>
            <select
              id="my-slot"
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              style={{ marginBottom: '1rem' }}
            >
              <option value="" disabled>Select your slot</option>
              {mySlots.map(slot => (
                <option key={slot._id} value={slot._id}>
                  {slot.title} ({new Date(slot.startTime).toLocaleString()})
                </option>
              ))}
            </select>
            
            {mySlots.length === 0 && !loading && (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                You have no swappable slots to offer. Go to your dashboard and make some of your events swappable first.
              </p>
            )}
            
            {error && <p className="error">{error}</p>}
            
            <div className="actions">
              <button type="submit" disabled={!selectedSlotId || loading}>
                Confirm Request
              </button>
              <button type="button" className="secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
