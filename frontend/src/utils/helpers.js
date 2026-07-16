// ============================================
// ORDER NUMBER FORMATTING
// ============================================

// Format order number - show only the last 4 digits as number
// ORD-240101-0001 → 1
// ORD-240101-9444 → 9444
export const formatOrderId = (orderNumber) => {
  if (!orderNumber) return 'N/A';
  const parts = orderNumber.split('-');
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    // Remove leading zeros and convert to number
    const num = parseInt(lastPart);
    return isNaN(num) ? lastPart : num.toString();
  }
  return orderNumber;
};

// Show with # prefix
export const displayOrderId = (orderNumber) => {
  if (!orderNumber) return 'N/A';
  const parts = orderNumber.split('-');
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart);
    if (!isNaN(num)) {
      return `#${num}`;
    }
    return `#${lastPart}`;
  }
  return orderNumber;
};

// Show with short format (no prefix) - keep as string
export const shortOrderId = (orderNumber) => {
  if (!orderNumber) return 'N/A';
  const parts = orderNumber.split('-');
  if (parts.length >= 3) {
    return parts[parts.length - 1];
  }
  return orderNumber;
};

// ============================================
// PRICE FORMATTING
// ============================================

export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '0';
  return Math.round(amount).toString();
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0';
  return Math.round(amount).toLocaleString();
};

export const formatPriceWithCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 MMK';
  return `${Math.round(amount).toLocaleString()} MMK`;
};

// ============================================
// DATE FORMATTING
// ============================================

export const formatShortDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatLongDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};