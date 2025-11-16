import * as React from 'react';
import { cn } from '@/app/lib/utils';

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            role="separator"
            className={cn('shrink-0 bg-border', className)}
            {...props}
        />
    ),
);
Separator.displayName = 'Separator';

export { Separator };
