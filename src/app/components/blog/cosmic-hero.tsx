'use client';

import Link from 'next/link';
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import { buildCosmicPostNodes } from '@/app/lib/cosmic-posts';
import type { CosmicPostNode, PostListItem, TopicDefinition } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';

interface CosmicHeroProps {
    posts: PostListItem[];
    topics: TopicDefinition[];
}

interface RotationState {
    x: number;
    y: number;
}

interface CartesianPoint {
    x: number;
    y: number;
    z: number;
}

interface ProjectedNode extends CosmicPostNode {
    screenX: number;
    screenY: number;
    depth: number;
    scale: number;
    opacity: number;
    interactive: boolean;
}

interface OrbitPath {
    path: string;
    opacity: number;
}

const GLOBE_CENTER = 500;
const GLOBE_RADIUS = 360;
const PERCENT_RADIUS = 31;
const ROTATION_LIMIT = 1.15;
const INITIAL_ROTATION: RotationState = { x: -0.38, y: 0.78 };

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toRadians = (value: number): number => (value * Math.PI) / 180;

const toCartesian = (latitude: number, longitude: number): CartesianPoint => {
    const lat = toRadians(latitude);
    const lon = toRadians(longitude);

    return {
        x: Math.cos(lat) * Math.cos(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lon),
    };
};

const rotatePoint = (point: CartesianPoint, rotation: RotationState): CartesianPoint => {
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);

    const xYaw = point.x * cosY + point.z * sinY;
    const zYaw = -point.x * sinY + point.z * cosY;
    const yPitch = point.y * cosX - zYaw * sinX;
    const zPitch = point.y * sinX + zYaw * cosX;

    return {
        x: xYaw,
        y: yPitch,
        z: zPitch,
    };
};

const projectToPercent = (point: CartesianPoint): Omit<ProjectedNode, keyof CosmicPostNode> => {
    const perspective = 0.74 + (point.z + 1) * 0.19;
    const screenX = 50 + point.x * PERCENT_RADIUS * perspective;
    const screenY = 50 + point.y * PERCENT_RADIUS * perspective;
    const scale = 0.72 + (point.z + 1) * 0.38;
    const opacity = 0.18 + (point.z + 1) * 0.4;

    return {
        screenX,
        screenY,
        depth: point.z,
        scale,
        opacity,
        interactive: point.z > -0.12,
    };
};

const projectToSvg = (point: CartesianPoint): { x: number; y: number; depth: number } => {
    const perspective = 0.74 + (point.z + 1) * 0.18;
    return {
        x: GLOBE_CENTER + point.x * GLOBE_RADIUS * perspective,
        y: GLOBE_CENTER + point.y * GLOBE_RADIUS * perspective,
        depth: point.z,
    };
};

const buildPath = (points: Array<{ x: number; y: number }>, closed: boolean): string => {
    if (points.length === 0) {
        return '';
    }

    const [first, ...rest] = points;
    const command = [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`];

    for (const point of rest) {
        command.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    }

    if (closed) {
        command.push('Z');
    }

    return command.join(' ');
};

const buildLatitudePath = (latitude: number, rotation: RotationState): OrbitPath => {
    const samples = Array.from({ length: 96 }, (_, index) => {
        const longitude = (index / 95) * 360;
        return projectToSvg(rotatePoint(toCartesian(latitude, longitude), rotation));
    });

    const opacity = samples.reduce((sum, point) => sum + point.depth, 0) / samples.length;
    return {
        path: buildPath(samples, true),
        opacity: 0.18 + (opacity + 1) * 0.08,
    };
};

const buildMeridianPath = (longitude: number, rotation: RotationState): OrbitPath => {
    const samples = Array.from({ length: 96 }, (_, index) => {
        const angle = (index / 95) * Math.PI * 2;
        const point = {
            x: Math.cos(angle) * Math.cos(toRadians(longitude)),
            y: Math.sin(angle),
            z: Math.cos(angle) * Math.sin(toRadians(longitude)),
        };

        return projectToSvg(rotatePoint(point, rotation));
    });

    const opacity = samples.reduce((sum, point) => sum + point.depth, 0) / samples.length;
    return {
        path: buildPath(samples, true),
        opacity: 0.12 + (opacity + 1) * 0.06,
    };
};

const buildOrbitPaths = (topics: TopicDefinition[], rotation: RotationState): OrbitPath[] => {
    const latitudes = Array.from(new Set([...topics.map((topic) => topic.orbitLatitude), 0]));
    const meridians = [18, 78, 138, 198, 258, 318];

    return [
        ...latitudes.map((latitude) => buildLatitudePath(latitude, rotation)),
        ...meridians.map((longitude) => buildMeridianPath(longitude, rotation)),
    ];
};

const sortByDepth = <T extends { depth: number }>(items: T[]): T[] => [...items].sort((a, b) => a.depth - b.depth);

const tooltipLeft = (node: ProjectedNode): string => `${clamp(node.screenX, 16, 84)}%`;

const tooltipTop = (node: ProjectedNode): string => `${clamp(node.screenY - 7, 12, 88)}%`;

const formatPercent = (value: number): string => `${value.toFixed(4)}%`;

const formatDecimal = (value: number): string => value.toFixed(6);

const isMarkerTarget = (target: EventTarget | null): boolean => {
    return target instanceof HTMLElement && Boolean(target.closest('[data-cosmic-marker="true"]'));
};

export function CosmicHero({ posts, topics }: CosmicHeroProps) {
    const [rotation, setRotation] = useState<RotationState>(INITIAL_ROTATION);
    const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
    const dragState = useRef<{ pointerId: number; x: number; y: number; moved: boolean } | null>(null);

    const nodes = useMemo(() => buildCosmicPostNodes(posts, topics), [posts, topics]);
    const projectedNodes = useMemo<ProjectedNode[]>(() => {
        return nodes.map((node) => {
            const rotated = rotatePoint(toCartesian(node.latitude, node.longitude), rotation);
            return {
                ...node,
                ...projectToPercent(rotated),
            };
        });
    }, [nodes, rotation]);

    const renderedNodes = useMemo(() => sortByDepth(projectedNodes), [projectedNodes]);
    const orbitPaths = useMemo(() => buildOrbitPaths(topics, rotation), [rotation, topics]);
    const hoveredNode = hoveredSlug ? projectedNodes.find((node) => node.slug === hoveredSlug) ?? null : null;

    if (projectedNodes.length === 0) {
        return null;
    }

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
        if (isMarkerTarget(event.target)) {
            return;
        }

        dragState.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            moved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
        if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
            return;
        }

        const deltaX = event.clientX - dragState.current.x;
        const deltaY = event.clientY - dragState.current.y;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            dragState.current.moved = true;
        }

        dragState.current.x = event.clientX;
        dragState.current.y = event.clientY;

        setRotation((current) => ({
            x: clamp(current.x - deltaY * 0.0065, -ROTATION_LIMIT, ROTATION_LIMIT),
            y: current.y + deltaX * 0.007,
        }));
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
        if (dragState.current?.pointerId === event.pointerId) {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }
            dragState.current = null;
        }
    };

    const handleWheel = (event: ReactWheelEvent<HTMLDivElement>): void => {
        event.preventDefault();
        setRotation((current) => ({
            x: clamp(current.x + event.deltaY * 0.0007, -ROTATION_LIMIT, ROTATION_LIMIT),
            y: current.y + event.deltaY * 0.0028,
        }));
    };

    return (
        <section className="relative overflow-hidden border-b border-border/40">
            <div className="pointer-events-none absolute inset-0 cosmic-stars opacity-80" />
            <div className="pointer-events-none absolute inset-0 cosmic-grid opacity-20" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#37e0ff]/16 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9b8cff]/12 blur-3xl sm:h-[34rem] sm:w-[34rem]" />
            <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
                <div
                    className="relative aspect-square w-full max-w-[min(92vw,54rem)] touch-none select-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onWheel={handleWheel}
                >
                    <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(144,243,255,0.28),rgba(59,132,255,0.14)_34%,rgba(8,14,28,0.78)_72%,rgba(5,9,20,0.92)_100%)] shadow-[0_0_90px_rgba(31,182,255,0.25)] sm:inset-[11%]" />
                    <div className="pointer-events-none absolute inset-[9%] rounded-full border border-white/8" />
                    <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full">
                        <defs>
                            <radialGradient id="globe-shell" cx="35%" cy="30%">
                                <stop offset="0%" stopColor="rgba(170,244,255,0.95)" />
                                <stop offset="24%" stopColor="rgba(76,170,255,0.42)" />
                                <stop offset="66%" stopColor="rgba(13,24,48,0.92)" />
                                <stop offset="100%" stopColor="rgba(6,8,18,1)" />
                            </radialGradient>
                            <filter id="signal-blur">
                                <feGaussianBlur stdDeviation="6" />
                            </filter>
                        </defs>
                        <circle cx={GLOBE_CENTER} cy={GLOBE_CENTER} r={GLOBE_RADIUS + 44} fill="rgba(98,240,255,0.08)" filter="url(#signal-blur)" />
                        <circle cx={GLOBE_CENTER} cy={GLOBE_CENTER} r={GLOBE_RADIUS} fill="url(#globe-shell)" />
                        <circle
                            cx={GLOBE_CENTER}
                            cy={GLOBE_CENTER}
                            r={GLOBE_RADIUS}
                            fill="none"
                            stroke="rgba(255,255,255,0.14)"
                            strokeWidth="1.4"
                        />
                        {orbitPaths.map((path, index) => (
                            <path
                                key={`orbit-${index}`}
                                d={path.path}
                                fill="none"
                                stroke="rgba(98,240,255,0.26)"
                                strokeWidth={1.8}
                                strokeDasharray="3.5 10"
                                strokeLinecap="round"
                                opacity={formatDecimal(path.opacity)}
                            />
                        ))}
                    </svg>

                    {renderedNodes.map((node) => (
                        <Link
                            key={node.slug}
                            href={node.href}
                            data-cosmic-marker="true"
                            aria-label={`${node.title} 문서 열기`}
                            className={cn(
                                'absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition duration-200',
                                node.interactive ? 'cursor-pointer' : 'pointer-events-none',
                            )}
                            style={{
                                left: formatPercent(node.screenX),
                                top: formatPercent(node.screenY),
                                opacity: formatDecimal(node.opacity),
                                transform: `translate(-50%, -50%) scale(${formatDecimal(node.scale)})`,
                                zIndex: String(Math.round((node.depth + 1) * 100)),
                            }}
                            onMouseEnter={() => setHoveredSlug(node.slug)}
                            onMouseLeave={() => setHoveredSlug((current) => (current === node.slug ? null : current))}
                            onPointerDown={(event) => {
                                event.stopPropagation();
                            }}
                            onClick={(event) => {
                                if (dragState.current?.moved) {
                                    event.preventDefault();
                                }
                            }}
                        >
                            <span
                                className="signal-sheen absolute inset-0 rounded-full border border-white/35"
                                style={{
                                    backgroundColor: `${node.accent}30`,
                                    boxShadow: `0 0 18px ${node.accent}, 0 0 34px ${node.accent}55`,
                                }}
                            />
                            <span className="absolute inset-[6px] rounded-full bg-white/95" />
                        </Link>
                    ))}

                    {hoveredNode && hoveredNode.interactive && (
                        <div
                            className={cn(
                                'pointer-events-none absolute z-[120] w-[min(18rem,72vw)] rounded-[1.5rem] border border-white/12 bg-slate-950/88 p-4 shadow-[0_24px_60px_rgba(3,7,18,0.45)] backdrop-blur-xl',
                                hoveredNode.screenX > 64 ? '-translate-x-full' : '',
                                '-translate-y-full',
                            )}
                            style={{
                                left: tooltipLeft(hoveredNode),
                                top: tooltipTop(hoveredNode),
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="inline-flex h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor: hoveredNode.accent,
                                        boxShadow: `0 0 12px ${hoveredNode.accent}`,
                                    }}
                                />
                                <p className="font-display text-[0.68rem] uppercase tracking-[0.28em] text-white/54">{hoveredNode.signalCode}</p>
                            </div>
                            <p className="mt-3 text-base font-semibold text-white">{hoveredNode.title}</p>
                            <p className="mt-2 text-sm leading-6 text-white/62">{hoveredNode.description}</p>
                        </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center sm:bottom-8">
                        <div className="rounded-full border border-white/10 bg-slate-950/36 px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-white/34 backdrop-blur-xl">
                            DRAG
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
