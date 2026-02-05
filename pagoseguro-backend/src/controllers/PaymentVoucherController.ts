import { Request, Response } from 'express';
import { PaymentVoucherService, CreateVoucherDTO } from '../services/PaymentVoucherService';
import { VoucherType } from '../models/PaymentVoucher';

export class PaymentVoucherController {
  constructor(private readonly voucherService: PaymentVoucherService) {}

  // RF-2: Registrar comprobante de pago
  async createVoucher(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const {
        creditId,
        voucherNumber,
        amount,
        paymentDate,
        voucherType,
        bankName,
        accountNumber,
        payerName,
        beneficiaryName,
        imageBase64
      } = req.body;

      // Validar campos requeridos antes de procesar
      if (!creditId) {
        res.status(400).json({ success: false, message: 'El ID del crédito es requerido' });
        return;
      }

      const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);

      const data: CreateVoucherDTO = {
        userId,
        creditId,
        voucherNumber: voucherNumber || '',
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
        paymentDate: paymentDate || '',
        voucherType: voucherType as VoucherType || VoucherType.TRANSFER,
        bankName: bankName || undefined,
        accountNumber: accountNumber || undefined,
        payerName: payerName || undefined,
        beneficiaryName: beneficiaryName || undefined,
        imageBase64: imageBase64 || ''
      };

      console.log('Creating voucher with data:', {
        userId: data.userId,
        creditId: data.creditId,
        voucherNumber: data.voucherNumber,
        amount: data.amount,
        paymentDate: data.paymentDate,
        hasImage: !!data.imageBase64
      });

      const { voucher, validation } = await this.voucherService.createVoucher(data);

      res.status(201).json({
        success: true,
        message: 'Comprobante registrado exitosamente',
        data: {
          voucher: {
            id: voucher.id,
            voucherNumber: voucher.voucherNumber,
            amount: voucher.amount,
            paymentDate: voucher.paymentDate,
            status: voucher.status,
            createdAt: voucher.createdAt
          },
          warnings: validation.warnings
        }
      });
    } catch (error: any) {
      console.error('Error creating voucher:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar comprobante'
      });
    }
  }

  // RF-3: Validar comprobante (solo validación sin guardar)
  async validateVoucher(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const {
        creditId,
        voucherNumber,
        amount,
        paymentDate,
        voucherType,
        bankName,
        accountNumber,
        payerName,
        beneficiaryName,
        imageBase64
      } = req.body;

      const data: CreateVoucherDTO = {
        userId,
        creditId,
        voucherNumber,
        amount: parseFloat(amount),
        paymentDate,
        voucherType: voucherType as VoucherType || VoucherType.TRANSFER,
        bankName,
        accountNumber,
        payerName,
        beneficiaryName,
        imageBase64
      };

      const validation = await this.voucherService.validateVoucher(data);

      res.status(200).json({
        success: true,
        data: validation
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al validar comprobante'
      });
    }
  }

  // Obtener comprobantes del usuario autenticado
  async getMyVouchers(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const vouchers = await this.voucherService.getVouchersByUserId(userId);

      res.status(200).json({
        success: true,
        data: vouchers.map(v => ({
          id: v.id,
          creditId: v.creditId,
          voucherNumber: v.voucherNumber,
          amount: v.amount,
          paymentDate: v.paymentDate,
          voucherType: v.voucherType,
          bankName: v.bankName,
          status: v.status,
          validationNotes: v.validationNotes,
          createdAt: v.createdAt
        }))
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener comprobantes'
      });
    }
  }

  // Obtener comprobantes de un crédito específico
  async getVouchersByCreditId(req: Request, res: Response): Promise<void> {
    try {
      const { creditId } = req.params;
      const vouchers = await this.voucherService.getVouchersByCreditId(creditId);

      res.status(200).json({
        success: true,
        data: vouchers.map(v => ({
          id: v.id,
          creditId: v.creditId,
          voucherNumber: v.voucherNumber,
          amount: v.amount,
          paymentDate: v.paymentDate,
          voucherType: v.voucherType,
          bankName: v.bankName,
          payerName: v.payerName,
          status: v.status,
          validationNotes: v.validationNotes,
          createdAt: v.createdAt
        }))
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener comprobantes'
      });
    }
  }

  // Obtener comprobantes pendientes (asistentes/gerentes)
  async getPendingVouchers(req: Request, res: Response): Promise<void> {
    try {
      const vouchers = await this.voucherService.getPendingVouchers();

      res.status(200).json({
        success: true,
        data: vouchers.map(v => ({
          id: v.id,
          userId: v.userId,
          creditId: v.creditId,
          voucherNumber: v.voucherNumber,
          amount: v.amount,
          paymentDate: v.paymentDate,
          voucherType: v.voucherType,
          bankName: v.bankName,
          payerName: v.payerName,
          beneficiaryName: v.beneficiaryName,
          imageUrl: v.imageUrl,
          status: v.status,
          createdAt: v.createdAt
        }))
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener comprobantes pendientes'
      });
    }
  }

  // Obtener todos los comprobantes
  async getAllVouchers(req: Request, res: Response): Promise<void> {
    try {
      const vouchers = await this.voucherService.getAllVouchers();

      res.status(200).json({
        success: true,
        data: vouchers.map(v => ({
          id: v.id,
          userId: v.userId,
          creditId: v.creditId,
          voucherNumber: v.voucherNumber,
          amount: v.amount,
          paymentDate: v.paymentDate,
          voucherType: v.voucherType,
          bankName: v.bankName,
          payerName: v.payerName,
          status: v.status,
          validationNotes: v.validationNotes,
          validatedAt: v.validatedAt,
          createdAt: v.createdAt
        }))
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener comprobantes'
      });
    }
  }

  // Obtener comprobante por ID con imagen
  async getVoucherById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const voucher = await this.voucherService.getVoucherById(id);

      if (!voucher) {
        res.status(404).json({
          success: false,
          message: 'Comprobante no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: voucher
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener comprobante'
      });
    }
  }

  // Aprobar comprobante
  async approveVoucher(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBy = (req as any).userId;
      const { notes } = req.body;

      const voucher = await this.voucherService.approveVoucher(id, validatedBy, notes);

      res.status(200).json({
        success: true,
        message: 'Comprobante aprobado exitosamente',
        data: {
          id: voucher.id,
          status: voucher.status,
          validatedAt: voucher.validatedAt
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al aprobar comprobante'
      });
    }
  }

  // Rechazar comprobante
  async rejectVoucher(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBy = (req as any).userId;
      const { reason } = req.body;

      const voucher = await this.voucherService.rejectVoucher(id, validatedBy, reason);

      res.status(200).json({
        success: true,
        message: 'Comprobante rechazado',
        data: {
          id: voucher.id,
          status: voucher.status,
          validationNotes: voucher.validationNotes,
          validatedAt: voucher.validatedAt
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al rechazar comprobante'
      });
    }
  }

  // Eliminar comprobante
  async deleteVoucher(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.voucherService.deleteVoucher(id);

      res.status(200).json({
        success: true,
        message: 'Comprobante eliminado exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar comprobante'
      });
    }
  }
}
