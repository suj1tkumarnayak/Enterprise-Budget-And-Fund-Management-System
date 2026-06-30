/**
 * EmptyState — shown when a list or page has no data.
 *
 * Per the Frontend Design guidelines: "An empty screen is an invitation to act."
 * Always include an action when one is available.
 */
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      {icon !== undefined && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description !== undefined && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action !== undefined && (
        <button type="button" onClick={action.onClick} className="btn-primary mt-6">
          {action.label}
        </button>
      )}
    </div>
  );
}
