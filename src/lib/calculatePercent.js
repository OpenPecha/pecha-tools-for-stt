export const calculatePercent = (num1, num2) => {
  if (num1 === 0 || num2 === 0) return 0;
  // if it is greater than 100 rerturn 100
  if (num1 > num2) return 100.0;
  return ((num1 / num2) * 100).toFixed(2);
};
