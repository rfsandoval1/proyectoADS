"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const Payment_1 = require("../models/Payment");
class PaymentService {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    async getPaymentsByUserId(userId) {
        return this.paymentRepository.findByUserId(userId);
    }
    async listPayments() {
        return this.paymentRepository.findAll();
    }
    async getPaymentById(id) {
        return this.paymentRepository.findById(id);
    }
    async createPayment(data) {
        const now = new Date();
        const isPaid = !!data.paymentMethod;
        const payment = new Payment_1.Payment(crypto.randomUUID(), data.creditId, data.userId, data.amount, isPaid ? Payment_1.PaymentStatus.PAID : Payment_1.PaymentStatus.PENDING, now, now, data.paymentMethod, isPaid ? now : undefined);
        await this.paymentRepository.save(payment);
        return payment;
    }
    async updatePayment(id, data) {
        const payment = await this.paymentRepository.findById(id);
        if (!payment)
            throw new Error('Pago no encontrado');
        if (data.amount !== undefined)
            payment.amount = data.amount;
        if (data.status !== undefined)
            payment.status = data.status;
        payment.updatedAt = new Date();
        await this.paymentRepository.update(payment);
        return payment;
    }
    async deletePayment(id) {
        await this.paymentRepository.delete(id);
    }
    async getRecentPaymentsByClientId(clientId) {
        return this.paymentRepository.findRecentByClientId(clientId);
    }
}
exports.PaymentService = PaymentService;
