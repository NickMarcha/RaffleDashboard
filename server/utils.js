////////////////////////////// Sheet Coordinates //////////////////////////////
// Function to convert a string to a number
export function base25stringToNumber(str) {
  str = str.toUpperCase(); // Convert to uppercase for consistency
  let result = 0;

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    result = result * 26 + (charCode - 65 + 1); // Convert character to number
  }

  return result - 1; // Subtract 1 to match your mapping
}

// Function to convert a number to a string
export function numberToBase25String(num) {
  let result = "";

  while (num >= 0) {
    const remainder = num % 26;
    result = String.fromCharCode(65 + remainder) + result; // Convert number to character
    num = Math.floor(num / 26) - 2; // Subtract 1 to match your mapping

    if (num < 0) break;
  }

  return result;
}

////////////////////////////// Date Conversion //////////////////////////////

export function fromSerialDate(serialDate) {
  const epoch = new Date(1899, 11, 30);
  const daysSinceEpoch = serialDate;
  const dateInMilliseconds =
    epoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000;
  const date = new Date(dateInMilliseconds);

  const day = date.getDate();
  const month = getMonthName(date.getMonth());
  const year = date.getFullYear() % 100; // Convert YYYY to YY format

  const deserializedDate = `${day} ${month} ${year}`;

  return deserializedDate;
}

// Helper function to convert month numbers to names
export function getMonthName(monthNumber) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months[monthNumber];
}

export function toSerialDate(dateString) {
  //console.log(`Converting date: ${dateString}`);
  const parts = dateString.split(" ");
  const day = parseInt(parts[0], 10);
  const month = getMonthNumber(parts[1]);
  const year = parseInt(parts[2], 10) + 2000; // Assuming the year format is YY, convert it to YYYY

  const date = new Date(year, month, day);
  const epoch = new Date(1899, 11, 30);

  const daysSinceEpoch = Math.floor((date - epoch) / (24 * 60 * 60 * 1000));
  const googleSheetsDate = daysSinceEpoch;

  //console.log(`Converted date: ${googleSheetsDate}`);
  return googleSheetsDate;
}

// Helper function to convert month names to numbers
function getMonthNumber(monthName) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months.indexOf(monthName);
}

export const name = "square";
