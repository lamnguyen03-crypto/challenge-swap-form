interface FieldErrorProps {
  id?: string;
  message?: string | null;
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className="mt-2 flex items-center gap-2 text-sm font-medium text-rose-300"
      role="alert"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-rose-300" aria-hidden="true" />
      {message}
    </p>
  );
}
