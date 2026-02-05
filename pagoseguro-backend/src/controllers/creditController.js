"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditController = void 0;
class CreditController {
    constructor(creditService) {
        this.creditService = creditService;
    }
    async listCredits(req, res) {
        const user = req.user;
        let credits;
        if (user.role === 'GERENTE') {
            credits = await this.creditService.listCredits();
        }
        else if (user.role === 'ASISTENTE') {
            credits = await this.creditService.listCredits(); // O filtrar por clientes asignados si aplica
        }
        else {
            credits = await this.creditService.getCreditsByUserId(user.userId);
        }
        res.json({ success: true, credits });
    }
    async createCredit(req, res) {
        const user = req.user;
        if (user.role !== 'GERENTE' && user.role !== 'ASISTENTE') {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }
        const { userId, clientId, amount, term, interestRate, observations } = req.body;
        const targetUserId = userId || clientId;
        if (!targetUserId || !amount) {
            return res.status(400).json({ success: false, message: 'Datos incompletos' });
        }
        const credit = await this.creditService.createCredit({
            userId: targetUserId,
            amount: parseFloat(amount),
            term: term ? parseInt(term) : undefined,
            interestRate: interestRate ? parseFloat(interestRate) : undefined,
            description: observations || ''
        });
        const monthlyPayment = Math.round((credit.amount / credit.term) * 100) / 100;
        res.status(201).json({
            success: true,
            credit: {
                id: credit.id,
                userId: credit.userId,
                amount: credit.amount,
                status: credit.status,
                term: credit.term,
                interestRate: credit.interestRate,
                description: credit.description,
                monthlyPayment,
                remainingBalance: credit.amount,
                createdAt: credit.createdAt
            }
        });
    }
    async updateCredit(req, res) {
        const user = req.user;
        const creditId = req.params.id;
        const credit = await this.creditService.getCreditById(creditId);
        if (!credit)
            return res.status(404).json({ success: false, message: 'Crédito no encontrado' });
        if (user.role === 'CLIENTE' && credit.userId !== user.userId) {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }
        // Solo gerente/asistente pueden cambiar status, cliente solo amount si aplica
        const data = req.body;
        if (user.role === 'CLIENTE' && data.status) {
            return res.status(403).json({ success: false, message: 'No puede cambiar el estado' });
        }
        const updated = await this.creditService.updateCredit(creditId, data);
        res.json({ success: true, credit: updated });
    }
    async deleteCredit(req, res) {
        const user = req.user;
        if (user.role !== 'GERENTE') {
            return res.status(403).json({ success: false, message: 'Solo gerente puede eliminar créditos' });
        }
        const creditId = req.params.id;
        await this.creditService.deleteCredit(creditId);
        res.json({ success: true });
    }
    // Créditos del usuario autenticado
    async getMyCredits(req, res) {
        const user = req.user;
        const credits = await this.creditService.getCreditsByUserId(user.userId);
        res.json({ success: true, credits });
    }
}
exports.CreditController = CreditController;
