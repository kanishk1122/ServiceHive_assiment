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
          <h3 className="flex-row align-center gap-1">
            <InboxIcon size={20} />
            <span>Incoming Request</span>
          </h3>
          <p>
            <strong>Their offer:</strong> {req.mySlot.title}
          </p>
          <p className="flex-row align-center gap-1" style={{ fontSize: '0.9rem' }}>
            <CalendarIcon size={14} />
            <span>{new Date(req.mySlot.startTime).toLocaleString()}</span>
          </p>
          <p style={{ marginTop: '1rem' }}>
            <strong>Your slot:</strong> {req.theirSlot.title}
          </p>
          <p className="flex-row align-center gap-1" style={{ fontSize: '0.9rem' }}>
            <CalendarIcon size={14} />
            <span>{new Date(req.theirSlot.startTime).toLocaleString()}</span>
          </p>
        </div>
      ) : (
        <div>
          <h3 className="flex-row align-center gap-1">
            <OutboxIcon size={20} />
            <span>Outgoing Request</span>
          </h3>
          <p>
            <strong>You offered:</strong> {req.mySlot.title}
          </p>
          <p className="flex-row align-center gap-1" style={{ fontSize: '0.9rem' }}>
            <CalendarIcon size={14} />
            <span>{new Date(req.mySlot.startTime).toLocaleString()}</span>
          </p>
          <p style={{ marginTop: '1rem' }}>
            <strong>For their slot:</strong> {req.theirSlot.title}
          </p>
          <p className="flex-row align-center gap-1" style={{ fontSize: '0.9rem' }}>
            <CalendarIcon size={14} />
            <span>{new Date(req.theirSlot.startTime).toLocaleString()}</span>
          </p>
        </div>
      )}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Created: {new Date(req.createdAt).toLocaleString()}
      </p>
      {type === 'incoming' && req.status === 'PENDING' && (
        <div className="actions">
          <button className="success flex-row align-center gap-1" onClick={() => handleResponse(req._id, true)}>
            <CheckIcon size={16} />
            <span>Accept</span>
          </button>
          <button className="danger flex-row align-center gap-1" onClick={() => handleResponse(req._id, false)}>
            <CloseIcon size={16} />
            <span>Reject</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h2 className="flex-row align-center justify-center gap-2">
        <RequestsIcon size={40} />
        <span>Swap Requests</span>
      </h2>
      {error && <p className="error">{error}</p>}
      
      <h3 className="flex-row align-center gap-1">
        <InboxIcon size={24} />
        <span>Incoming Requests</span>
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

      <h3 className="flex-row align-center gap-1">
        <OutboxIcon size={24} />
        <span>Outgoing Requests</span>
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
