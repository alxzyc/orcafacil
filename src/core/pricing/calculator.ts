// Core logic for pricing calculations
// No framework dependency

export interface PriceableItem {
  cost: number;
  markupPercent: number;
}

export const calculatePrice = (cost: number, markupPercent: number): number => {
  return cost * (1 + markupPercent / 100);
};

export interface ProposalSummary {
  subtotal: number;
  discount: number;
  finalTotal: number;
}

export const calculateProposalTotal = (
  items: { price: number }[],
  discount: number = 0
): ProposalSummary => {
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const finalTotal = Math.max(0, subtotal - discount);
  return { subtotal, discount, finalTotal };
};




