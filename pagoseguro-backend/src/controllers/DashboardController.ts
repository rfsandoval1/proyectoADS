import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async getManagerMetrics(_: Request, res: Response) {
    try {
      // Obtener todas las métricas necesarias en paralelo
      const [statistics, monthlyData, creditDistribution] = await Promise.all([
        this.dashboardService.getManagerMetrics(),
        this.dashboardService.getMonthlyData(),
        this.dashboardService.getCreditDistribution(),
      ]);

      res.json({
        success: true,
        statistics,
        monthlyData,
        creditDistribution,
      });
    } catch (error) {
      console.error('Error fetching manager metrics:', error);
      res.status(500).json({ success: false, message: 'Error fetching manager metrics', error });
    }
  }

  async getAssistantMetrics(_: Request, res: Response) {
    try {
      const metrics = await this.dashboardService.getAssistantMetrics();
      res.json({ success: true, metrics });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching assistant metrics', error });
    }
  }

  async getMonthlyData(_: Request, res: Response) {
    try {
      const data = await this.dashboardService.getMonthlyData();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching monthly data', error });
    }
  }

  async getCreditDistribution(_: Request, res: Response) {
    try {
      const data = await this.dashboardService.getCreditDistribution();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching credit distribution', error });
    }
  }

  async getTasks(_: Request, res: Response) {
    try {
      const tasks = await this.dashboardService.getTasks();
      res.json({ success: true, data: tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
  }

  async getAlerts(_: Request, res: Response) {
    try {
      const alerts = await this.dashboardService.getAlerts();
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
  }

  async getClients(_: Request, res: Response) {
    try {
      const result = await this.dashboardService.getClients();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching clients:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener clientes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getDelinquentClients(_: Request, res: Response) {
    try {
      const delinquentClients = await this.dashboardService.getDelinquentClients();
      return res.status(200).json({ success: true, data: delinquentClients });
    } catch (error) {
      console.error('Error fetching delinquent clients:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch delinquent clients',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAuditLogs(_: Request, res: Response) {
    try {
      const auditLogs = await this.dashboardService.getAuditLogs();
      return res.status(200).json({ success: true, data: auditLogs });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPaymentsReport(_: Request, res: Response) {
    try {
      const payments = await this.dashboardService.getPaymentsReport();
      return res.status(200).json({ success: true, data: payments });
    } catch (error) {
      console.error('Error fetching payments report:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payments report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
