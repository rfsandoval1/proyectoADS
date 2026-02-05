"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditStatus = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["USER"] = "USER";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["CLIENTE"] = "CLIENTE";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var CreditStatus;
(function (CreditStatus) {
    CreditStatus["ACTIVE"] = "ACTIVE";
    CreditStatus["PAID"] = "PAID";
    CreditStatus["OVERDUE"] = "OVERDUE";
    CreditStatus["CANCELLED"] = "CANCELLED";
})(CreditStatus || (exports.CreditStatus = CreditStatus = {}));
