import { useEffect, useState } from 'react';
import { getTokenIconUrl } from '../utils/token';

interface TokenIconProps {
  symbol: string;
  className?: string;
}

function getFallbackLabel(symbol: string): string {
  const cleanSymbol = symbol.trim();

  if (cleanSymbol.length === 0) {
    return '?';
  }

  return cleanSymbol.slice(0, 4).toUpperCase();
}

export function TokenIcon({ symbol, className = '' }: TokenIconProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const cleanSymbol = symbol.trim();
  const fallbackLabel = getFallbackLabel(cleanSymbol);
  const baseClassName =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-xs font-semibold text-zinc-100 shadow-sm';
  const iconClassName = `${baseClassName} ${className}`.trim();

  useEffect(() => {
    setHasImageError(false);
  }, [cleanSymbol]);

  if (cleanSymbol.length === 0 || hasImageError) {
    return (
      <span
        className={`${iconClassName} bg-zinc-800 text-cyan-100 ring-1 ring-cyan-300/20`}
        aria-label={`${fallbackLabel} token`}
      >
        {fallbackLabel}
      </span>
    );
  }

  return (
    <img
      src={getTokenIconUrl(cleanSymbol)}
      alt={`${cleanSymbol} token`}
      className={iconClassName}
      onError={() => setHasImageError(true)}
    />
  );
}
