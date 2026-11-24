import { formatPrice } from './utils/format';
import { getDistanceInKm } from './utils/geo';

test('shows rent in rupees and commission as a percentage', () => {
  expect(formatPrice({ model: 'Rental', rental_price_or_commission: 250 })).toBe('₹250 / month');
  expect(formatPrice({ model: 'Commission', rental_price_or_commission: 8 })).toBe('8% per order');
  expect(formatPrice({ model: 'Rental', rental_price_or_commission: null })).toBe('N/A');
});

test('distance between two points in km', () => {
  // Patna Junction to Gandhi Maidan is roughly 2 km
  const d = getDistanceInKm(25.6026, 85.1371, 25.6193, 85.1442);
  expect(d).toBeGreaterThan(1.5);
  expect(d).toBeLessThan(2.5);
  expect(getDistanceInKm(null, 1, 2, 3)).toBeNull();
});
