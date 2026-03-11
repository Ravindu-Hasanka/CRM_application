export default function LoadingState({ label = 'Loading data...' }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" />
      <p>{label}</p>
    </div>
  )
}

