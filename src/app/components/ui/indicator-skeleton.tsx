import { Skeleton } from "./skeleton";
import { Card, CardContent } from "./card";

export function IndicatorSkeleton() {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle skeleton */}
          <Skeleton className="h-5 w-5 mt-1" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-3">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4" />

            {/* Description skeleton */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />

            {/* Score range skeleton */}
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IndicatorListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <IndicatorSkeleton key={i} />
      ))}
    </div>
  );
}
