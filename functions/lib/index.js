"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserPassword = exports.paypalHandleOrder = exports.paypalCreateOrder = exports.price = void 0;
const price_1 = require("./endpoints/callables/price");
exports.price = price_1.default;
const paypalCreateOrder_1 = require("./endpoints/callables/paypalCreateOrder");
exports.paypalCreateOrder = paypalCreateOrder_1.default;
const paypalHandleOrder_1 = require("./endpoints/callables/paypalHandleOrder");
exports.paypalHandleOrder = paypalHandleOrder_1.default;
const changeUserPassword_1 = require("./endpoints/callables/changeUserPassword");
exports.changeUserPassword = changeUserPassword_1.default;
//# sourceMappingURL=index.js.map