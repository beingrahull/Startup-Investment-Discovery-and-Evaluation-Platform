export function AskCardSkeleton() {
  return (
    <div className="card ask-card skeleton" aria-hidden="true">
      <div className="sk" style={{ width: "40%" }} />
      <div className="sk" style={{ width: "70%", height: 20 }} />
      <div className="sk" style={{ width: "95%" }} />
      <div className="sk" style={{ width: "60%" }} />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading asks">
      {Array.from({ length: count }, (_, i) => <AskCardSkeleton key={i} />)}
    </div>
  );
}
