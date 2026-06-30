/**
 * LoadingSpinner — accessible full-screen or inline loading indicator.
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
  fullPage = false,
}: LoadingSpinnerProps): JSX.Element {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  } as const;

  const spinner = (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center gap-3"
    >
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-brand-600 border-t-transparent`}
      />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">{spinner}</div>
    );
  }

  return spinner;
}
