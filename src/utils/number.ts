export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const normalizeCreditScore = (rangeMin: number, rangeMax: number, score: number) => {
  const percentage = (score - rangeMin) / (rangeMax - rangeMin);
  return Math.min(100, Math.max(0, percentage * 100));
};
