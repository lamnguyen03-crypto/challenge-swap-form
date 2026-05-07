import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DEFAULT_FROM_TOKEN, DEFAULT_TO_TOKEN } from '../constants';
import { useTokenPrices } from '../hooks/useTokenPrices';
import type { Token } from '../types';
import { formatAmount, formatPrice, formatRate } from '../utils/format';
import {
  calculateExchangeRate,
  calculateReceiveAmount,
} from '../utils/token';
import { FieldError } from './FieldError';
import { TokenSelect } from './TokenSelect';

interface SwapFormValues {
  fromSymbol: string;
  toSymbol: string;
  amount: string;
}

interface ValidationErrors {
  amount?: string;
  fromSymbol?: string;
  toSymbol?: string;
}

interface SwapSummary {
  fromAmount: number;
  fromSymbol: string;
  receiveAmount: number;
  toSymbol: string;
  exchangeRate: number;
}

const SUBMIT_DELAY_MS = 1200;
const DECIMAL_AMOUNT_PATTERN = /^(?:\d+\.?\d*|\.\d+)$/;

function hasToken(tokens: readonly Token[], symbol: string): boolean {
  return tokens.some((token) => token.symbol === symbol);
}

function getPreferredSymbol(
  tokens: readonly Token[],
  preferredSymbol: string,
  excludedSymbol?: string,
): string {
  const preferredToken = tokens.find(
    (token) =>
      token.symbol === preferredSymbol && token.symbol !== excludedSymbol,
  );

  return (
    preferredToken?.symbol ??
    tokens.find((token) => token.symbol !== excludedSymbol)?.symbol ??
    ''
  );
}

function parseAmount(value: string): number | null {
  const trimmedValue = value.trim();

  if (
    trimmedValue.length === 0 ||
    !DECIMAL_AMOUNT_PATTERN.test(trimmedValue)
  ) {
    return null;
  }

  const amount = Number(trimmedValue);

  return Number.isFinite(amount) ? amount : null;
}

function validateSwapForm(
  values: SwapFormValues,
  fromToken?: Token,
  toToken?: Token,
): ValidationErrors {
  const errors: ValidationErrors = {};
  const trimmedAmount = values.amount.trim();
  const parsedAmount = parseAmount(values.amount);

  if (trimmedAmount.length === 0) {
    errors.amount = 'Enter an amount to swap.';
  } else if (parsedAmount === null) {
    errors.amount = 'Enter a valid number.';
  } else if (parsedAmount <= 0) {
    errors.amount = 'Amount must be greater than 0.';
  }

  if (!fromToken) {
    errors.fromSymbol = 'Select a token to pay with.';
  }

  if (!toToken) {
    errors.toSymbol = 'Select a token to receive.';
  } else if (fromToken && fromToken.symbol === toToken.symbol) {
    errors.toSymbol = 'Choose a different token to receive.';
  }

  return errors;
}

function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function SwapForm() {
  const { tokens, isLoading, error, refetch } = useTokenPrices();
  const [formValues, setFormValues] = useState<SwapFormValues>({
    fromSymbol: DEFAULT_FROM_TOKEN,
    toSymbol: DEFAULT_TO_TOKEN,
    amount: '',
  });
  const [isAmountTouched, setIsAmountTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSummary, setSuccessSummary] = useState<SwapSummary | null>(
    null,
  );
  const submitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (tokens.length === 0) {
      return;
    }

    setFormValues((currentValues) => {
      const fromSymbol = hasToken(tokens, currentValues.fromSymbol)
        ? currentValues.fromSymbol
        : getPreferredSymbol(tokens, DEFAULT_FROM_TOKEN);
      const toSymbol =
        hasToken(tokens, currentValues.toSymbol) &&
        currentValues.toSymbol !== fromSymbol
          ? currentValues.toSymbol
          : getPreferredSymbol(tokens, DEFAULT_TO_TOKEN, fromSymbol);

      if (
        currentValues.fromSymbol === fromSymbol &&
        currentValues.toSymbol === toSymbol
      ) {
        return currentValues;
      }

      return {
        ...currentValues,
        fromSymbol,
        toSymbol,
      };
    });
  }, [tokens]);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current !== null) {
        window.clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const selectedFromToken = useMemo(
    () => tokens.find((token) => token.symbol === formValues.fromSymbol),
    [formValues.fromSymbol, tokens],
  );
  const selectedToToken = useMemo(
    () => tokens.find((token) => token.symbol === formValues.toSymbol),
    [formValues.toSymbol, tokens],
  );
  const parsedAmount = useMemo(
    () => parseAmount(formValues.amount),
    [formValues.amount],
  );
  const receiveAmount = useMemo(() => {
    if (!selectedFromToken || !selectedToToken || parsedAmount === null) {
      return null;
    }

    return calculateReceiveAmount(
      parsedAmount,
      selectedFromToken.price,
      selectedToToken.price,
    );
  }, [parsedAmount, selectedFromToken, selectedToToken]);
  const exchangeRate = useMemo(() => {
    if (!selectedFromToken || !selectedToToken) {
      return null;
    }

    return calculateExchangeRate(selectedFromToken.price, selectedToToken.price);
  }, [selectedFromToken, selectedToToken]);
  const validationErrors = useMemo(
    () => validateSwapForm(formValues, selectedFromToken, selectedToToken),
    [formValues, selectedFromToken, selectedToToken],
  );
  const isFormInvalid = hasValidationErrors(validationErrors);
  const isFormDisabled = isSubmitting || isLoading;
  const amountError =
    isAmountTouched || formValues.amount.trim().length > 0
      ? validationErrors.amount
      : null;

  function updateFormValues(nextValues: Partial<SwapFormValues>) {
    setFormValues((currentValues) => ({
      ...currentValues,
      ...nextValues,
    }));
    setSuccessSummary(null);
  }

  function handleSwapDirection() {
    updateFormValues({
      fromSymbol: formValues.toSymbol,
      toSymbol: formValues.fromSymbol,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAmountTouched(true);

    if (
      isFormInvalid ||
      !selectedFromToken ||
      !selectedToToken ||
      parsedAmount === null ||
      receiveAmount === null ||
      exchangeRate === null
    ) {
      return;
    }

    if (submitTimeoutRef.current !== null) {
      window.clearTimeout(submitTimeoutRef.current);
    }

    setIsSubmitting(true);
    setSuccessSummary(null);

    submitTimeoutRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setSuccessSummary({
        fromAmount: parsedAmount,
        fromSymbol: selectedFromToken.symbol,
        receiveAmount,
        toSymbol: selectedToToken.symbol,
        exchangeRate,
      });
      submitTimeoutRef.current = null;
    }, SUBMIT_DELAY_MS);
  }

  if (isLoading) {
    return (
      <section
        className="w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-zinc-900/85 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6"
        aria-busy="true"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Loading token prices.</span>
        <div className="animate-pulse space-y-4">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-full bg-zinc-800" />
            <div className="h-7 w-48 rounded-full bg-zinc-800" />
          </div>
          <div className="h-32 rounded-2xl border border-white/5 bg-zinc-800/70" />
          <div className="relative flex justify-center">
            <div className="h-12 w-12 rounded-full border border-white/10 bg-zinc-800" />
          </div>
          <div className="h-32 rounded-2xl border border-white/5 bg-zinc-800/70" />
          <div className="h-14 rounded-xl bg-zinc-800" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-xl rounded-[1.75rem] border border-rose-400/30 bg-zinc-900/85 p-6 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
          Price feed unavailable
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Unable to load token prices
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-400" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          Retry
        </button>
      </section>
    );
  }

  if (tokens.length === 0) {
    return (
      <section className="w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-zinc-900/85 p-6 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
          No markets
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          No valid token prices are available
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-400">
          The price feed loaded, but it did not include any usable token prices.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-6 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          Refresh
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-zinc-900/85 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6"
      aria-busy={isSubmitting}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Instant quote
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Swap currencies
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Preview your receive amount before submitting.
          </p>
        </div>
        <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
          USD pricing
        </span>
      </div>

      <fieldset disabled={isFormDisabled} className="space-y-0">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-inner shadow-black/20 transition focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/20">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-zinc-200">
              You pay
            </p>
            {selectedFromToken ? (
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
                {formatPrice(selectedFromToken.price)}
              </span>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-start">
            <div>
              <label
                htmlFor="from-amount"
                className="text-sm font-medium text-zinc-300"
              >
                Amount
              </label>
              <input
                id="from-amount"
                value={formValues.amount}
                onChange={(event) =>
                  updateFormValues({ amount: event.target.value })
                }
                onBlur={() => setIsAmountTouched(true)}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                aria-invalid={Boolean(amountError)}
                aria-describedby="from-amount-error"
                className="mt-1 block w-full rounded-xl border border-transparent bg-transparent px-1 py-3 text-4xl font-semibold text-white outline-none transition placeholder:text-zinc-600 hover:bg-zinc-900/50 focus:border-cyan-300/50 focus:bg-zinc-900/50 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-5xl"
              />
              <FieldError id="from-amount-error" message={amountError} />
            </div>

            <TokenSelect
              id="from-token"
              label="From token"
              tokens={tokens}
              selectedSymbol={formValues.fromSymbol}
              onChange={(symbol) => updateFormValues({ fromSymbol: symbol })}
              disabled={isFormDisabled}
              hasError={Boolean(validationErrors.fromSymbol)}
              ariaDescribedBy="from-token-error"
            />
          </div>
          <FieldError
            id="from-token-error"
            message={validationErrors.fromSymbol}
          />
        </div>

        <div className="relative z-10 -my-1 flex justify-center">
          <button
            type="button"
            onClick={handleSwapDirection}
            disabled={isFormDisabled}
            className="group flex h-12 w-12 items-center justify-center rounded-full border-4 border-zinc-900 bg-cyan-300 text-zinc-950 shadow-xl shadow-black/30 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            aria-label="Swap from and to tokens"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 transition group-hover:translate-y-0.5"
            >
              <path
                d="M8 4v13m0 0-4-4m4 4 4-4M16 20V7m0 0-4 4m4-4 4 4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-inner shadow-black/20 transition focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/20">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-zinc-200">
              You receive
            </p>
            {selectedToToken ? (
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
                {formatPrice(selectedToToken.price)}
              </span>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-start">
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Estimated amount
              </p>
              <div className="mt-1 flex min-h-[5.25rem] items-center rounded-xl border border-transparent bg-transparent px-1 py-3">
                <p className="break-all text-4xl font-semibold text-white sm:text-5xl">
                  {receiveAmount === null
                    ? '-'
                    : formatAmount(receiveAmount)}
                </p>
              </div>
            </div>

            <TokenSelect
              id="to-token"
              label="To token"
              tokens={tokens}
              selectedSymbol={formValues.toSymbol}
              onChange={(symbol) => updateFormValues({ toSymbol: symbol })}
              disabled={isFormDisabled}
              hasError={Boolean(validationErrors.toSymbol)}
              ariaDescribedBy="to-token-error"
            />
          </div>
          <FieldError id="to-token-error" message={validationErrors.toSymbol} />
        </div>
      </fieldset>

      <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3">
        <div className="flex flex-col gap-1 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium">Exchange rate</span>
          <span className="font-semibold text-zinc-100">
            {selectedFromToken && selectedToToken && exchangeRate !== null
              ? `1 ${selectedFromToken.symbol} `
              : '-'}
            {selectedFromToken && selectedToToken && exchangeRate !== null ? (
              <>
                &asymp; {formatRate(exchangeRate)} {selectedToToken.symbol}
              </>
            ) : null}
          </span>
        </div>
      </div>

      {successSummary ? (
        <div
          className="mt-5 flex gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-100"
          role="status"
          aria-live="polite"
        >
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-xs font-bold text-emerald-950"
            aria-hidden="true"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16">
              <path
                d="M3.25 8.25 6.5 11.5l6.25-7"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>
          <span>
            Swap quote submitted: {formatAmount(successSummary.fromAmount)}{' '}
            {successSummary.fromSymbol} to{' '}
            {formatAmount(successSummary.receiveAmount)}{' '}
            {successSummary.toSymbol} at 1 {successSummary.fromSymbol} ={' '}
            {formatRate(successSummary.exchangeRate)} {successSummary.toSymbol}.
          </span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isFormDisabled || isFormInvalid}
        className="mt-5 flex w-full items-center justify-center rounded-2xl bg-cyan-300 px-5 py-4 text-base font-semibold text-zinc-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
      >
        {isSubmitting ? 'Submitting quote...' : 'Preview swap'}
      </button>
    </form>
  );
}
