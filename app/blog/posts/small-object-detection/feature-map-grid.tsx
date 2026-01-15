"use client";

import React from "react";
import Image from "next/image";

// Memoized Image component to prevent unnecessary re-renders
const MemoizedImage = React.memo((props: React.ComponentProps<typeof Image>) => {
    return <Image {...props} />;
});
MemoizedImage.displayName = "MemoizedImage";

// Size bin order matching the detection chart
const SIZE_BIN_ORDER = [
    "Insufficient",
    "Very Tiny",
    "Tiny",
    "Very Small",
    "Small",
    "Medium Small",
    "Medium",
    "Medium Large",
    "Large",
];

const CLASS_NAMES: Record<number, string> = {
    0: "pedestrian",
    1: "people",
    2: "bicycle",
    3: "car",
    4: "van",
    5: "truck",
    6: "tricycle",
    7: "awning-tricycle",
    8: "bus",
    9: "motor",
};

// Map size band to object class ID
const SIZE_BAND_TO_CLASS_ID: Record<string, number> = {
    "Insufficient": 4,
    "Very Tiny": 10,
    "Tiny": 4,
    "Very Small": 10,
    "Small": 10,
    "Medium Small": 4,
    "Medium": 4,
    "Medium Large": 4,
    "Large": 9,
};

// Convert size band name to file naming convention (lowercase with hyphens)
const sizeBandToFileName = (sizeBand: string): string => {
    return sizeBand.toLowerCase().replace(/\s+/g, "-");
};

interface FeatureMapMetadata {
    object_width: number;
    object_height: number;
    object_class_id: number;
}

interface FeatureMapData {
    sizeBand: string;
    metadata: FeatureMapMetadata | null;
    inputImageUrl: string | null;
    backboneImageUrl: string | null;
    fpnImageUrl: string | null;
    backboneDimensions: string | null;
    fpnDimensions: string | null;
}

function FeatureMapGrid() {
    const [mounted, setMounted] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<Map<string, FeatureMapData>>(new Map());

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Load data on mount
    React.useEffect(() => {
        if (!mounted) return;

        setLoading(true);
        const newData = new Map<string, FeatureMapData>();

        // Construct image URLs directly from public paths
        for (const sizeBand of SIZE_BIN_ORDER) {
            const fileName = sizeBandToFileName(sizeBand);
            const inputImageUrl = `/blog/small-object-detection/${fileName}-input.jpg`;
            const backboneImageUrl = `/blog/small-object-detection/${fileName}-backbone.png`;
            const fpnImageUrl = `/blog/small-object-detection/${fileName}-fpn.png`;

            newData.set(sizeBand, {
                sizeBand,
                metadata: null,
                inputImageUrl,
                backboneImageUrl,
                fpnImageUrl,
                backboneDimensions: null,
                fpnDimensions: null,
            });
        }

        setData(newData);
        setLoading(false);
    }, [mounted]);

    if (!mounted) {
        return null;
    }

    if (loading && data.size === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-foreground-muted animate-pulse">Loading feature maps...</div>
            </div>
        );
    }


    return (
        <div className="flex flex-col w-full elevated rounded-lg select-none">
            {/* Grid */}
            <div className="flex w-full">
                {/* Fixed left column with size bands */}
                <div className="flex-shrink-0 w-6">
                    {/* Size band labels */}
                    {SIZE_BIN_ORDER.map((sizeBand, index) => {
                        // First row should account for header height (h-16 = 64px header + h-40 = 160px row = h-52 = 208px)
                        const rowHeight = index === 0 ? 'h-48' : 'h-40';
                        const isLastRow = index === SIZE_BIN_ORDER.length - 1;
                        const isFirstRow = index === 0;
                        let roundedClasses = '';
                        if (isFirstRow) {
                            roundedClasses += 'rounded-tl-lg';
                        }
                        if (isLastRow) {
                            roundedClasses += ' rounded-bl-lg';
                        }
                        return (
                            <div
                                key={sizeBand}
                                className={`flex items-center justify-center bg-background-muted border-r border-background-interesting ${roundedClasses} ${rowHeight}`}
                            >
                                <span className="transform -rotate-90 whitespace-nowrap text-xs font-medium">
                                    {sizeBand}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 min-w-0 overflow-x-auto">
                    <div className="flex flex-col min-w-max">
                        {/* Header row */}
                        <div className="flex sticky top-0 z-10 border-b border-background-interesting bg-background-muted rounded-tr-lg h-8">
                            <div className="flex-1 px-2 py-2 text-center text-xs font-medium min-w-32">
                                Object annotation
                            </div>
                            <div className="flex-1 px-2 py-2 text-center text-xs font-medium min-w-32">
                                Backbone feature map
                            </div>
                            <div className="flex-1 px-2 py-2 text-center text-xs font-medium min-w-32">
                                FPN feature map
                            </div>
                        </div>

                        {/* Content rows */}
                        {SIZE_BIN_ORDER.map((sizeBand, index) => {
                            const bandData = data.get(sizeBand);
                            const metadata = bandData?.metadata;
                            const isLastRow = index === SIZE_BIN_ORDER.length - 1;

                            return (
                                <div
                                    key={sizeBand}
                                    className={`flex ${isLastRow ? '' : 'border-b border-background-muted'} h-40`}
                                >
                                    {/* Input Sample */}
                                    <div className="flex-1 px-2 py-3 text-center border-r border-background-muted min-w-32">
                                        <div className="flex flex-col items-center gap-1.5">
                                            {bandData?.inputImageUrl ? (
                                                <div className="relative w-24 h-24 bg-background-muted elevated rounded-sm overflow-hidden pointer-events-none select-none">
                                                    <MemoizedImage
                                                        src={bandData.inputImageUrl}
                                                        alt={`Input sample for ${sizeBand}`}
                                                        fill
                                                        className="object-contain pixelated-image pointer-events-none select-none"
                                                        unoptimized
                                                        onError={(e) => {
                                                            console.error("Failed to load input image:", bandData.inputImageUrl);
                                                        }}
                                                        onLoad={(e) => {
                                                            const img = e.currentTarget;
                                                            if (bandData && !bandData.metadata) {
                                                                const newData = new Map(data);
                                                                const updated = newData.get(sizeBand);
                                                                if (updated) {
                                                                    const classId = SIZE_BAND_TO_CLASS_ID[sizeBand] ?? 4;
                                                                    updated.metadata = {
                                                                        object_width: img.naturalWidth,
                                                                        object_height: img.naturalHeight,
                                                                        object_class_id: classId,
                                                                    };
                                                                    setData(newData);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-background-muted elevated rounded-sm flex items-center justify-center text-foreground-muted text-xs">
                                                    No image
                                                </div>
                                            )}
                                            {metadata && (
                                                <div className="text-xs text-foreground-muted">
                                                    <div className="font-medium">{metadata.object_width} × {metadata.object_height} px</div>
                                                    {metadata.object_class_id !== undefined && (
                                                        <div className="text-[0.5625rem] mt-0.5 opacity-75">Class: {CLASS_NAMES[metadata.object_class_id - 1]}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Backbone Output */}
                                    <div className="flex-1 px-2 py-3 text-center border-r border-background-muted min-w-32">
                                        <div className="flex flex-col items-center gap-1.5">
                                            {bandData?.backboneImageUrl ? (
                                                <div className="relative w-24 h-24 bg-background-muted elevated rounded-sm overflow-hidden pointer-events-none select-none">
                                                    <MemoizedImage
                                                        src={bandData.backboneImageUrl}
                                                        alt={`Backbone output for ${sizeBand}`}
                                                        fill
                                                        className="object-contain pixelated-image pointer-events-none select-none"
                                                        unoptimized
                                                        onError={(e) => {
                                                            console.error("Failed to load backbone image:", bandData.backboneImageUrl);
                                                        }}
                                                        onLoad={(e) => {
                                                            const img = e.currentTarget;
                                                            if (bandData && !bandData.backboneDimensions) {
                                                                const newData = new Map(data);
                                                                const updated = newData.get(sizeBand);
                                                                if (updated) {
                                                                    updated.backboneDimensions = `${img.naturalWidth} × ${img.naturalHeight}`;
                                                                    setData(newData);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-background-muted elevated rounded-sm flex items-center justify-center text-foreground-muted text-xs">
                                                    No image
                                                </div>
                                            )}
                                            {bandData?.backboneDimensions ? (
                                                <div className="text-[10px] text-foreground-muted font-medium">
                                                    {bandData.backboneDimensions}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-foreground-muted opacity-50 animate-pulse">
                                                    Loading...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* FPN Output */}
                                    <div className="flex-1 px-2 py-3 text-center min-w-32">
                                        <div className="flex flex-col items-center gap-1.5">
                                            {bandData?.fpnImageUrl ? (
                                                <div className="relative w-24 h-24 bg-background-muted elevated rounded-sm overflow-hidden pointer-events-none select-none">
                                                    <MemoizedImage
                                                        src={bandData.fpnImageUrl}
                                                        alt={`FPN output for ${sizeBand}`}
                                                        fill
                                                        className="object-contain pixelated-image pointer-events-none select-none"
                                                        unoptimized
                                                        onError={(e) => {
                                                            console.error("Failed to load FPN image:", bandData.fpnImageUrl);
                                                        }}
                                                        onLoad={(e) => {
                                                            const img = e.currentTarget;
                                                            if (bandData && !bandData.fpnDimensions) {
                                                                const newData = new Map(data);
                                                                const updated = newData.get(sizeBand);
                                                                if (updated) {
                                                                    updated.fpnDimensions = `${img.naturalWidth} × ${img.naturalHeight}`;
                                                                    setData(newData);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-background-muted elevated rounded-sm flex items-center justify-center text-foreground-muted text-xs">
                                                    No image
                                                </div>
                                            )}
                                            {bandData?.fpnDimensions ? (
                                                <div className="text-[10px] text-foreground-muted font-medium">
                                                    {bandData.fpnDimensions}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-foreground-muted opacity-50 animate-pulse">
                                                    Loading...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeatureMapGrid;
