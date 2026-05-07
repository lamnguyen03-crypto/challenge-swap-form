export interface RawPriceItem {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  price: number;
  date: string;
  iconUrl: string;
}
