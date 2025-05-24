import { Request, Response } from 'express';
import { QuoteService } from '../services/quoteService';
import { QuoteStatus } from '@prisma/client';

export class QuoteController {
  /**
   * Create new quote
   * POST /api/quotes
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        serviceId,
        clientId,
        title,
        description,
        amount,
        validUntil,
        notes
      } = req.body;

      const quoteData = {
        serviceId,
        clientId,
        title,
        description,
        amount: parseFloat(amount),
        validUntil: new Date(validUntil),
        notes
      };

      const quote = await QuoteService.createQuote(quoteData);

      res.status(201).json({
        success: true,
        message: 'Cotización creada exitosamente',
        data: quote
      });
    } catch (error) {
      console.error('Error creating quote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all quotes with filtering
   * GET /api/quotes
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        clientId,
        serviceId,
        page = '1',
        limit = '20'
      } = req.query;

      const filters = {
        ...(status && { status: status as QuoteStatus }),
        ...(clientId && { clientId: clientId as string }),
        ...(serviceId && { serviceId: serviceId as string })
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await QuoteService.getQuotes(filters, pageNumber, limitNumber);

      res.status(200).json({
        success: true,
        message: 'Cotizaciones obtenidas exitosamente',
        data: result.quotes,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.pagination.totalPages,
          totalQuotes: result.pagination.total,
          hasNext: pageNumber < result.pagination.totalPages,
          hasPrev: pageNumber > 1
        }
      });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quote by ID
   * GET /api/quotes/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const quote = await QuoteService.getQuoteById(id);

      if (!quote) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cotización obtenida exitosamente',
        data: quote
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quotes by client
   * GET /api/quotes/client/:clientId
   */
  static async getByClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const {
        status,
        page = '1',
        limit = '20'
      } = req.query;

      const filters = {
        clientId,
        ...(status && { status: status as QuoteStatus })
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await QuoteService.getQuotes(filters, pageNumber, limitNumber);

      res.status(200).json({
        success: true,
        message: 'Cotizaciones del cliente obtenidas exitosamente',
        data: result.quotes,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.pagination.totalPages,
          totalQuotes: result.pagination.total,
          hasNext: pageNumber < result.pagination.totalPages,
          hasPrev: pageNumber > 1
        }
      });
    } catch (error) {
      console.error('Error fetching client quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update quote
   * PUT /api/quotes/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convert date strings and amounts
      if (updateData.validUntil) {
        updateData.validUntil = new Date(updateData.validUntil);
      }
      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount);
      }

      const quote = await QuoteService.updateQuote(id, updateData);

      if (!quote) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cotización actualizada exitosamente',
        data: quote
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete quote
   * DELETE /api/quotes/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await QuoteService.deleteQuote(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cotización eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting quote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Approve quote
   * POST /api/quotes/:id/approve
   */
  static async approve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const quote = await QuoteService.approveQuote(id);

      if (!quote) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cotización aprobada exitosamente',
        data: quote
      });
    } catch (error) {
      console.error('Error approving quote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reject quote
   * POST /api/quotes/:id/reject
   */
  static async reject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const quote = await QuoteService.rejectQuote(id);

      if (!quote) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cotización rechazada exitosamente',
        data: quote
      });
    } catch (error) {
      console.error('Error rejecting quote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get expired quotes
   * GET /api/quotes/expired
   */
  static async getExpired(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '20'
      } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await QuoteService.getExpiredQuotes(pageNumber, limitNumber);

      res.status(200).json({
        success: true,
        message: 'Cotizaciones expiradas obtenidas exitosamente',
        data: result.quotes,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.pagination.totalPages,
          totalQuotes: result.pagination.total,
          hasNext: pageNumber < result.pagination.totalPages,
          hasPrev: pageNumber > 1
        }
      });
    } catch (error) {
      console.error('Error fetching expired quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}