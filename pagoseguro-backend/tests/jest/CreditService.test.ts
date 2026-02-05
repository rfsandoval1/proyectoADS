import { beforeEach, describe, it, expect, jest } from "@jest/globals";
import { CreditService } from "../../src/services/CreditService";
import { ICreditRepository } from "../../src/lib/interfaces/creditRepository";
import { Credit, CreditStatus } from "../../src/models/Credit";

describe("CreditService", () => {
  let creditService: CreditService;
  let mockCreditRepository: jest.Mocked<ICreditRepository>;

  beforeEach(() => {
    mockCreditRepository = {
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    creditService = new CreditService(mockCreditRepository);
  });

  describe("getCreditsByUserId", () => {
    it("should fetch credits by user ID", async () => {
      const mockCredits: Credit[] = [
        new Credit(
          "1",
          "user1",
          1000,
          CreditStatus.ACTIVE,
          new Date(),
          new Date(),
          12,
          12,
          "Test credit"
        ),
      ];
      mockCreditRepository.findByUserId.mockResolvedValue(mockCredits);

      const result = await creditService.getCreditsByUserId("user1");

      expect(mockCreditRepository.findByUserId).toHaveBeenCalledWith("user1");
      expect(result).toEqual(mockCredits);
    });

    it("should return empty array when user has no credits", async () => {
      mockCreditRepository.findByUserId.mockResolvedValue([]);

      const result = await creditService.getCreditsByUserId("user1");

      expect(result).toEqual([]);
    });
  });

  describe("listCredits", () => {
    it("should return all credits", async () => {
      const mockCredits: Credit[] = [
        new Credit("1", "user1", 1000, CreditStatus.ACTIVE, new Date(), new Date(), 12, 12, ""),
        new Credit("2", "user2", 2000, CreditStatus.PAID, new Date(), new Date(), 24, 15, ""),
      ];
      mockCreditRepository.findAll.mockResolvedValue(mockCredits);

      const result = await creditService.listCredits();

      expect(mockCreditRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe("getCreditById", () => {
    it("should return credit when found", async () => {
      const mockCredit = new Credit(
        "1",
        "user1",
        1000,
        CreditStatus.ACTIVE,
        new Date(),
        new Date(),
        12,
        12,
        "Test"
      );
      mockCreditRepository.findById.mockResolvedValue(mockCredit);

      const result = await creditService.getCreditById("1");

      expect(mockCreditRepository.findById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockCredit);
    });

    it("should return null when credit not found", async () => {
      mockCreditRepository.findById.mockResolvedValue(null);

      const result = await creditService.getCreditById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("createCredit", () => {
    it("should create a new credit with default values", async () => {
      mockCreditRepository.save.mockResolvedValue();

      const result = await creditService.createCredit({
        userId: "user1",
        amount: 1000,
      });

      expect(mockCreditRepository.save).toHaveBeenCalled();
      expect(result.userId).toBe("user1");
      expect(result.amount).toBe(1000);
      expect(result.status).toBe(CreditStatus.ACTIVE);
      expect(result.term).toBe(12);
      expect(result.interestRate).toBe(12);
    });

    it("should create a new credit with custom values", async () => {
      mockCreditRepository.save.mockResolvedValue();

      const result = await creditService.createCredit({
        userId: "user1",
        amount: 5000,
        term: 24,
        interestRate: 15,
        description: "Custom credit",
      });

      expect(result.term).toBe(24);
      expect(result.interestRate).toBe(15);
      expect(result.description).toBe("Custom credit");
    });

    it("should generate a unique ID for new credit", async () => {
      mockCreditRepository.save.mockResolvedValue();

      const result1 = await creditService.createCredit({ userId: "user1", amount: 1000 });
      const result2 = await creditService.createCredit({ userId: "user1", amount: 2000 });

      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("updateCredit", () => {
    it("should update an existing credit", async () => {
      const existingCredit = new Credit(
        "1",
        "user1",
        1000,
        CreditStatus.ACTIVE,
        new Date(),
        new Date(),
        12,
        12,
        ""
      );
      mockCreditRepository.findById.mockResolvedValue(existingCredit);
      mockCreditRepository.update.mockResolvedValue();

      const result = await creditService.updateCredit("1", { amount: 1500 });

      expect(mockCreditRepository.findById).toHaveBeenCalledWith("1");
      expect(mockCreditRepository.update).toHaveBeenCalled();
      expect(result.amount).toBe(1500);
    });

    it("should update credit status", async () => {
      const existingCredit = new Credit(
        "1",
        "user1",
        1000,
        CreditStatus.ACTIVE,
        new Date(),
        new Date(),
        12,
        12,
        ""
      );
      mockCreditRepository.findById.mockResolvedValue(existingCredit);
      mockCreditRepository.update.mockResolvedValue();

      const result = await creditService.updateCredit("1", { status: CreditStatus.PAID });

      expect(result.status).toBe(CreditStatus.PAID);
    });

    it("should throw an error when updating a non-existent credit", async () => {
      mockCreditRepository.findById.mockResolvedValue(null);

      await expect(
        creditService.updateCredit("invalid-id", { amount: 500 })
      ).rejects.toThrow("Crédito no encontrado");
    });

    it("should update the updatedAt timestamp", async () => {
      const oldDate = new Date("2024-01-01");
      const existingCredit = new Credit(
        "1",
        "user1",
        1000,
        CreditStatus.ACTIVE,
        new Date(),
        oldDate,
        12,
        12,
        ""
      );
      mockCreditRepository.findById.mockResolvedValue(existingCredit);
      mockCreditRepository.update.mockResolvedValue();

      const result = await creditService.updateCredit("1", { amount: 1500 });

      expect(result.updatedAt.getTime()).toBeGreaterThan(oldDate.getTime());
    });
  });

  describe("deleteCredit", () => {
    it("should delete a credit", async () => {
      mockCreditRepository.delete.mockResolvedValue();

      await creditService.deleteCredit("1");

      expect(mockCreditRepository.delete).toHaveBeenCalledWith("1");
    });
  });

  describe("Credit model", () => {
    it("should create a Credit instance with all properties", () => {
      const credit = new Credit(
        "1",
        "user1",
        1000,
        CreditStatus.ACTIVE,
        new Date(),
        new Date(),
        12,
        12,
        "Test description"
      );

      expect(credit.id).toBe("1");
      expect(credit.userId).toBe("user1");
      expect(credit.amount).toBe(1000);
      expect(credit.status).toBe(CreditStatus.ACTIVE);
      expect(credit.term).toBe(12);
      expect(credit.interestRate).toBe(12);
      expect(credit.description).toBe("Test description");
    });

    it("should have all expected CreditStatus values", () => {
      expect(CreditStatus.ACTIVE).toBe("ACTIVE");
      expect(CreditStatus.PAID).toBe("PAID");
      expect(CreditStatus.OVERDUE).toBe("OVERDUE");
      expect(CreditStatus.CANCELLED).toBe("CANCELLED");
    });
  });
});
