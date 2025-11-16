'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { PostTopic } from '@/app/lib/types';

export type TopicFilterValue = 'all' | PostTopic;

interface TopicFilterContextValue {
    topic: TopicFilterValue;
    setTopic: (topic: TopicFilterValue) => void;
}

const TopicFilterContext = createContext<TopicFilterContextValue | undefined>(undefined);

interface TopicFilterProviderProps {
    children: React.ReactNode;
}

export function TopicFilterProvider({ children }: TopicFilterProviderProps) {
    const [topic, setTopic] = useState<TopicFilterValue>('all');

    const value = useMemo(
        () => ({
            topic,
            setTopic,
        }),
        [topic],
    );

    return <TopicFilterContext.Provider value={value}>{children}</TopicFilterContext.Provider>;
}

export function useTopicFilter() {
    const context = useContext(TopicFilterContext);
    if (!context) {
        throw new Error('useTopicFilter must be used within a TopicFilterProvider');
    }
    return context;
}
