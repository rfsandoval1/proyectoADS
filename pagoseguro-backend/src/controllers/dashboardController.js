"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getManagerMetrics(_, res) {
        try {
            const metrics = await this.dashboardService.getManagerMetrics();
            res.json({ success: true, metrics });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching manager metrics', error });
        }
    }
    async getAssistantMetrics(_, res) {
        try {
            const metrics = await this.dashboardService.getAssistantMetrics();
            res.json({ success: true, metrics });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching assistant metrics', error });
        }
    }
    async getMonthlyData(_, res) {
        try {
            const data = await this.dashboardService.getMonthlyData();
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching monthly data', error });
        }
    }
    async getCreditDistribution(_, res) {
        try {
            const data = await this.dashboardService.getCreditDistribution();
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching credit distribution', error });
        }
    }
    async getTasks(_, res) {
        try {
            const tasks = await this.dashboardService.getTasks();
            res.json({ success: true, data: tasks });
        }
        catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
        }
    }
    async getAlerts(_, res) {
        try {
            const alerts = await this.dashboardService.getAlerts();
            res.json({ success: true, data: alerts });
        }
        catch (error) {
            console.error('Error fetching alerts:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
        }
    }
    async getClients(_, res) {
        try {
            const result = await this.dashboardService.getClients();
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error fetching clients:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener clientes',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getDelinquentClients(_, res) {
        try {
            const delinquentClients = await this.dashboardService.getDelinquentClients();
            return res.status(200).json({ success: true, data: delinquentClients });
        }
        catch (error) {
            console.error('Error fetching delinquent clients:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch delinquent clients',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.DashboardController = DashboardController;
