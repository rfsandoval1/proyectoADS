"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credit = exports.CreditStatus = void 0;
var CreditStatus;
(function (CreditStatus) {
    CreditStatus["ACTIVE"] = "ACTIVE";
    CreditStatus["PAID"] = "PAID";
    CreditStatus["OVERDUE"] = "OVERDUE";
    CreditStatus["CANCELLED"] = "CANCELLED";
})(CreditStatus || (exports.CreditStatus = CreditStatus = {}));
class Credit {
    constructor(id, userId, amount, status, createdAt = new Date(), updatedAt = new Date(), term = 12, interestRate = 12, description = '') {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.term = term;
        this.interestRate = interestRate;
        this.description = description;
    }
}
exports.Credit = Credit;
exports.default = Credit;
