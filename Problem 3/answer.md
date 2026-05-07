# Problem 3: Messy React

## Summary

The main problems are around typing, filtering/sorting, and how the data is transformed before rendering. The component currently has a few bugs that can either break TypeScript, render the wrong balances, or produce bad values like `NaN`.

## Issues Found

- `WalletBalance` does not include `blockchain`, but the component reads `balance.blockchain`. `getPriority` also uses `any`, so TypeScript is not really helping here.
- The filter is wrong. It uses an undefined `lhsPriority`, checks the wrong priority value, and keeps `amount <= 0` balances when those should be removed.
- Unsupported blockchains should be filtered out before sorting/rendering.
- The sort callback does not return `0` for equal priorities. Using a numeric difference is simpler and handles that case naturally.
- `prices` is listed as a dependency for `sortedBalances`, but sorting does not use prices. That causes unnecessary recalculation.
- `formattedBalances` is created but not used. Because rows are rendered from `sortedBalances`, `balance.formatted` can be `undefined`.
- `prices[balance.currency]` can be missing, which makes `usdValue` become `NaN`.
- The row key should not use the array index, because sorting/filtering can change row order.
- `children` is destructured but never used, which adds noise.

## Refactored Code

```tsx
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -1;
};

const WalletPage: React.FC<Props> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        return balance.amount > 0 && getPriority(balance.blockchain) >= 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      });
  }, [balances]);

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return sortedBalances.map((balance) => {
      const price = prices[balance.currency] ?? 0;

      return {
        ...balance,
        formatted: balance.amount.toFixed(),
        usdValue: price * balance.amount,
      };
    });
  }, [sortedBalances, prices]);

  return (
    <div {...props}>
      {formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}:${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};
```

## Notes About the Refactor

The refactor keeps the data flow in one direction: filter invalid balances, sort the remaining balances, format them, then render the formatted list.

`getPriority` is outside the component and no longer uses `any`. The filter now removes unsupported blockchains and non-positive amounts. `prices` is only used where `usdValue` is calculated, missing prices fall back to `0`, and the render uses `formattedBalances` directly.
