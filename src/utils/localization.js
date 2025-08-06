import { format } from 'date-fns';

/**
 * Convert Arabic numerals (٠١٢٣٤٥٦٧٨٩) to English numerals (0123456789)
 * @param {string|number} text - Text containing Arabic numerals
 * @returns {string} - Text with English numerals
 */
export const toEnglishNumerals = (text) => {
  if (text === null || text === undefined) return '';
  
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = String(text);
  
  arabicNumerals?.forEach((arabicNum, index) => {
    const regex = new RegExp(arabicNum, 'g');
    result = result?.replace(regex, englishNumerals?.[index]);
  });
  
  return result;
};

/**
 * Format currency with English numerals in Gregorian format
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'SAR')
 * @param {string} locale - Locale (default: 'en-SA' for English numerals)
 * @returns {string} - Formatted currency with English numerals
 */
export const formatCurrencyEnglish = (amount, currency = 'SAR', locale = 'en-SA') => {
  if (!amount && amount !== 0) return '0.00 SAR';
  
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  })?.format(amount);
  
  return toEnglishNumerals(formatted);
};

/**
 * Format numbers with English numerals
 * @param {number} number - Number to format
 * @param {string} locale - Locale (default: 'en-SA')
 * @returns {string} - Formatted number with English numerals
 */
export const formatNumberEnglish = (number, locale = 'en-SA') => {
  if (!number && number !== 0) return '0';
  
  const formatted = new Intl.NumberFormat(locale)?.format(number);
  return toEnglishNumerals(formatted);
};

/**
 * Format date in Gregorian calendar with English numerals
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Date format string (default: 'dd/MM/yyyy')
 * @returns {string} - Formatted date with English numerals
 */
export const formatDateEnglish = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatted = format(dateObj, formatStr);
    return toEnglishNumerals(formatted);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date time in Gregorian calendar with English numerals
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Date time format string (default: 'dd/MM/yyyy HH:mm')
 * @returns {string} - Formatted date time with English numerals
 */
export const formatDateTimeEnglish = (date, formatStr = 'dd/MM/yyyy HH:mm') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatted = format(dateObj, formatStr);
    return toEnglishNumerals(formatted);
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '';
  }
};

/**
 * Get current timestamp formatted in English numerals
 * @returns {string} - Current timestamp with English numerals
 */
export const getCurrentTimestampEnglish = () => {
  return formatDateTimeEnglish(new Date(), 'yyyy-MM-dd HH:mm:ss');
};