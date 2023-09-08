// take the miliseconds to hours, minutes, seconds in a string format
export const formatTime = (milliseconds) => {
  let dateObj = new Date(milliseconds);
  let hours = dateObj.getUTCHours();
  let minutes = dateObj.getUTCMinutes();
  let seconds = dateObj.getSeconds();

  let timeString =
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0");
  return timeString;
};
