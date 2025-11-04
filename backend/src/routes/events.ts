import { Router } from 'express';
import Event from '../models/Event';
import auth, { AuthRequest } from '../middleware/auth';
import { syncEventToSupabase, createNotification } from '../services/supabaseService';

const router = Router();
router.use(auth);

// List my events
router.get('/my', async (req: AuthRequest, res) => {
  const events = await Event.find({ owner: req.userId }).sort({ startTime: 1 });
  res.json(events);
});

// Create event
router.post('/', async (req: AuthRequest, res) => {
  const { title, startTime, endTime, status } = req.body;
  if (!title || !startTime || !endTime) return res.status(400).json({ error: 'Missing fields' });
  
  const event = await Event.create({
    title,
    startTime,
    endTime,
    status: status || 'BUSY',
    owner: req.userId
  });

  // Sync to Supabase for real-time updates
  await syncEventToSupabase({
    user_id: req.userId!,
    event_id: (event._id as any).toString(),
    action: 'created',
    event_data: event.toObject()
  });

  res.status(201).json(event);
});

// Update event (only owner)
router.put('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const update = req.body;
  const event = await Event.findOneAndUpdate({ _id: id, owner: req.userId }, update, { new: true });
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Sync to Supabase
  await syncEventToSupabase({
    user_id: req.userId!,
    event_id: (event._id as any).toString(),
    action: 'updated',
    event_data: event.toObject()
  });

  res.json(event);
});

// Update status (only owner)
router.put('/:id/status', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING' };
  const allowed = ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  
  const event = await Event.findOneAndUpdate({ _id: id, owner: req.userId }, { status }, { new: true });
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Sync to Supabase
  await syncEventToSupabase({
    user_id: req.userId!,
    event_id: (event._id as any).toString(),
    action: 'status_changed',
    event_data: event.toObject()
  });

  res.json(event);
});

// Delete event (only owner)
router.delete('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const deleted = await Event.findOneAndDelete({ _id: id, owner: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Event not found' });

  // Sync to Supabase
  await syncEventToSupabase({
    user_id: req.userId!,
    event_id: (deleted._id as any).toString(),
    action: 'deleted',
    event_data: deleted.toObject()
  });

  res.json({ ok: true });
});

export default router;
