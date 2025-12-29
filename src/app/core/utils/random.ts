export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
