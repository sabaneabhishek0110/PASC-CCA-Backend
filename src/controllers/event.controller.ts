import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { postEvent } from '../services/event.service';
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       400:
 *         description: Bad request
 *         schema:
 *           $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const createEvent = async (req: Request,res: Response) : Promise<void> => {
    try {
        const result = await postEvent(req.body);

        if (!result.success) {
            res.status(400).json(result);
            return
        }

        res.status(201).json(result);

    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unexpected error'
        });
    }
};

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     description: Returns a list of all events in the system
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Successfully retrieved all events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: 'desc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'failed to fetch all events',
    });
  }
};

/**
 * @swagger
 * /api/event/{id}:
 *   get:
 *     summary: Get details of a specific event
 *     description: Returns the complete details of a single event by its ID
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid ID format or request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const {id} = req.params;
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
      return;
    }
    const event = await prisma.event.findUnique({
        where : {
            id : parseInt(id)
        }
    });

    if (!event) {
      res.status(404).json({
        success: false,
        error: 'Event not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data : event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'failed to fetch particular event',
    });
  }
};

/**
 * @swagger
 * /api/event/{id}:
 *   put:
 *     summary: Update an existing event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               credits:
 *                 type: number
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input or bad request
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {id} = req.params;
    const updateData = req.body;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ success: false, error: 'Invalid event ID' });
      return;
    }

    if (updateData.startDate || updateData.endDate) {
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }

        const existingEvent = await prisma.event.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingEvent) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
        }

        const startDate = updateData.startDate ? new Date(updateData.startDate) : existingEvent.startDate;
        const endDate = updateData.endDate ? new Date(updateData.endDate) : existingEvent.endDate;

        if (startDate > endDate) {
        res.status(400).json({ 
            success: false, 
            error: 'End date must be after start date' 
        });
        return;
        }

        const currDate = new Date();
        if (startDate <= currDate && endDate >= currDate) {
            updateData.status = "ONGOING";
        } else if (startDate > currDate) {
            updateData.status = "UPCOMING";
        } else {
            updateData.status = "COMPLETED";
        }
    }

    const updatedEvent = await prisma.event.update({
        where : { id : parseInt(id)},
        data : updateData
    });
    
    res.status(201).json({
      success: true,
      message : "Event get updated successfully",
      data: updatedEvent,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Event update failed ',
    });
  }
};

/**
 * @swagger
 * /api/event/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to delete
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {id} = req.params;
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ success: false, error: 'Invalid event ID' });
      return;
    }

    await prisma.event.delete({
        where : {
            id : parseInt(id)
        }
    });


    res.status(200).json({
      success: true,
      message : "Event deleted successfully"
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Event deletion failed',
      });
    }
  }
};

