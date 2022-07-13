
/**
 * Add leading zeros if needed
 * @param num number to process
 * @param digits target total digit for the number
 * @returns string possibly prepended with zeros
 */
function fixDigits(num: string | number, digits=2): string {
  num = String(num);
  while (num.length < digits) {
    num = '0' + num;
  }
  return num
}
  
/**
 * Date object to ISO format date/time string with timezone offset
 * @param date Date object
 * @returns formatted string
 */  
export function dateToIso(date: Date): string {
  const tzOffset = -date.getTimezoneOffset();

  return date.getFullYear() +
    '-' + fixDigits(date.getMonth() + 1) +
    '-' + fixDigits(date.getDate()) +
    'T' + fixDigits(date.getHours()) +
    ':' + fixDigits(date.getMinutes()) +
    ':' + fixDigits(date.getSeconds()) +
    (tzOffset >= 0 ? '+' : '-') + fixDigits(Math.floor(Math.abs(tzOffset) / 60)) +
    ':' + fixDigits(Math.abs(tzOffset) % 60);
}
