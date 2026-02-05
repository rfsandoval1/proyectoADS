"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const sequelize_1 = require("sequelize");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const CreditModel_1 = __importDefault(require("../models/CreditModel"));
const PaymentModel_1 = __importDefault(require("../models/PaymentModel"));
const ContactModel_1 = __importDefault(require("../models/ContactModel"));
const ReportModel_1 = __importDefault(require("../models/ReportModel"));
class DashboardService {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async getManagerMetrics() {
        const totalClients = await UserModel_1.default.count({ where: { role: 'CLIENTE' } });
        const activeCredits = await CreditModel_1.default.count({ where: { status: 'ACTIVE' } });
        const totalLentResult = await CreditModel_1.default.sum('amount');
        const totalLent = totalLentResult || 0;
        const overdueCredits = await CreditModel_1.default.count({ where: { status: 'OVERDUE' } });
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthlyRevenueResult = await PaymentModel_1.default.sum('amount', {
            where: {
                status: 'COMPLETED',
                createdAt: { [sequelize_1.Op.between]: [firstDay, lastDay] },
            },
        });
        const monthlyRevenue = monthlyRevenueResult || 0;
        const pendingPayments = await PaymentModel_1.default.count({ where: { status: 'PENDING' } });
        return {
            totalClients,
            activeCredits,
            totalLent: Number(totalLent),
            overduePayments: overdueCredits,
            monthlyRevenue: Number(monthlyRevenue),
            pendingPayments,
        };
    }
    async getAssistantMetrics() {
        const overdueCredits = await CreditModel_1.default.count({ where: { status: 'OVERDUE' } });
        let pendingContacts = 0;
        try {
            pendingContacts = await ContactModel_1.default.count({ where: { status: 'pending' } });
        }
        catch (e) { }
        let reportsGenerated = 0;
        try {
            reportsGenerated = await ReportModel_1.default.count({});
        }
        catch (e) { }
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const clientsToday = await UserModel_1.default.count({
            where: {
                role: 'CLIENTE',
                lastLogin: { [sequelize_1.Op.between]: [startOfDay, endOfDay] },
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
        const [results] = await this.sequelize.query(`SELECT
        TO_CHAR("createdAt", 'Month') AS month,
        EXTRACT(MONTH FROM "createdAt") AS month_num,
        COALESCE(SUM(amount), 0) AS collections
      FROM "Payment"
      WHERE status = 'COMPLETED'
      GROUP BY TO_CHAR("createdAt", 'Month'), EXTRACT(MONTH FROM "createdAt")
      ORDER BY month_num`);
        return results.map((row) => ({
            month: row.month.trim(),
            collections: Number(row.collections),
            disbursements: 0,
        }));
    }
    async getCreditDistribution() {
        const [results] = await this.sequelize.query(`SELECT range, COUNT(id)::int AS count, COALESCE(SUM(amount), 0) AS amount
       FROM "Credit"
       WHERE range IS NOT NULL
       GROUP BY range`);
        return results.map((row) => ({
            range: row.range,
            count: row.count,
            amount: Number(row.amount),
        }));
    }
    async getClients() {
        try {
            const clients = await UserModel_1.default.findAll({
                where: { role: 'CLIENTE' },
                order: [['createdAt', 'DESC']],
            });
            const formattedClients = await Promise.all(clients.map(async (client) => {
                const totalCredits = await CreditModel_1.default.count({ where: { userId: client.id } });
                const activeCredits = await CreditModel_1.default.count({
                    where: { userId: client.id, status: 'ACTIVE' },
                });
                const totalPayments = await PaymentModel_1.default.count({ where: { userId: client.id } });
                const lastPayment = await PaymentModel_1.default.findOne({
                    where: { userId: client.id },
                    order: [['createdAt', 'DESC']],
                });
                return {
                    id: client.id,
                    name: client.get('fullName'),
                    cedula: client.get('cedula'),
                    email: client.get('email'),
                    phone: client.get('telefono'),
                    address: client.get('direccion'),
                    status: client.get('status') === 'ACTIVE' ? 'active' : 'inactive',
                    registrationDate: client.get('createdAt').toISOString().split('T')[0],
                    totalCredits,
                    activeCredits,
                    totalPayments,
                    lastPaymentDate: lastPayment
                        ? lastPayment.get('createdAt').toISOString().split('T')[0]
                        : 'N/A',
                };
            }));
            return { success: true, data: formattedClients };
        }
        catch (error) {
            console.error('Error fetching clients:', error);
            throw new Error('Failed to fetch clients');
        }
    }
    async getTasks() {
        return [
            { id: 1, title: 'Revisar solicitudes pendientes', status: 'pending' },
            { id: 2, title: 'Actualizar reportes mensuales', status: 'completed' },
        ];
    }
    async getAlerts() {
        const overdueCount = await CreditModel_1.default.count({ where: { status: 'OVERDUE' } });
        const alerts = [];
        if (overdueCount > 0) {
            alerts.push({ id: 1, message: `${overdueCount} crédito(s) vencido(s)`, type: 'warning' });
        }
        alerts.push({ id: 2, message: 'Sistema operando con normalidad', type: 'info' });
        return alerts;
    }
    async getDelinquentClients() {
        try {
            const [results] = await this.sequelize.query(`SELECT u.id, u.full_name AS "fullName", u.cedula, u.email, u.telefono, u.direccion,
                COALESCE(SUM(c.amount), 0) AS "overdueAmount",
                COUNT(c.id)::int AS "overdueInvoices",
                MAX(EXTRACT(EPOCH FROM (NOW() - c."createdAt")) / 86400)::int AS "daysOverdue"
         FROM users u
         JOIN "Credit" c ON c."userId" = u.id
         WHERE c.status = 'OVERDUE'
         GROUP BY u.id, u.full_name, u.cedula, u.email, u.telefono, u.direccion`);
            return results.map((row) => ({
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
        }
        catch (error) {
            console.error('Error fetching delinquent clients:', error);
            throw new Error('Failed to fetch delinquent clients');
        }
    }
}
exports.DashboardService = DashboardService;
