import { Router } from 'express';
// import { authenticateAdmin, authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent } from '../controllers/event.controller';

const router = Router();

// Admin routes
router.post('/', authenticateToken, requireAdmin, createEvent);
router.put('/:id', authenticateToken, requireAdmin, updateEvent);
router.delete('/:id', authenticateToken, requireAdmin, deleteEvent);

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

export default router; 