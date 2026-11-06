"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var calculator_1 = require("../core/pricing/calculator");
console.log("--- Executando Validação de Cálculos ---");
// Teste de cálculo de item
var cost = 100;
var markup = 20;
var price = (0, calculator_1.calculatePrice)(cost, markup);
console.log("Custo: ".concat(cost, ", Markup: ").concat(markup, "% => Pre\u00E7o: ").concat(price));
if (price !== 120)
    throw new Error("Cálculo de item incorreto");
// Teste de cálculo de orçamento
var items = [{ price: 120 }, { price: 200 }];
var summary = (0, calculator_1.calculateProposalTotal)(items, 50);
console.log("Subtotal: ".concat(summary.subtotal, ", Desconto: 50 => Total: ").concat(summary.finalTotal));
if (summary.finalTotal !== 270)
    throw new Error("Cálculo de total incorreto");
console.log("--- Validação concluída com sucesso ---");
