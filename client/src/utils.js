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
function getMonthName(monthNumber) {
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
