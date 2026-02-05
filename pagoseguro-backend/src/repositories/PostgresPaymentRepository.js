"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresPaymentRepository = void 0;
const Payment_1 = require("../models/Payment");
const PaymentModel_1 = __importDefault(require("../models/PaymentModel"));
class PostgresPaymentRepository {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
    }
    async save(payment) {
        await PaymentModel_1.default.create({
            id: payment.id,
            creditId: payment.creditId,
            userId: payment.userId,
            amount: payment.amount,
            status: payment.status,
            month: this.getMonthString(payment.createdAt),
            paymentMethod: payment.paymentMethod || null,
            paidDate: payment.paidDate || null,
        });
    }
    async findById(id) {
        const row = await PaymentModel_1.default.findByPk(id);
        if (!row)
            return null;
        return this.toEntity(row);
    }
    async findByCreditId(creditId) {
        const rows = await PaymentModel_1.default.findAll({ where: { creditId } });
        return rows.map((r) => this.toEntity(r));
    }
    async findByUserId(userId) {
        const rows = await PaymentModel_1.default.findAll({ where: { userId } });
        return rows.map((r) => this.toEntity(r));
    }
    async findAll() {
        const rows = await PaymentModel_1.default.findAll();
        return rows.map((r) => this.toEntity(r));
    }
    async update(payment) {
        await PaymentModel_1.default.update({
            amount: payment.amount,
            status: payment.status,
        }, { where: { id: payment.id } });
    }
    async delete(id) {
        await PaymentModel_1.default.destroy({ where: { id } });
    }
    async findRecentByClientId(clientId) {
        const rows = await PaymentModel_1.default.findAll({
            where: { userId: clientId },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });
        return rows.map((r) => this.toEntity(r));
    }
    async findRecentByUserId(userId) {
        const rows = await PaymentModel_1.default.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });
        return rows.map((r) => this.toEntity(r));
    }
    toEntity(row) {
        return new Payment_1.Payment(row.get('id'), row.get('creditId'), row.get('userId'), Number(row.get('amount')), row.get('status'), row.get('createdAt'), row.get('updatedAt'), row.get('paymentMethod'), row.get('paidDate'));
    }
    getMonthString(date) {
        return date.toLocaleString('default', { month: 'long' });
    }
}
exports.PostgresPaymentRepository = PostgresPaymentRepository;
