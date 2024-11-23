/**
 * Generate random integer between 0 and integer
 * @param integer
 * @return randomInteger
 */
export function randomInteger(number: number) {
  return Math.floor(Math.random() * (number + 1));
}
