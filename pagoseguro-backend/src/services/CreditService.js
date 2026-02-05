"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditService = void 0;
const Credit_1 = require("../models/Credit");
class CreditService {
    constructor(creditRepository) {
        this.creditRepository = creditRepository;
    }
    async getCreditsByUserId(userId) {
        return this.creditRepository.findByUserId(userId);
    }
    async listCredits() {
        return this.creditRepository.findAll();
    }
    async getCreditById(id) {
        return this.creditRepository.findById(id);
    }
    async createCredit(data) {
        const credit = new Credit_1.Credit(crypto.randomUUID(), data.userId, data.amount, Credit_1.CreditStatus.ACTIVE, new Date(), new Date(), data.term || 12, data.interestRate || 12, data.description || '');
        await this.creditRepository.save(credit);
        return credit;
    }
    async updateCredit(id, data) {
        const credit = await this.creditRepository.findById(id);
        if (!credit)
            throw new Error('Crédito no encontrado');
        if (data.amount !== undefined)
            credit.amount = data.amount;
        if (data.status !== undefined)
            credit.status = data.status;
        credit.updatedAt = new Date();
        await this.creditRepository.update(credit);
        return credit;
    }
    async deleteCredit(id) {
        await this.creditRepository.delete(id);
    }
}
exports.CreditService = CreditService;
