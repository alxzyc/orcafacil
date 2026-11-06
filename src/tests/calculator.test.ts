import { describe, it, expect } from 'vitest';
import { calculatePrice, calculateProposalTotal } from '../core/pricing/calculator';

describe('Core Pricing Calculator', () => {
  describe('calculatePrice', () => {
    it('should calculate price with markup correctly', () => {
      const cost = 100;
      const markup = 20;
      const price = calculatePrice(cost, markup);
      expect(price).toBe(120);
    });

    it('should handle zero markup', () => {
      const price = calculatePrice(100, 0);
      expect(price).toBe(100);
    });

    it('should handle decimal markup', () => {
      const price = calculatePrice(100, 12.5);
      expect(price).toBe(112.5);
    });

    it('should handle zero cost', () => {
      const price = calculatePrice(0, 50);
      expect(price).toBe(0);
    });
  });

  describe('calculateProposalTotal', () => {
    it('should calculate subtotal and apply discount', () => {
      const items = [{ price: 120 }, { price: 200 }];
      const summary = calculateProposalTotal(items, 50);
      expect(summary.subtotal).toBe(320);
      expect(summary.discount).toBe(50);
      expect(summary.finalTotal).toBe(270);
    });

    it('should not go below zero with large discount', () => {
      const items = [{ price: 100 }];
      const summary = calculateProposalTotal(items, 200);
      expect(summary.finalTotal).toBe(0);
    });

    it('should handle empty items array', () => {
      const summary = calculateProposalTotal([], 0);
      expect(summary.subtotal).toBe(0);
      expect(summary.finalTotal).toBe(0);
    });

    it('should handle zero discount', () => {
      const items = [{ price: 150 }, { price: 250 }];
      const summary = calculateProposalTotal(items, 0);
      expect(summary.finalTotal).toBe(400);
    });
  });
});



