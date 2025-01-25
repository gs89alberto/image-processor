/**
 * Generate a random price between min and max.
 */
export function generateRandomPrice(min = 5, max = 50): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}