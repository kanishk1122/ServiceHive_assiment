import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import type { ISwapRequest } from '../types';
import { AxiosError } from 'axios';
import { RequestsIcon, InboxIcon, OutboxIcon, CalendarIcon, CheckIcon, CloseIcon } from '../components/Icons';

export default function Requests() {
  const [incoming, setIncoming] = useState<ISwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ISwapRequest[]>([]);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get('/requests');
      setIncoming(res.data.incoming);
      setOutgoing(res.data.outgoing);
    } catch {
      setError('Failed to fetch requests.');
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResponse = async (requestId: string, accept: boolean) => {
    try {
      await api.post(`/swap-response/${requestId}`, { accept });
      fetchRequests(); // Refresh lists
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || 'Failed to respond to request.');
      } else {
        setError('Failed to respond to request.');
      }     
    }
  };

  const renderRequest = (req: ISwapRequest, type: 'incoming' | 'outgoing') => (
    <div key={req._id} className="request-card">
      <p>
        <span className={`status-badge status-${req.status.toLowerCase()}`}>
          {req.status}
        </span>
      </p>
      {type === 'incoming' ? (
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <InboxIcon size={20} />
            Incoming Request
          </h3>
          <p>
            <strong>Their offer:</strong> {req.mySlot.title}
          </p>
          <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={14} />
            {new Date(req.mySlot.startTime).toLocaleString()}
          </p>
          <p style={{ marginTop: '1rem' }}>
            <strong>Your slot:</strong> {req.theirSlot.title}
          </p>
          <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={14} />
            {new Date(req.theirSlot.startTime).toLocaleString()}
          </p>
        </div>
      ) : (
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <OutboxIcon size={20} />
            Outgoing Request
          </h3>
          <p>
            <strong>You offered:</strong> {req.mySlot.title}
          </p>
          <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={14} />
            {new Date(req.mySlot.startTime).toLocaleString()}
          </p>
          <p style={{ marginTop: '1rem' }}>
            <strong>For their slot:</strong> {req.theirSlot.title}
          </p>
          <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={14} />
            {new Date(req.theirSlot.startTime).toLocaleString()}
          </p>
        </div>
      )}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Created: {new Date(req.createdAt).toLocaleString()}
      </p>
      {type === 'incoming' && req.status === 'PENDING' && (
        <div className="actions">
          <button className="success" onClick={() => handleResponse(req._id, true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckIcon size={16} />
            Accept
          </button>
          <button className="danger" onClick={() => handleResponse(req._id, false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloseIcon size={16} />
            Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <RequestsIcon size={40} />
        Swap Requests
      </h2>
      {error && <p className="error">{error}</p>}
      
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <InboxIcon size={24} />
        Incoming Requests
      </h3>
      <div className="request-list">
        {incoming.length > 0 ? (
          incoming.map(req => renderRequest(req, 'incoming'))
        ) : (
          <div className="empty-state">
            <p>No incoming requests at the moment.</p>
          </div>
        )}
      </div>

      <hr />

      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <OutboxIcon size={24} />
        Outgoing Requests
      </h3>
      <div className="request-list">
        {outgoing.length > 0 ? (
          outgoing.map(req => renderRequest(req, 'outgoing'))
        ) : (
          <div className="empty-state">
            <p>You haven't made any swap requests yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
