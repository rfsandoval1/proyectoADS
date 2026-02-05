export interface Payment {
  id: string;
  clientId: string;
  creditId: string;
  amount: number;
  paymentDate: Date;
  dueDate: Date;
  status: 'paid' | 'late' | 'pending';
  paymentMethod: 'cash' | 'transfer' | 'check';
  description: string;
  interestAmount?: number;
  principalAmount: number;
}

export interface Credit {
  id: string;
  clientId: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  status: 'active' | 'completed' | 'defaulted';
  monthlyPayment: number;
  remainingBalance: number;
  description: string;
}

// Datos quemados para historial de pagos
export const mockPayments: Payment[] = [
  {
    id: '1',
    clientId: '3', // María Perez
    creditId: 'CR001',
    amount: 125.50,
    paymentDate: new Date('2024-12-15'),
    dueDate: new Date('2024-12-15'),
    status: 'paid',
    paymentMethod: 'transfer',
    description: 'Pago mensual - Cuota 12/24',
    interestAmount: 25.50,
    principalAmount: 100.00
  },
  {
    id: '2',
    clientId: '3',
    creditId: 'CR001',
    amount: 125.50,
    paymentDate: new Date('2024-11-16'),
    dueDate: new Date('2024-11-15'),
    status: 'late',
    paymentMethod: 'cash',
    description: 'Pago mensual - Cuota 11/24',
    interestAmount: 25.50,
    principalAmount: 100.00
  },
  {
    id: '3',
    clientId: '3',
    creditId: 'CR001',
    amount: 125.50,
    paymentDate: new Date('2024-10-14'),
    dueDate: new Date('2024-10-15'),
    status: 'paid',
    paymentMethod: 'transfer',
    description: 'Pago mensual - Cuota 10/24',
    interestAmount: 25.50,
    principalAmount: 100.00
  },
  {
    id: '4',
    clientId: '3',
    creditId: 'CR002',
    amount: 89.75,
    paymentDate: new Date('2024-12-10'),
    dueDate: new Date('2024-12-10'),
    status: 'paid',
    paymentMethod: 'check',
    description: 'Pago mensual - Cuota 6/12',
    interestAmount: 14.75,
    principalAmount: 75.00
  },
  {
    id: '5',
    clientId: '3',
    creditId: 'CR002',
    amount: 89.75,
    paymentDate: new Date('2024-11-10'),
    dueDate: new Date('2024-11-10'),
    status: 'paid',
    paymentMethod: 'transfer',
    description: 'Pago mensual - Cuota 5/12',
    interestAmount: 14.75,
    principalAmount: 75.00
  }
];

export const mockCredits: Credit[] = [
  {
    id: 'CR001',
    clientId: '3',
    amount: 3000.00,
    interestRate: 12.5,
    termMonths: 24,
    startDate: new Date('2023-01-15'),
    status: 'active',
    monthlyPayment: 125.50,
    remainingBalance: 1200.00,
    description: 'Crédito para capital de trabajo'
  },
  {
    id: 'CR002',
    clientId: '3',
    amount: 1200.00,
    interestRate: 15.0,
    termMonths: 12,
    startDate: new Date('2024-07-10'),
    status: 'active',
    monthlyPayment: 89.75,
    remainingBalance: 650.00,
    description: 'Crédito para emergencia médica'
  }
];

// Datos para estadísticas del gerente
export const mockStatistics = {
  totalClients: 156,
  activeCredits: 89,
  totalPortfolio: 285750.00,
  monthlyCollection: 28950.00,
  delinquencyRate: 8.5,
  averageTicket: 3200.00,
  newClientsThisMonth: 12,
  collectionsThisMonth: 95.2,
  profitThisMonth: 8750.00,
  topPerformingAssistant: 'Yolanda Tipan'
};

export const mockMonthlyData = [
  { month: 'Ene', collections: 25000, disbursements: 45000, clients: 145 },
  { month: 'Feb', collections: 28000, disbursements: 52000, clients: 148 },
  { month: 'Mar', collections: 32000, disbursements: 48000, clients: 152 },
  { month: 'Abr', collections: 29000, disbursements: 55000, clients: 154 },
  { month: 'May', collections: 31000, disbursements: 47000, clients: 155 },
  { month: 'Jun', collections: 28950, disbursements: 51500, clients: 156 }
];

export const mockCreditDistribution = [
  { range: '$500-$1,000', count: 45, amount: 33750 },
  { range: '$1,001-$3,000', count: 32, amount: 64000 },
  { range: '$3,001-$5,000', count: 28, amount: 112000 },
  { range: '$5,001-$10,000', count: 18, amount: 135000 },
  { range: '$10,001+', count: 8, amount: 96000 }
];

export const paymentsService = {
  getClientPayments: (clientId: string): Payment[] => {
    return mockPayments.filter(payment => payment.clientId === clientId);
  },

  getClientCredits: (clientId: string): Credit[] => {
    return mockCredits.filter(credit => credit.clientId === clientId);
  },

  getStatistics: () => mockStatistics,
  
  getMonthlyData: () => mockMonthlyData,
  
  getCreditDistribution: () => mockCreditDistribution
};
