// src/utils/format.js
export const formatAmount = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return "0.00";
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
