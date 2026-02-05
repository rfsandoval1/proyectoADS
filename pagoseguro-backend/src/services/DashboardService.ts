import { Sequelize, Op } from 'sequelize';
import UserModel from '../models/UserModel';
import CreditModel from '../models/CreditModel';
import PaymentModel from '../models/PaymentModel';
import ContactModel from '../models/ContactModel';
import ReportModel from '../models/ReportModel';
import AuditLog from '../models/AuditLog';

export class DashboardService {
  constructor(private readonly sequelize: Sequelize) {}

  async getManagerMetrics() {
    // Conteos básicos
    const totalClients = await UserModel.count({ where: { role: 'CLIENTE' } });
    const activeCredits = await CreditModel.count({ where: { status: 'ACTIVE' } });
    const overdueCredits = await CreditModel.count({ where: { status: 'OVERDUE' } });

    // Dinero total prestado (portafolio activo)
    const totalLentResult = await CreditModel.sum('amount', { where: { status: 'ACTIVE' } });
    const totalPortfolio = Number(totalLentResult) || 0;

    // Fechas del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Nuevos clientes este mes
    const newClientsThisMonth = await UserModel.count({
      where: {
        role: 'CLIENTE',
        createdAt: { [Op.between]: [firstDayOfMonth, lastDayOfMonth] },
      },
    });

    // Cobranza mensual (pagos PAID este mes)
    const monthlyCollectionResult = await PaymentModel.sum('amount', {
      where: {
        status: 'PAID',
        paidDate: { [Op.between]: [firstDayOfMonth, lastDayOfMonth] },
      },
    });
    const monthlyCollection = Number(monthlyCollectionResult) || 0;

    // Total esperado este mes (todos los pagos creados este mes)
    const expectedMonthlyResult = await PaymentModel.sum('amount', {
      where: {
        createdAt: { [Op.between]: [firstDayOfMonth, lastDayOfMonth] },
      },
    });
    const expectedMonthly = Number(expectedMonthlyResult) || 1;

    // Porcentaje de cobranza este mes
    const collectionsThisMonth = expectedMonthly > 0
      ? Math.round((monthlyCollection / expectedMonthly) * 100)
      : 0;

    // Tasa de morosidad
    const totalActiveAndOverdue = activeCredits + overdueCredits;
    const delinquencyRate = totalActiveAndOverdue > 0
      ? Math.round((overdueCredits / totalActiveAndOverdue) * 100)
      : 0;

    // Ticket promedio
    const avgTicketResult = await CreditModel.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('amount')), 'avgAmount']],
      where: { status: { [Op.in]: ['ACTIVE', 'PAID'] } },
    });
    const averageTicket = Math.round(Number((avgTicketResult as any)?.get('avgAmount')) || 0);

    // Ganancia del mes (estimada)
    const profitThisMonth = Math.round(monthlyCollection * 0.12);

    // Mejor asistente
    const topPerformingAssistant = 'María López';

    return {
      totalClients,
      newClientsThisMonth,
      totalPortfolio,
      monthlyCollection,
      collectionsThisMonth,
      delinquencyRate,
      averageTicket,
      profitThisMonth,
      activeCredits,
      topPerformingAssistant,
    };
  }

  async getAssistantMetrics() {
    const overdueCredits = await CreditModel.count({ where: { status: 'OVERDUE' } });

    // Contactos pendientes = llamadas urgentes (clientes morosos + pagos pendientes antiguos)
    let pendingContacts = 0;
    try {
      // Contar clientes con créditos OVERDUE
      const [overdueClientsResult] = await this.sequelize.query(
        `SELECT COUNT(DISTINCT u.id) AS count
         FROM users u
         JOIN "Credit" c ON c."userId" = u.id
         WHERE c.status = 'OVERDUE'`
      );
      const overdueClients = Number((overdueClientsResult as any[])[0]?.count) || 0;

      // Contar clientes con pagos PENDING antiguos (más de 7 días)
      const [pendingPaymentsResult] = await this.sequelize.query(
        `SELECT COUNT(DISTINCT u.id) AS count
         FROM users u
         JOIN "Payment" p ON p."userId" = u.id
         WHERE p.status = 'PENDING'
         AND p."createdAt" < NOW() - INTERVAL '7 days'`
      );
      const pendingPaymentClients = Number((pendingPaymentsResult as any[])[0]?.count) || 0;

      // Total de contactos urgentes (sin duplicar clientes)
      const [totalUrgentResult] = await this.sequelize.query(
        `SELECT COUNT(DISTINCT u.id) AS count
         FROM users u
         LEFT JOIN "Credit" c ON c."userId" = u.id AND c.status = 'OVERDUE'
         LEFT JOIN "Payment" p ON p."userId" = u.id AND p.status = 'PENDING' AND p."createdAt" < NOW() - INTERVAL '7 days'
         WHERE c.id IS NOT NULL OR p.id IS NOT NULL`
      );
      pendingContacts = Number((totalUrgentResult as any[])[0]?.count) || 0;

      // Si no hay datos en las consultas anteriores, usar la suma simple
      if (pendingContacts === 0) {
        pendingContacts = overdueClients + pendingPaymentClients;
      }
    } catch (e) {
      console.error('Error counting pending contacts:', e);
      // Fallback: usar el conteo de créditos en mora
      pendingContacts = overdueCredits;
    }

    let reportsGenerated = 0;
    try {
      reportsGenerated = await ReportModel.count({});
    } catch (e) {}

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const clientsToday = await UserModel.count({
      where: {
        role: 'CLIENTE',
        lastLogin: { [Op.between]: [startOfDay, endOfDay] },
      },
    });

    return {
      overduePayments: overdueCredits,
      pendingContacts,
      reportsGenerated,
      clientsToday,
    };
  }

  async getMonthlyData() {
    // Obtener cobranzas mensuales (pagos PAID)
    const [paymentResults] = await this.sequelize.query(
      `SELECT
        TO_CHAR(paid_date, 'Month') AS month,
        EXTRACT(MONTH FROM paid_date) AS month_num,
        COALESCE(SUM(amount), 0) AS collections
      FROM "Payment"
      WHERE status = 'PAID' AND paid_date IS NOT NULL
      GROUP BY TO_CHAR(paid_date, 'Month'), EXTRACT(MONTH FROM paid_date)
      ORDER BY month_num`
    );

    // Obtener desembolsos mensuales (créditos creados)
    const [creditResults] = await this.sequelize.query(
      `SELECT
        TO_CHAR("createdAt", 'Month') AS month,
        EXTRACT(MONTH FROM "createdAt") AS month_num,
        COALESCE(SUM(amount), 0) AS disbursements
      FROM "Credit"
      WHERE status IN ('ACTIVE', 'PAID', 'OVERDUE')
      GROUP BY TO_CHAR("createdAt", 'Month'), EXTRACT(MONTH FROM "createdAt")
      ORDER BY month_num`
    );

    // Combinar datos de pagos y créditos
    const monthlyMap = new Map<string, { month: string; collections: number; disbursements: number }>();

    (paymentResults as any[]).forEach((row: any) => {
      const key = row.month.trim();
      monthlyMap.set(key, {
        month: key,
        collections: Number(row.collections),
        disbursements: 0,
      });
    });

    (creditResults as any[]).forEach((row: any) => {
      const key = row.month.trim();
      const existing = monthlyMap.get(key);
      if (existing) {
        existing.disbursements = Number(row.disbursements);
      } else {
        monthlyMap.set(key, {
          month: key,
          collections: 0,
          disbursements: Number(row.disbursements),
        });
      }
    });

    return Array.from(monthlyMap.values());
  }

  async getCreditDistribution() {
    const [results] = await this.sequelize.query(
      `SELECT range, COUNT(id)::int AS count, COALESCE(SUM(amount), 0) AS amount
       FROM "Credit"
       WHERE range IS NOT NULL
       GROUP BY range`
    );

    return (results as any[]).map((row: any) => ({
      range: row.range,
      count: row.count,
      amount: Number(row.amount),
    }));
  }

  async getClients() {
    try {
      const clients = await UserModel.findAll({
        where: { role: 'CLIENTE' },
        order: [['createdAt', 'DESC']],
      });

      const formattedClients = await Promise.all(
        clients.map(async (client: any) => {
          const totalCredits = await CreditModel.count({ where: { userId: client.id } });
          const activeCredits = await CreditModel.count({
            where: { userId: client.id, status: 'ACTIVE' },
          });
          const totalPayments = await PaymentModel.count({ where: { userId: client.id } });
          const lastPayment = await PaymentModel.findOne({
            where: { userId: client.id },
            order: [['createdAt', 'DESC']],
          }) as any;

          return {
            id: client.id,
            name: client.get('fullName'),
            cedula: client.get('cedula'),
            email: client.get('email'),
            phone: client.get('telefono'),
            address: client.get('direccion'),
            status: client.get('status') === 'ACTIVE' ? 'active' : 'inactive',
            registrationDate: (client.get('createdAt') as Date).toISOString().split('T')[0],
            totalCredits,
            activeCredits,
            totalPayments,
            lastPaymentDate: lastPayment
              ? (lastPayment.get('createdAt') as Date).toISOString().split('T')[0]
              : 'N/A',
          };
        })
      );

      return { success: true, data: formattedClients };
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw new Error('Failed to fetch clients');
    }
  }

  async getTasks() {
    try {
      // Obtener clientes con créditos en mora para generar tareas de seguimiento
      const [overdueResults] = await this.sequelize.query(
        `SELECT u.id, u.full_name AS "fullName", u.telefono, u.direccion,
                c.id AS "creditId", c.amount,
                EXTRACT(EPOCH FROM (NOW() - c."createdAt")) / 86400 AS "daysOverdue"
         FROM users u
         JOIN "Credit" c ON c."userId" = u.id
         WHERE c.status = 'OVERDUE'
         ORDER BY c."createdAt" ASC
         LIMIT 10`
      );

      // Obtener pagos pendientes próximos a vencer
      const [pendingPayments] = await this.sequelize.query(
        `SELECT p.id, p.amount, p."userId", u.full_name AS "fullName", u.telefono, u.direccion
         FROM "Payment" p
         JOIN users u ON u.id = p."userId"
         WHERE p.status = 'PENDING'
         ORDER BY p."createdAt" ASC
         LIMIT 5`
      );

      const tasks: any[] = [];
      let taskId = 1;

      // Tareas para clientes morosos
      (overdueResults as any[]).forEach((row: any) => {
        const daysOverdue = Math.floor(row.daysOverdue || 0);
        tasks.push({
          id: taskId++,
          title: `Llamar a cliente moroso: ${row.fullName}`,
          description: `Crédito de $${Number(row.amount).toLocaleString()} - ${daysOverdue} días en mora`,
          priority: daysOverdue > 90 ? 'Urgente' : 'Normal',
          phone: row.telefono || 'No disponible',
          address: row.direccion || 'No disponible',
          status: 'pending'
        });
      });

      // Tareas para pagos pendientes
      (pendingPayments as any[]).forEach((row: any) => {
        tasks.push({
          id: taskId++,
          title: `Contactar para cobro: ${row.fullName}`,
          description: `Pago pendiente de $${Number(row.amount).toLocaleString()}`,
          priority: 'Normal',
          phone: row.telefono || 'No disponible',
          address: row.direccion || 'No disponible',
          status: 'pending'
        });
      });

      // Si no hay tareas, mostrar tarea de sistema
      if (tasks.length === 0) {
        tasks.push({
          id: 1,
          title: 'Sin tareas pendientes',
          description: 'No hay clientes morosos ni pagos pendientes por gestionar',
          priority: 'Info',
          phone: '-',
          address: '-',
          status: 'completed'
        });
      }

      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [{
        id: 1,
        title: 'Error al cargar tareas',
        description: 'No se pudieron cargar las tareas pendientes',
        priority: 'Normal',
        phone: '-',
        address: '-',
        status: 'pending'
      }];
    }
  }

  async getAlerts() {
    const overdueCount = await CreditModel.count({ where: { status: 'OVERDUE' } });
    const pendingPayments = await PaymentModel.count({ where: { status: 'PENDING' } });
    const alerts: any[] = [];

    // Alertas críticas (más de 5 créditos vencidos)
    if (overdueCount > 5) {
      alerts.push({
        id: 1,
        name: 'Mora Crítica',
        details: `${overdueCount} créditos en estado OVERDUE requieren atención inmediata`,
        severity: 'Crítico',
      });
    } else if (overdueCount > 0) {
      alerts.push({
        id: 2,
        name: 'Créditos Vencidos',
        details: `${overdueCount} crédito(s) en mora pendiente(s) de gestión`,
        severity: 'Alto',
      });
    }

    // Alertas de pagos pendientes
    if (pendingPayments > 10) {
      alerts.push({
        id: 3,
        name: 'Pagos Pendientes',
        details: `${pendingPayments} cuotas pendientes de cobro`,
        severity: 'Alto',
      });
    }

    // Si no hay alertas, mostrar mensaje informativo
    if (alerts.length === 0) {
      alerts.push({
        id: 4,
        name: 'Sistema Estable',
        details: 'No hay alertas críticas en este momento',
        severity: 'Info',
      });
    }

    return alerts;
  }

  async getDelinquentClients() {
    try {
      const [results] = await this.sequelize.query(
        `SELECT u.id, u.full_name AS "fullName", u.cedula, u.email, u.telefono, u.direccion,
                COALESCE(SUM(c.amount), 0) AS "overdueAmount",
                COUNT(c.id)::int AS "overdueInvoices",
                MAX(EXTRACT(EPOCH FROM (NOW() - c."createdAt")) / 86400)::int AS "daysOverdue"
         FROM users u
         JOIN "Credit" c ON c."userId" = u.id
         WHERE c.status = 'OVERDUE'
         GROUP BY u.id, u.full_name, u.cedula, u.email, u.telefono, u.direccion`
      );

      return (results as any[]).map((row: any) => ({
        id: row.id,
        name: row.fullName,
        cedula: row.cedula,
        email: row.email,
        phone: row.telefono,
        address: row.direccion,
        city: row.direccion || 'N/A',
        overdueAmount: Number(row.overdueAmount),
        overdueInvoices: row.overdueInvoices,
        daysOverdue: Math.max(row.daysOverdue || 0, 0),
        lastPaymentDate: 'N/A',
      }));
    } catch (error) {
      console.error('Error fetching delinquent clients:', error);
      throw new Error('Failed to fetch delinquent clients');
    }
  }

  async getAuditLogs() {
    try {
      const logs = await AuditLog.findAll({
        order: [['createdAt', 'DESC']],
        limit: 100,
      });

      // Obtener los usuarios para mapear los nombres
      const userIds = [...new Set(logs.map((log: any) => log.get('userId')))];
      const users = await UserModel.findAll({
        where: { id: { [Op.in]: userIds } },
      });
      const userMap = new Map(users.map((u: any) => [u.id, u.get('fullName')]));

      return logs.map((log: any) => ({
        id: log.get('id'),
        userId: log.get('userId'),
        userName: userMap.get(log.get('userId')) || 'Usuario desconocido',
        action: log.get('action'),
        module: log.get('module'),
        timestamp: log.get('createdAt')
          ? new Date(log.get('createdAt') as Date).toISOString().replace('T', ' ').slice(0, 19)
          : '',
        ipAddress: log.get('ipAddress') || '0.0.0.0',
        details: typeof log.get('details') === 'object'
          ? JSON.stringify(log.get('details'))
          : log.get('details') || '',
        status: log.get('status')?.toLowerCase() === 'success' ? 'success' :
                log.get('status')?.toLowerCase() === 'error' ? 'error' : 'warning',
      }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  async getPaymentsReport() {
    try {
      const payments = await PaymentModel.findAll({
        order: [['createdAt', 'DESC']],
      });

      // Obtener los usuarios y créditos
      const userIds = [...new Set(payments.map((p: any) => p.get('userId')))];
      const users = await UserModel.findAll({
        where: { id: { [Op.in]: userIds } },
      });
      const userMap = new Map(users.map((u: any) => [u.id, {
        name: u.get('fullName'),
        cedula: u.get('cedula'),
      }]));

      const creditIds = [...new Set(payments.map((p: any) => p.get('creditId')))];
      const credits = await CreditModel.findAll({
        where: { id: { [Op.in]: creditIds } },
      });
      const creditMap = new Map(credits.map((c: any) => [c.id, {
        term: c.get('term'),
        interestRate: c.get('interestRate'),
      }]));

      return payments.map((payment: any, index: number) => {
        const user = userMap.get(payment.get('userId'));
        const credit = creditMap.get(payment.get('creditId'));

        return {
          id: payment.get('id'),
          invoiceNumber: `INV-${String(index + 1).padStart(3, '0')}`,
          clientName: user?.name || 'Cliente no encontrado',
          clientId: payment.get('userId'),
          cedula: user?.cedula || '',
          date: payment.get('paidDate')
            ? new Date(payment.get('paidDate') as Date).toISOString().split('T')[0]
            : new Date(payment.get('createdAt') as Date).toISOString().split('T')[0],
          amount: Number(payment.get('amount')),
          method: payment.get('paymentMethod') || 'No especificado',
          status: payment.get('status')?.toLowerCase() || 'pending',
          plazoMeses: credit?.term || 12,
          interesMora: credit?.interestRate || 12,
        };
      });
    } catch (error) {
      console.error('Error fetching payments report:', error);
      throw new Error('Failed to fetch payments report');
    }
  }
}
