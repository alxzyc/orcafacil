import { calculatePrice, calculateProposalTotal } from '../core/pricing/calculator';

console.log("--- Executando Validação de Cálculos ---");

// Teste de cálculo de item
const cost = 100;
const markup = 20;
const price = calculatePrice(cost, markup);
console.log(`Custo: ${cost}, Markup: ${markup}% => Preço: ${price}`);
if (price !== 120) throw new Error("Cálculo de item incorreto");

// Teste de cálculo de orçamento
const items = [{ price: 120 }, { price: 200 }];
const summary = calculateProposalTotal(items, 50);
console.log(`Subtotal: ${summary.subtotal}, Desconto: 50 => Total: ${summary.finalTotal}`);
if (summary.finalTotal !== 270) throw new Error("Cálculo de total incorreto");

console.log("--- Validação concluída com sucesso ---");
