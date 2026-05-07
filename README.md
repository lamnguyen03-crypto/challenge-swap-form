# Frontend Developer Challenge

This repository contains my submission for a frontend developer coding test. It is organized into three independent problems:

- `Problem 1`: JavaScript utility implementations for summing numbers from `1` to `n`.
- `Problem 2`: A React + TypeScript currency swap form.
- `Problem 3`: A written review and refactor proposal for a messy React component.

## Repository Structure

```txt
.
├── Problem 1/
│   └── index.js
├── Problem 2/
│   ├── src/
│   ├── package.json
│   └── README.md
└── Problem 3/
    └── answer.md
```

## Problem 1: Sum to N

`Problem 1/index.js` includes three approaches for calculating the sum from `1` to `n`:

- `sum_to_n_for(n)`: iterative solution using a `for` loop.
- `sum_to_n_while(n)`: iterative solution using a `while` loop.
- `sum_to_n_formula(n)`: constant-time solution using the arithmetic series formula.

The formula version is the most efficient approach because it runs in `O(1)` time.

## Problem 2: Currency Swap Form

`Problem 2` is a Vite React application written in TypeScript and styled with TailwindCSS. The app lets users:

- Fetch token prices from the provided Switcheo price API.
- Select source and target tokens.
- Enter a swap amount.
- Preview the estimated receive amount and exchange rate.
- Swap the From/To direction.
- Submit a mocked swap quote.

The implementation also handles loading, error, empty, validation, and success states.

### Online Demo

```txt
https://lamnguyen03-crypto.github.io/challenge-swap-form/
```

### Run Locally

```bash
cd "Problem 2"
npm install
npm run dev
```

### Build

```bash
cd "Problem 2"
npm run build
```

### Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS

### Data Sources

- Price API: `https://interview.switcheo.com/prices.json`
- Token icons: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg`

## Problem 3: Messy React Review

`Problem 3/answer.md` documents issues found in the provided React code and includes a refactored version. The review focuses on:

- Type safety.
- Filtering and sorting correctness.
- Removing unsupported or non-positive balances.
- Avoiding unnecessary recalculation.
- Preventing `NaN` values when prices are missing.
- Rendering from the formatted data instead of unused intermediate state.
- Using stable row keys.

## Notes

The main runnable project is `Problem 2`. Problem 1 and Problem 3 are standalone answers for their respective prompts.
