import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Pagos del usuario autenticado
  async getMyPayments(req: Request, res: Response) {
    const user = (req as any).user;
    const payments = await this.paymentService.getPaymentsByUserId(user.userId);
    res.json({ success: true, payments });
  }

  // Pagos pendientes del usuario autenticado
  async getMyPendingPayments(req: Request, res: Response) {
    const user = (req as any).user;
    const all = await this.paymentService.getPaymentsByUserId(user.userId);
    const payments = all.filter((p: any) => p.status?.toUpperCase() !== 'PAID');
    res.json({ success: true, payments });
  }

  async listPayments(req: Request, res: Response) {
    const user = (req as any).user;
    let payments;
    if (user.role === 'GERENTE') {
      payments = await this.paymentService.listPayments();
    } else if (user.role === 'ASISTENTE') {
      payments = await this.paymentService.listPayments(); // O filtrar por clientes asignados si aplica
    } else {
      payments = await this.paymentService.getPaymentsByUserId(user.userId);
    }
    res.json({ success: true, payments });
  }

  async createPayment(req: Request, res: Response) {
    const user = (req as any).user;
    const { creditId, amount, paymentMethod } = req.body;
    if (!creditId || !amount) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }
    const payment = await this.paymentService.createPayment({ creditId, userId: user.userId, amount, paymentMethod });
    res.status(201).json({ success: true, payment });
  }

  async updatePayment(req: Request, res: Response) {
    const user = (req as any).user;
    const paymentId = req.params.id;
    const payment = await this.paymentService.getPaymentById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    if (user.role === 'CLIENTE' && payment.userId !== user.userId) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    // Solo gerente/asistente pueden cambiar status, cliente solo amount si aplica
    const data = req.body;
    if (user.role === 'CLIENTE' && data.status) {
      return res.status(403).json({ success: false, message: 'No puede cambiar el estado' });
    }
    const updated = await this.paymentService.updatePayment(paymentId, data);
    res.json({ success: true, payment: updated });
  }

  async deletePayment(req: Request, res: Response) {
    const user = (req as any).user;
    if (user.role !== 'GERENTE') {
      return res.status(403).json({ success: false, message: 'Solo gerente puede eliminar pagos' });
    }
    const paymentId = req.params.id;
    await this.paymentService.deletePayment(paymentId);
    res.json({ success: true });
  }

  async getRecentPayments(req: Request, res: Response) {
    const clientId = req.params.clientId;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client ID is required' });
    }

    try {
      const payments = await this.paymentService.getRecentPaymentsByClientId(clientId);
      res.json({ success: true, payments });
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch recent payments' });
    }
  }
}
