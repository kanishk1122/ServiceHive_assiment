import { Router } from 'express';
import mongoose from 'mongoose';
import auth, { AuthRequest } from '../middleware/auth';
import Event from '../models/Event';
import SwapRequest from '../models/SwapRequest';
import { syncSwapRequestToSupabase, createNotification } from '../services/supabaseService';

const router = Router();

// Swappable slots from other users
router.get('/swappable-slots', auth, async (req: AuthRequest, res) => {
  const slots = await Event.find({
    status: 'SWAPPABLE',
    owner: { $ne: req.userId }
  }).sort({ startTime: 1 });
  res.json(slots);
});

// Create swap request
router.post('/swap-request', auth, async (req: AuthRequest, res) => {
  const { mySlotId, theirSlotId } = req.body as { mySlotId: string; theirSlotId: string };
  if (!mySlotId || !theirSlotId) return res.status(400).json({ error: 'Missing slot ids' });

  const [mySlot, theirSlot] = await Promise.all([
    Event.findOne({ _id: mySlotId }),
    Event.findOne({ _id: theirSlotId })
  ]);

  if (!mySlot || !theirSlot) return res.status(404).json({ error: 'Slot not found' });
  if (String(mySlot.owner) !== req.userId) return res.status(403).json({ error: 'Not your slot' });
  if (String(theirSlot.owner) === req.userId) return res.status(400).json({ error: 'Cannot swap with yourself' });
  if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE')
    return res.status(400).json({ error: 'Both slots must be SWAPPABLE' });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Event.updateOne({ _id: mySlot._id, status: 'SWAPPABLE' }, { $set: { status: 'SWAP_PENDING' } }, { session });
      await Event.updateOne({ _id: theirSlot._id, status: 'SWAPPABLE' }, { $set: { status: 'SWAP_PENDING' } }, { session });

      const sr = await SwapRequest.create(
        [
          {
            requesterUser: req.userId,
            responderUser: theirSlot.owner,
            mySlot: mySlot._id,
            theirSlot: theirSlot._id,
            status: 'PENDING'
          }
        ],
        { session }
      );

      // Sync to Supabase for real-time updates
      await syncSwapRequestToSupabase({
        swap_request_id: (sr[0]._id as any).toString(),
        requester_id: req.userId!,
        responder_id: theirSlot.owner.toString(),
        status: 'pending',
        my_slot_data: mySlot.toObject(),
        their_slot_data: theirSlot.toObject()
      });

      // Create notification for the responder
      await createNotification({
        user_id: theirSlot.owner.toString(),
        type: 'swap_request',
        title: 'New Swap Request',
        message: `Someone wants to swap "${mySlot.title}" for your "${theirSlot.title}"`,
        data: { swapRequestId: (sr[0]._id as any).toString() },
        read: false
      });

      res.status(201).json(sr[0]);
    });
  } catch (e) {
    res.status(409).json({ error: 'Failed to create swap request' });
  } finally {
    session.endSession();
  }
});

// Respond to swap request
router.post('/swap-response/:requestId', auth, async (req: AuthRequest, res) => {
  const { requestId } = req.params;
  const { accept } = req.body as { accept: boolean };

  const sr = await SwapRequest.findById(requestId);
  if (!sr) return res.status(404).json({ error: 'Request not found' });
  if (String(sr.responderUser) !== req.userId) return res.status(403).json({ error: 'Not authorized' });
  if (sr.status !== 'PENDING') return res.status(400).json({ error: 'Request is not pending' });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const [mySlot, theirSlot] = await Promise.all([
        Event.findById(sr.mySlot).session(session),
        Event.findById(sr.theirSlot).session(session)
      ]);
      if (!mySlot || !theirSlot) throw new Error('Slots missing');

      if (!accept) {
        await SwapRequest.updateOne({ _id: sr._id }, { $set: { status: 'REJECTED' } }, { session });
        await Event.updateOne({ _id: mySlot._id }, { $set: { status: 'SWAPPABLE' } }, { session });
        await Event.updateOne({ _id: theirSlot._id }, { $set: { status: 'SWAPPABLE' } }, { session });

        // Update Supabase
        await syncSwapRequestToSupabase({
          swap_request_id: (sr._id as any).toString(),
          requester_id: sr.requesterUser.toString(),
          responder_id: sr.responderUser.toString(),
          status: 'rejected',
          my_slot_data: mySlot.toObject(),
          their_slot_data: theirSlot.toObject()
        });

        // Notify requester
        await createNotification({
          user_id: sr.requesterUser.toString(),
          type: 'swap_rejected',
          title: 'Swap Request Rejected',
          message: `Your swap request for "${theirSlot.title}" was rejected`,
          data: { swapRequestId: (sr._id as any).toString() },
          read: false
        });

        return res.json({ status: 'REJECTED' });
      }

      // Accept path: swap owners and set both to BUSY
      const ownerA = mySlot.owner;
      const ownerB = theirSlot.owner;

      // Ensure current owners are as expected (prevent stale acceptance)
      if (String(ownerA) !== String(sr.requesterUser) || String(ownerB) !== String(sr.responderUser)) {
        throw new Error('Ownership changed; cannot accept');
      }

      await SwapRequest.updateOne({ _id: sr._id }, { $set: { status: 'ACCEPTED' } }, { session });
      await Event.updateOne({ _id: mySlot._id }, { $set: { owner: ownerB, status: 'BUSY' } }, { session });
      await Event.updateOne({ _id: theirSlot._id }, { $set: { owner: ownerA, status: 'BUSY' } }, { session });

      // Update Supabase
      await syncSwapRequestToSupabase({
        swap_request_id: (sr._id as any).toString(),
        requester_id: (sr.requesterUser as any).toString(),
        responder_id: (sr.responderUser as any).toString(),
        status: 'accepted',
        my_slot_data: { ...mySlot.toObject(), owner: ownerB },
        their_slot_data: { ...theirSlot.toObject(), owner: ownerA }
      });

      // Notify requester
      await createNotification({
        user_id: sr.requesterUser.toString(),
        type: 'swap_accepted',
        title: 'Swap Request Accepted!',
        message: `Your swap request for "${theirSlot.title}" was accepted`,
        data: { swapRequestId: (sr._id as any).toString() },
        read: false
      });

      res.json({ status: 'ACCEPTED' });
    });
  } catch (e) {
    res.status(400).json({ error: 'Failed to process response' });
  } finally {
    session.endSession();
  }
});

// List my requests (incoming/outgoing)
router.get('/requests', auth, async (req: AuthRequest, res) => {
  const [incoming, outgoing] = await Promise.all([
    SwapRequest.find({ responderUser: req.userId }).sort({ createdAt: -1 }).populate(['mySlot', 'theirSlot']),
    SwapRequest.find({ requesterUser: req.userId }).sort({ createdAt: -1 }).populate(['mySlot', 'theirSlot'])
  ]);
  res.json({ incoming, outgoing });
});

export default router;
