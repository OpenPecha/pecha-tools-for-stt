export const istCurrentTime = () => {
  let currentDate = new Date();
  let addedTime = 5.5 * 3600000; // UTC to IST
  currentDate.setTime(currentDate.getTime() + addedTime);
  return currentDate;
};

export const utcToIst = (utcDate) => {
  let addedTime = 5.5 * 3600000; // UTC to IST
  utcDate.setTime(utcDate.getTime() + addedTime);
  return utcDate;
};
