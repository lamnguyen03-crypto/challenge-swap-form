# Currency Swap Form

A small React frontend assignment that lets users preview a token swap quote. Users can choose source and target tokens, enter an amount, see the estimated receive amount, and submit a mocked swap quote.

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS

## Features

- Fetches live token price data from the provided API.
- Filters out tokens with invalid or missing prices.
- Handles duplicate token symbols deterministically.
- Supports From/To token selection with token icons.
- Calculates estimated receive amount and exchange rate.
- Includes validation, loading, error, empty, and success states.
- Provides a swap-direction button.
- Responsive, mobile-friendly TailwindCSS UI.

## Run Locally

```bash
npm install
npm run dev
```

For a production build check:

```bash
npm run build
```

## Data Sources

Price API:

```txt
https://interview.switcheo.com/prices.json
```

Token icons:

```txt
https://github.com/Switcheo/token-icons/tree/main/tokens
```

Raw icon format:

```txt
https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg
```

## Implementation Decisions

- Kept data fetching in a small custom hook instead of adding React Query.
- Kept swap state local to the form because the app is small.
- Separated business logic into utilities for token normalization, formatting, and calculations.
- Used native `select` controls for reliability and mobile usability.
- Used TailwindCSS utility classes directly to avoid extra styling dependencies.

## Validation

The form requires:

- Amount is required.
- Amount must be a valid decimal number.
- Amount must be greater than `0`.
- From token is required.
- To token is required.
- From and To tokens cannot be the same.

The submit button is disabled while the form is invalid, prices are loading, or a submit is in progress.

## Mock Submit

Submitting the form does not send a real transaction. It simulates a backend request with a short timeout, disables the form while pending, and then shows a success message with the quoted swap summary.
