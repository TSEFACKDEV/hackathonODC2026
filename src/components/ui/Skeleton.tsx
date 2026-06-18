export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-40 w-full rounded-xl"/>
      <div className="skeleton h-4 w-3/4"/>
      <div className="skeleton h-3 w-1/2"/>
      <div className="skeleton h-3 w-full"/>
    </div>
  );
}

export function SkeletonLine({ w="full" }: { w?: string }) {
  return <div className={`skeleton h-4 w-${w} rounded`}/>;
}