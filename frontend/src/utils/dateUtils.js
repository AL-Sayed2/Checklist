/**
 * Calculates and returns the ISO-like week string (e.g. "2026-W22") for a given date.
 * @param {Date} date The date to calculate the week string for. Defaults to current date.
 * @returns {string} The formatted week string.
 */
export const getCurrentWeekString = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((date.getDay() + 1 + days) / 7);
  return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};
