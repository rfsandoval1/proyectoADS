"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresCreditRepository = void 0;
const Credit_1 = require("../models/Credit");
const CreditModel_1 = __importDefault(require("../models/CreditModel"));
class PostgresCreditRepository {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
    }
    async save(credit) {
        await CreditModel_1.default.create({
            id: credit.id,
            userId: credit.userId,
            amount: credit.amount,
            status: credit.status,
            range: this.calculateRange(credit.amount),
        });
    }
    async findById(id) {
        const data = await CreditModel_1.default.findByPk(id);
        if (!data)
            return null;
        return new Credit_1.Credit(data.get('id'), data.get('userId'), Number(data.get('amount')), data.get('status'), data.get('createdAt'), data.get('updatedAt'));
    }
    async findByUserId(userId) {
        const credits = await CreditModel_1.default.findAll({ where: { userId } });
        return credits.map((c) => new Credit_1.Credit(c.get('id'), c.get('userId'), Number(c.get('amount')), c.get('status'), c.get('createdAt'), c.get('updatedAt')));
    }
    async findAll() {
        const credits = await CreditModel_1.default.findAll();
        return credits.map((c) => new Credit_1.Credit(c.get('id'), c.get('userId'), Number(c.get('amount')), c.get('status'), c.get('createdAt'), c.get('updatedAt')));
    }
    async update(credit) {
        await CreditModel_1.default.update({
            amount: credit.amount,
            status: credit.status,
            range: this.calculateRange(credit.amount),
        }, { where: { id: credit.id } });
    }
    async delete(id) {
        await CreditModel_1.default.destroy({ where: { id } });
    }
    calculateRange(amount) {
        if (amount < 1000)
            return '0-1000';
        if (amount < 5000)
            return '1000-5000';
        if (amount < 10000)
            return '5000-10000';
        if (amount < 50000)
            return '10000-50000';
        return '50000+';
    }
}
exports.PostgresCreditRepository = PostgresCreditRepository;
