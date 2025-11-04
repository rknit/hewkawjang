
export type PriceRangeLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Calculates the price range level (1-5) based on average price per person
 * @param averagePrice - Average price per person in Thai Baht
 * @returns Price range level from 1 (cheapest) to 5 (most expensive)
 */
export function calculatePriceRange(averagePrice: number): PriceRangeLevel {
  if (averagePrice <= 0) return 0;
  if (averagePrice < 150) return 1;
  if (averagePrice < 300) return 2;
  if (averagePrice < 600) return 3;
  if (averagePrice < 1500) return 4;
  return 5;
}



