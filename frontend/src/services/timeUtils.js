// ==============================
// TIMEZONE UTILITY - IST (India)
// ==============================

export function toIST(utcDateString) {
  if (!utcDateString) return null;
  const date = new Date(utcDateString);
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
}

export function formatIST(utcDateString) {
  if (!utcDateString) return '–';
  const istDate = toIST(utcDateString);
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMins = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMins} ${ampm}`;
}