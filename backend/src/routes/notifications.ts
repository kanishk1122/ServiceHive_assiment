import { Router } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import { getNotifications, markNotificationRead } from '../services/supabaseService';

const router = Router();

// Get notifications for user
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const notifications = await getNotifications(req.userId!);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const success = await markNotificationRead(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to mark as read' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
