////////////////////////////// Sheet Coordinates //////////////////////////////
/**
 * Converts Char String i.e google-sheets column to number
 * @param str string formatted "AA", "AB", ...
 * @returns number base25
 */
export function base25stringToNumber(str: string) {
  str = str.toUpperCase(); // Convert to uppercase for consistency
  let result = 0;

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    result = result * 26 + (charCode - 65 + 1); // Convert character to number
  }

  return result - 1; // Subtract 1 to match your mapping
}

/**
 * Converts base25 number into String i.e google-sheets column to number
 * @param num number base25
 * @returns string formatted "AA", "AB", ...
 */
export function numberToBase25String(num: number) {
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

/**
 * Converts a serial date number to date string
 * @param serialDate Google Sheets serial date
 * @returns date string i.e "31 jan 85"
 */
export function fromSerialDate(serialDate: number) {
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

/**
 * Helper month array ["Jan","Feb", "Mar",...]
 */
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

/**
 * Helper function to convert month numbers to names
 * @param monthNumber
 * @returns i.e. "Jan", "Feb"
 */
export function getMonthName(monthNumber: number) {
  return months[monthNumber];
}

/**
 * Converts date string into serial number
 * @param dateString i.e "31 jan 85"
 * @returns serial number i.e. 12332132
 */
export function toSerialDate(dateString: string) {
  //console.log(`Converting date: ${dateString}`);
  const parts = dateString.split(" ");
  const day = parseInt(parts[0], 10);
  const month = getMonthNumber(parts[1]);
  const year = parseInt(parts[2], 10) + 2000; // Assuming the year format is YY, convert it to YYYY

  const date = new Date(year, month, day);
  const epoch = new Date(1899, 11, 30);

  const daysSinceEpoch = Math.floor(
    (date.getTime() - epoch.getTime()) / (24 * 60 * 60 * 1000)
  );
  const googleSheetsDate = daysSinceEpoch;

  //console.log(`Converted date: ${googleSheetsDate}`);
  return googleSheetsDate;
}

/**
 * Convert month string to number
 * @param monthName i.e "Jan", "Feb"
 * @returns i.e "1", "12"
 */
function getMonthNumber(monthName: string) {
  return months.indexOf(monthName);
}
