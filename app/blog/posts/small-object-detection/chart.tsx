"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
} from "recharts";
import { useTheme } from "@/app/providers/theme-provider";

// Size bin order for proper sorting
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

// Size bin to pixel range mapping
const SIZE_BIN_PIXEL_RANGES: Record<string, string> = {
    "Insufficient": "1–4 px",
    "Very Tiny": "5–9 px",
    "Tiny": "10–15 px",
    "Very Small": "16–23 px",
    "Small": "24–31 px",
    "Medium Small": "32–47 px",
    "Medium": "48–95 px",
    "Medium Large": "96–199 px",
    "Large": "200+ px",
};

// Color palette for different classes
const CLASS_COLORS = [
    "#CE9178",
    "#4EC9B0",
    "#569CD6",
    "#DCDCAA",
    "#C586C0",
    "#9CDCFE",
    "#D4D4D4",
    "#F48771",
    "#CE9178",
    "#4EC9B0",
];

interface SizeDistributionData {
    Class: string;
    "Size Bin": string;
    Count: number;
}

// Embedded CSV data - moved outside component to avoid recreation
const CSV_DATA = `Class,Size Bin,Count
pedestrian,Insufficient,457
pedestrian,Very Tiny,3167
pedestrian,Tiny,2764
pedestrian,Very Small,1610
pedestrian,Small,539
pedestrian,Medium Small,246
pedestrian,Medium,56
pedestrian,Medium Large,5
pedestrian,Large,0
people,Insufficient,228
people,Very Tiny,1411
people,Tiny,1609
people,Very Small,1138
people,Small,501
people,Medium Small,199
people,Medium,37
people,Medium Large,2
people,Large,0
bicycle,Insufficient,24
bicycle,Very Tiny,198
bicycle,Tiny,262
bicycle,Very Small,277
bicycle,Small,222
bicycle,Medium Small,218
bicycle,Medium,82
bicycle,Medium Large,4
bicycle,Large,0
car,Insufficient,65
car,Very Tiny,814
car,Tiny,1385
car,Very Small,1927
car,Small,1694
car,Medium Small,2757
car,Medium,3968
car,Medium Large,1376
car,Large,78
van,Insufficient,11
van,Very Tiny,96
van,Tiny,179
van,Very Small,261
van,Small,273
van,Medium Small,443
van,Medium,539
van,Medium Large,166
van,Large,7
truck,Insufficient,0
truck,Very Tiny,33
truck,Tiny,70
truck,Very Small,91
truck,Small,66
truck,Medium Small,157
truck,Medium,215
truck,Medium Large,106
truck,Large,12
tricycle,Insufficient,8
tricycle,Very Tiny,80
tricycle,Tiny,122
tricycle,Very Small,180
tricycle,Small,158
tricycle,Medium Small,227
tricycle,Medium,241
tricycle,Medium Large,29
tricycle,Large,0
awning-tricycle,Insufficient,2
awning-tricycle,Very Tiny,43
awning-tricycle,Tiny,55
awning-tricycle,Very Small,110
awning-tricycle,Small,95
awning-tricycle,Medium Small,117
awning-tricycle,Medium,101
awning-tricycle,Medium Large,8
awning-tricycle,Large,1
bus,Insufficient,1
bus,Very Tiny,18
bus,Tiny,29
bus,Very Small,37
bus,Small,34
bus,Medium Small,49
bus,Medium,47
bus,Medium Large,29
bus,Large,7
motor,Insufficient,120
motor,Very Tiny,879
motor,Tiny,952
motor,Very Small,1117
motor,Small,754
motor,Medium Small,734
motor,Medium,318
motor,Medium Large,11
motor,Large,1`;

// Pre-parse CSV data once
const PARSED_SIZE_DATA: SizeDistributionData[] = (() => {
    const lines = CSV_DATA.trim().split("\n");
    const data: SizeDistributionData[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length === 3) {
            data.push({
                Class: values[0],
                "Size Bin": values[1],
                Count: parseInt(values[2], 10),
            });
        }
    }

    return data;
})();

// Create lookup map for O(1) access: Map<Class, Map<SizeBin, Count>>
const SIZE_DATA_MAP = new Map<string, Map<string, number>>();
PARSED_SIZE_DATA.forEach((d) => {
    if (!SIZE_DATA_MAP.has(d.Class)) {
        SIZE_DATA_MAP.set(d.Class, new Map());
    }
    SIZE_DATA_MAP.get(d.Class)!.set(d["Size Bin"], d.Count);
});

// Pre-compute unique classes
const UNIQUE_CLASSES = Array.from(new Set(PARSED_SIZE_DATA.map((d) => d.Class))).sort();

function SizeDistributionChart() {
    const [mounted, setMounted] = React.useState(false);
    const [selectedClasses, setSelectedClasses] = React.useState<Set<string>>(
        new Set(UNIQUE_CLASSES)
    );
    const { theme } = useTheme();

    // Handle hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Toggle class selection - memoized
    const toggleClass = React.useCallback((className: string) => {
        setSelectedClasses((prev) => {
            const newSelected = new Set(prev);
            if (newSelected.has(className)) {
                newSelected.delete(className);
            } else {
                newSelected.add(className);
            }
            return newSelected;
        });
    }, []);

    // Get class color by name - memoized
    const getClassColor = React.useCallback((className: string) => {
        const idx = UNIQUE_CLASSES.indexOf(className);
        return CLASS_COLORS[idx % CLASS_COLORS.length];
    }, []);

    // Format size bin label with pixel range - memoized
    const formatSizeBinLabel = React.useCallback((sizeBin: string) => {
        const pixelRange = SIZE_BIN_PIXEL_RANGES[sizeBin] || "";
        return pixelRange ? `${sizeBin} (${pixelRange})` : sizeBin;
    }, []);

    // Group by size bin for stacked bar chart - memoized with O(1) lookup
    const chartData = React.useMemo(() => {
        return SIZE_BIN_ORDER.map((bin) => {
            const entry: any = { "Size Bin": bin };
            UNIQUE_CLASSES.forEach((cls) => {
                if (selectedClasses.has(cls)) {
                    const classMap = SIZE_DATA_MAP.get(cls);
                    entry[cls] = classMap?.get(bin) || 0;
                }
            });
            return entry;
        });
    }, [selectedClasses]);

    // Custom tick component for two-line labels - memoized
    const CustomTick = React.memo((props: any) => {
        const { x, y, payload } = props;
        // In Recharts XAxis, payload.value contains the value from dataKey
        const sizeBin = payload?.value;

        if (!sizeBin || !SIZE_BIN_ORDER.includes(sizeBin)) return null;

        const pixelRange = SIZE_BIN_PIXEL_RANGES[sizeBin] || "";

        return (
            <g transform={`translate(${x},${y + 5})`}>
                <text
                    x={0}
                    y={0}
                    textAnchor="end"
                    fill="var(--color-foreground)"
                    fontSize={12}
                    transform="rotate(-45)"
                >
                    <tspan x={0} dy="0">{sizeBin}</tspan>
                    {pixelRange && <tspan x={0} dy="1.2em">{pixelRange}</tspan>}
                </text>
            </g>
        );
    });
    CustomTick.displayName = "CustomTick";

    // Custom tooltip with colored squares - memoized
    const CustomTooltip = React.memo(({
        active,
        payload,
        label,
    }: {
        active?: boolean;
        payload?: any[];
        label?: string;
    }) => {
        if (!active || !payload || !payload.length) {
            return null;
        }

        return (
            <div
                style={{
                    backgroundColor: "var(--color-background-muted)",
                    border: "none",
                    boxShadow:
                        "0px 3px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.18), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 1px rgba(255, 255, 255, 0.3)",
                    borderRadius: "0.25rem",
                    padding: "8px 12px",
                }}
            >
                <p
                    style={{
                        color: "var(--color-foreground)",
                        fontSize: "12px",
                        marginBottom: "4px",
                        marginTop: 0,
                    }}
                >
                    {label ? formatSizeBinLabel(label) : label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {payload.map((entry, index) => {
                        const color = getClassColor(entry.dataKey);
                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "11px",
                                    color: "var(--color-foreground)",
                                    lineHeight: "1.2",
                                }}
                            >
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        backgroundColor: color,
                                        flexShrink: 0,
                                    }}
                                />
                                <span>{entry.dataKey}: {entry.value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    });
    CustomTooltip.displayName = "CustomTooltip";

    // Memoize filtered classes for bars
    const filteredClasses = React.useMemo(
        () => UNIQUE_CLASSES.filter((cls) => selectedClasses.has(cls)),
        [selectedClasses]
    );

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={500} key={theme}>
                <BarChart data={chartData}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        style={{
                            stroke: "var(--color-foreground-muted)",
                            opacity: 0.3,
                        }}
                    />
                    <XAxis
                        dataKey="Size Bin"
                        tick={(props) => <CustomTick {...props} />}
                        height={100}
                        interval={0}
                        label={{ value: "Object width", position: "insideBottom", offset: -5, fill: "var(--color-foreground)" }}
                    >
                    </XAxis>
                    <YAxis tick={{ fill: "var(--color-foreground)", fontSize: 12 }}>
                        <Label
                            style={{
                                textAnchor: "middle",
                                fill: "var(--color-foreground)",
                            }}
                            position="insideLeft"
                            angle={270}
                            value="Count"
                        />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#CE9178", opacity: 0.1 }} />
                    {filteredClasses.map((cls, idx) => {
                        const classIdx = UNIQUE_CLASSES.indexOf(cls);
                        return (
                            <Bar
                                key={cls}
                                dataKey={cls}
                                stackId="a"
                                fill={CLASS_COLORS[classIdx % CLASS_COLORS.length]}
                            />
                        );
                    })}
                </BarChart>
            </ResponsiveContainer>

            {/* Class selector buttons below chart */}
            <div className="flex flex-wrap gap-2 justify-center">
                {UNIQUE_CLASSES.map((cls, idx) => (
                    <button
                        key={cls}
                        className={`px-2 py-1 rounded-sm text-xs ${selectedClasses.has(cls)
                            ? "bg-background-highlight"
                            : "bg-background-muted hover:bg-background-highlight opacity-50"
                            }`}
                        onClick={() => toggleClass(cls)}
                        style={{
                            backgroundColor: selectedClasses.has(cls)
                                ? CLASS_COLORS[idx % CLASS_COLORS.length] + "40"
                                : undefined,
                            border: selectedClasses.has(cls)
                                ? `1px solid ${CLASS_COLORS[idx % CLASS_COLORS.length]}`
                                : undefined,
                        }}
                    >
                        {cls}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SizeDistributionChart;
