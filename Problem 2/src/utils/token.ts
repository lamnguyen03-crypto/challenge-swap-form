import { TOKEN_ICON_BASE_URL } from '../constants';
import type { RawPriceItem, Token } from '../types';

function isValidPrice(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function normalizeSymbol(value: string): string | null {
  const symbol = value.trim();

  return symbol.length > 0 ? symbol : null;
}

function getDateTime(value: string): number | null {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : null;
}

function shouldReplaceToken(currentDate: string, previousDate: string): boolean {
  const currentTime = getDateTime(currentDate);
  const previousTime = getDateTime(previousDate);

  if (currentTime === null && previousTime === null) {
    return true;
  }

  if (currentTime === null) {
    return false;
  }

  if (previousTime === null) {
    return true;
  }

  return currentTime >= previousTime;
}

export function getTokenIconUrl(symbol: string): string {
  return `${TOKEN_ICON_BASE_URL}/${encodeURIComponent(symbol.trim())}.svg`;
}

export function normalizeTokenPrices(rawPrices: readonly RawPriceItem[]): Token[] {
  const tokensBySymbol = new Map<string, Token>();

  rawPrices.forEach((item) => {
    const symbol = normalizeSymbol(item.currency);

    if (symbol === null || !isValidPrice(item.price)) {
      return;
    }

    const date = item.date;
    const existingToken = tokensBySymbol.get(symbol);

    if (
      existingToken !== undefined &&
      !shouldReplaceToken(date, existingToken.date)
    ) {
      return;
    }

    tokensBySymbol.set(symbol, {
      symbol,
      price: item.price,
      date,
      iconUrl: getTokenIconUrl(symbol),
    });
  });

  return Array.from(tokensBySymbol.values()).sort((firstToken, secondToken) => {
    const alphabeticalOrder = firstToken.symbol.localeCompare(
      secondToken.symbol,
      'en',
      {
        sensitivity: 'base',
      },
    );

    if (alphabeticalOrder !== 0) {
      return alphabeticalOrder;
    }

    return firstToken.symbol.localeCompare(secondToken.symbol, 'en');
  });
}

export function calculateReceiveAmount(
  fromAmount: number,
  fromTokenPrice: number,
  toTokenPrice: number,
): number | null {
  if (
    !Number.isFinite(fromAmount) ||
    fromAmount <= 0 ||
    !isValidPrice(fromTokenPrice) ||
    !isValidPrice(toTokenPrice)
  ) {
    return null;
  }

  return (fromAmount * fromTokenPrice) / toTokenPrice;
}

export function calculateExchangeRate(
  fromTokenPrice: number,
  toTokenPrice: number,
): number | null {
  if (!isValidPrice(fromTokenPrice) || !isValidPrice(toTokenPrice)) {
    return null;
  }

  return fromTokenPrice / toTokenPrice;
}
