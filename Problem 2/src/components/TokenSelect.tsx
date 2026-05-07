import type { ChangeEvent } from 'react';
import type { Token } from '../types';
import { formatPrice } from '../utils/format';
import { TokenIcon } from './TokenIcon';

interface TokenSelectProps {
  id: string;
  label: string;
  tokens: readonly Token[];
  selectedSymbol: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  ariaDescribedBy?: string;
}

export function TokenSelect({
  id,
  label,
  tokens,
  selectedSymbol,
  onChange,
  disabled = false,
  hasError = false,
  ariaDescribedBy,
}: TokenSelectProps) {
  const selectedToken = tokens.find((token) => token.symbol === selectedSymbol);
  const isDisabled = disabled || tokens.length === 0;

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </label>

      <div
        className={[
          'flex min-h-[4.5rem] items-center gap-3 rounded-xl border bg-zinc-900/80 px-3 py-3 shadow-sm transition',
          hasError
            ? 'border-rose-400/70'
            : 'border-zinc-700/80 focus-within:border-cyan-300',
          isDisabled
            ? 'cursor-not-allowed opacity-60'
            : 'hover:border-zinc-500 focus-within:ring-2 focus-within:ring-cyan-300/30',
        ].join(' ')}
      >
        {selectedToken ? (
          <TokenIcon symbol={selectedToken.symbol} />
        ) : (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-600 bg-zinc-900 text-xs font-semibold text-zinc-500"
            aria-hidden="true"
          >
            --
          </span>
        )}

        <div className="relative min-w-0 flex-1">
          <select
            id={id}
            value={selectedSymbol}
            onChange={handleChange}
            disabled={isDisabled}
            aria-invalid={hasError}
            aria-describedby={ariaDescribedBy}
            className="block w-full appearance-none truncate rounded-md border-0 bg-transparent p-0 pr-10 text-base font-semibold text-zinc-50 outline-none focus:ring-0 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {tokens.length === 0 ? 'No tokens available' : 'Select token'}
            </option>
            {tokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>

          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-0 top-1 h-4 w-4 text-zinc-400"
            aria-hidden="true"
          >
            <path
              d="m5 7 5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>

          {selectedToken ? (
            <p className="mt-1 truncate text-xs text-zinc-400">
              {formatPrice(selectedToken.price)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
