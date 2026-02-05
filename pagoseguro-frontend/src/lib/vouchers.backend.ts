const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface CreateVoucherData {
  creditId: string;
  voucherNumber: string;
  amount: number;
  paymentDate: string;
  voucherType: 'transfer' | 'deposit' | 'cash' | 'check' | 'other';
  bankName?: string;
  accountNumber?: string;
  payerName?: string;
  beneficiaryName?: string;
  imageBase64: string;
}

export interface Voucher {
  id: string;
  creditId: string;
  voucherNumber: string;
  amount: number;
  paymentDate: string;
  voucherType: string;
  bankName?: string;
  payerName?: string;
  status: 'pending' | 'validated' | 'rejected' | 'duplicate';
  validationNotes?: string;
  createdAt: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  duplicateVoucherId?: string;
}

export const voucherService = {
  // Crear comprobante
  async createVoucher(token: string, data: CreateVoucherData): Promise<{ voucher: Voucher; warnings: string[] }> {
    const response = await fetch(`${API_URL}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al registrar comprobante');
    }

    return result.data;
  },

  // Validar comprobante sin guardar
  async validateVoucher(token: string, data: CreateVoucherData): Promise<ValidationResult> {
    const response = await fetch(`${API_URL}/vouchers/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al validar comprobante');
    }

    return result.data;
  },

  // Obtener mis comprobantes
  async getMyVouchers(token: string): Promise<Voucher[]> {
    const response = await fetch(`${API_URL}/vouchers/my`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener comprobantes');
    }

    return result.data || [];
  },

  // Obtener comprobantes de un crédito
  async getVouchersByCreditId(token: string, creditId: string): Promise<Voucher[]> {
    const response = await fetch(`${API_URL}/vouchers/credit/${creditId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener comprobantes');
    }

    return result.data || [];
  },

  // Obtener comprobantes pendientes (para asistentes/gerentes)
  async getPendingVouchers(token: string): Promise<Voucher[]> {
    const response = await fetch(`${API_URL}/vouchers/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener comprobantes pendientes');
    }

    return result.data || [];
  },

  // Obtener todos los comprobantes
  async getAllVouchers(token: string): Promise<Voucher[]> {
    const response = await fetch(`${API_URL}/vouchers`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener comprobantes');
    }

    return result.data || [];
  },

  // Obtener comprobante por ID
  async getVoucherById(token: string, id: string): Promise<Voucher> {
    const response = await fetch(`${API_URL}/vouchers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener comprobante');
    }

    return result.data;
  },

  // Aprobar comprobante
  async approveVoucher(token: string, id: string, notes?: string): Promise<void> {
    const response = await fetch(`${API_URL}/vouchers/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notes })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al aprobar comprobante');
    }
  },

  // Rechazar comprobante
  async rejectVoucher(token: string, id: string, reason: string): Promise<void> {
    const response = await fetch(`${API_URL}/vouchers/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al rechazar comprobante');
    }
  },

  // Eliminar comprobante
  async deleteVoucher(token: string, id: string): Promise<void> {
    const response = await fetch(`${API_URL}/vouchers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al eliminar comprobante');
    }
  }
};
