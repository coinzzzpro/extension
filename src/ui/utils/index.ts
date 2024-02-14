import BigNumber from 'bignumber.js';
import { useLocation } from 'react-router-dom';

// Exporting context and hooks for external use
export * from './WalletContext';
export * from './hooks';

// Defining UI types for easy reference and checks
const UI_TYPE = {
  Tab: 'index',
  Pop: 'popup',
  Notification: 'notification'
};

type UiTypeCheck = {
  isTab: boolean;
  isNotification: boolean;
  isPop: boolean;
};

// Function to determine the type of UI based on the pathname
export const getUiType = (): UiTypeCheck => {
  const { pathname } = window.location;
  return Object.entries(UI_TYPE).reduce((m, [key, value]) => {
    m[`is${key}`] = pathname === `/${value}.html`;
    return m;
  }, {} as UiTypeCheck);
};

// Function to convert hex to text, handling '0x' prefix
export const hex2Text = (hex: string) => {
  try {
    return hex.startsWith('0x') ? decodeURIComponent(hex.replace(/^0x/, '').replace(/[0-9a-f]{2}/g, '%$&')) : hex;
  } catch {
    return hex;
  }
};

// Function to get the name of the UI type
export const getUITypeName = (): string => {
  const UIType = getUiType();

  if (UIType.isPop) return 'popup';
  if (UIType.isNotification) return 'notification';
  if (UIType.isTab) return 'tab';

  return '';
};

// Extracts the main part of a domain name from a given URL
export const getOriginName = (origin: string) => {
  const matches = origin.replace(/https?:\/\//, '').match(/^([^.]+\.)?(\S+)\./);
  return matches ? matches[2] || origin : origin;
};

// Generates a hash code from a string
export const hashCode = (str: string) => {
  if (!str) return 0;
  let hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Truncates a string with ellipsis if it exceeds a certain length
export const ellipsisOverflowedText = (str: string, length = 5, removeLastComma = false) => {
  if (str.length <= length) return str;
  let cut = str.substring(0, length);
  if (removeLastComma && cut.endsWith(',')) {
    cut = cut.substring(0, length - 1);
  }
  return `${cut}...`;
};

// Conversion functions between satoshis and BTC
export const satoshisToBTC = (amount: number) => amount / 100000000;
export const btcTosatoshis = (amount: number) => Math.floor(amount * 100000000);

// Shortens an address to a specified length with ellipsis
export function shortAddress(address?: string, len = 5) {
  if (!address) return '';
  if (address.length <= len * 2) return address;
  return address.slice(0, len) + '...' + address.slice(-len);
}

// Shortens a description to a specified length with ellipsis
export function shortDesc(desc?: string, len = 50) {
  if (!desc) return '';
  if (desc.length <= len) return desc;
  return desc.slice(0, len) + '...';
}

// A utility function to delay execution for a given number of seconds
export async function sleep(timeSec: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, timeSec * 1000);
  });
}

// Validates if the provided string is a valid address
export function isValidAddress(address: string) {
  return !!address; // Simple check, can be expanded based on specific criteria
}

// Copies a given text to the clipboard
export const copyToClipboard = (textToCopy: string | number) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(textToCopy.toString());
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy.toString();
    textArea.style.position = 'absolute';
    textArea.style.opacity = '0';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise<void>((res, rej) => {
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
    });
  }
};

// Formats a date according to the given format string
export function formatDate(date: Date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
  for (const k in o)
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length));
  return fmt;
}

// Conversion functions between satoshis and a formatted amount
export function satoshisToAmount(val: number) {
  const num = new BigNumber(val);
  return num.dividedBy(100000000).toFixed(8);
}

export function amountToSatoshis(val: any) {
  const num = new BigNumber(val);
  return num.multipliedBy(100000000).toNumber();
}

// Hook to get the state from the current location in React Router
export function useLocationState<T>() {
  const { state } = useLocation();
  return state as T;
}

// Configuring BigNumber to avoid exponential notation in a certain range
BigNumber.config({ EXPONENTIAL_AT: [-20, 20] });
