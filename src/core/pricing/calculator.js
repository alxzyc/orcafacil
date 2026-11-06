"use strict";
// Core logic for pricing calculations
// No framework dependency
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProposalTotal = exports.calculatePrice = void 0;
var calculatePrice = function (cost, markupPercent) {
    return cost * (1 + markupPercent / 100);
};
exports.calculatePrice = calculatePrice;
var calculateProposalTotal = function (items, discount) {
    if (discount === void 0) { discount = 0; }
    var subtotal = items.reduce(function (acc, item) { return acc + item.price; }, 0);
    var finalTotal = Math.max(0, subtotal - discount);
    return { subtotal: subtotal, discount: discount, finalTotal: finalTotal };
};
exports.calculateProposalTotal = calculateProposalTotal;
