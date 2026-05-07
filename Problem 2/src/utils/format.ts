const DEFAULT_FALLBACK = '-';

function isValidNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function getFractionDigits(value: number): number {
  const absoluteValue = Math.abs(value);

  if (absoluteValue === 0) {
    return 2;
  }

  if (absoluteValue < 0.000001) {
    return 8;
  }

  if (absoluteValue < 1) {
    return 6;
  }

  if (absoluteValue < 100) {
    return 4;
  }

  return 2;
}

export function formatAmount(
  value: number | null | undefined,
  fallback = DEFAULT_FALLBACK,
): string {
  if (!isValidNumber(value)) {
    return fallback;
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: getFractionDigits(value),
  }).format(value);
}

export function formatPrice(
  value: number | null | undefined,
  fallback = DEFAULT_FALLBACK,
): string {
  if (!isValidNumber(value)) {
    return fallback;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 1 ? 2 : 0,
    maximumFractionDigits: getFractionDigits(value),
  }).format(value);
}

export function formatRate(
  value: number | null | undefined,
  fallback = DEFAULT_FALLBACK,
): string {
  if (!isValidNumber(value)) {
    return fallback;
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: getFractionDigits(value),
  }).format(value);
}
