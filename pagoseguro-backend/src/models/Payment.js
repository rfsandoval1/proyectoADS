"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
class Payment {
    constructor(id, creditId, userId, amount, status, createdAt = new Date(), updatedAt = new Date(), paymentMethod, paidDate) {
        this.id = id;
        this.creditId = creditId;
        this.userId = userId;
        this.amount = amount;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.paymentMethod = paymentMethod;
        this.paidDate = paidDate;
    }
}
exports.Payment = Payment;
