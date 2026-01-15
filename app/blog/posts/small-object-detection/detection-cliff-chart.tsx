"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
    ReferenceLine,
    ReferenceArea,
    Legend,
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

// Model colors - distinct colors for each variant (shared between v8 and v11)
const MODEL_COLORS: Record<string, string> = {
    yolov8n: "#CE9178", // Orange/brown
    yolov8s: "#4EC9B0", // Teal
    yolov8m: "#569CD6", // Blue
    yolov8l: "#DCDCAA", // Yellow
    yolov8x: "#C586C0", // Purple
    yolo11n: "#CE9178", // Orange/brown
    yolo11s: "#4EC9B0", // Teal
    yolo11m: "#569CD6", // Blue
    yolo11l: "#DCDCAA", // Yellow
    yolo11x: "#C586C0", // Purple
};

// Model display names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
    yolov8n: "YOLOv8n",
    yolov8s: "YOLOv8s",
    yolov8m: "YOLOv8m",
    yolov8l: "YOLOv8l",
    yolov8x: "YOLOv8x",
    yolo11n: "YOLOv11n",
    yolo11s: "YOLOv11s",
    yolo11m: "YOLOv11m",
    yolo11l: "YOLOv11l",
    yolo11x: "YOLOv11x",
};

// Model variants
const YOLOV8_MODELS = ["yolov8n", "yolov8s", "yolov8m", "yolov8l", "yolov8x"];
const YOLOV11_MODELS = ["yolo11n", "yolo11s", "yolo11m", "yolo11l", "yolo11x"];

interface DetectionData {
    Model: string;
    [key: string]: string | number; // Size bins as keys
}

// Embedded CSV data for 640px - moved outside component to avoid recreation
const CSV_DATA_640 = `Model,Insufficient,Very Tiny,Tiny,Very Small,Small,Medium Small,Medium,Medium Large,Large
yolov8n,0.0,0.1,2.7,9.5,15.4,25.3,43.2,69.2,83.0
yolov8s,0.0,0.6,6.5,17.9,24.6,35.1,53.3,78.3,88.7
yolov8m,0.0,1.3,10.3,22.9,30.6,40.7,58.4,83.8,91.5
yolov8l,0.0,1.5,10.5,22.1,28.5,38.2,55.9,84.2,92.5
yolov8x,0.0,2.7,14.1,26.6,31.9,41.1,57.7,85.1,93.4
yolo11n,0.0,0.1,2.0,9.9,17.1,25.8,42.9,69.9,84.9
yolo11s,0.0,0.9,7.8,18.6,25.4,34.3,53.3,79.6,89.6
yolo11m,0.0,1.0,8.6,19.4,25.5,35.1,53.9,82.8,90.6
yolo11l,0.0,1.8,10.6,22.5,28.5,38.1,56.1,82.1,91.5
yolo11x,0.0,1.8,12.1,23.0,27.4,34.7,51.0,82.4,94.3`;

// Embedded CSV data for 1024px
const CSV_DATA_1024 = `Model,Insufficient,Very Tiny,Tiny,Very Small,Small,Medium Small,Medium,Medium Large,Large
yolov8n,0.0,1.4,11.1,22.7,28.9,37.5,55.8,75.3,84.0
yolov8s,0.0,3.2,17.3,31.1,37.7,46.8,64.6,82.7,88.7
yolov8m,0.0,4.3,20.4,33.8,42.4,50.6,67.5,88.0,92.5
yolov8l,0.1,4.3,19.5,32.1,38.7,48.0,65.4,88.9,94.3
yolov8x,0.2,5.8,22.6,33.7,38.7,47.9,66.1,89.2,95.3
yolo11n,0.0,1.3,11.6,23.9,29.8,38.9,55.8,79.4,80.2
yolo11s,0.0,3.4,18.0,30.2,35.4,43.4,61.4,85.3,92.5
yolo11m,0.0,4.4,20.1,32.5,37.8,46.8,65.4,87.7,94.3
yolo11l,0.1,5.8,23.1,34.9,39.3,47.9,65.8,88.4,94.3
yolo11x,0.1,7.7,26.6,37.1,41.0,48.4,65.3,88.9,95.3`;

// Helper function to parse CSV data
const parseCSVData = (csvData: string): DetectionData[] => {
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const data: DetectionData[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length === headers.length) {
            const entry: DetectionData = { Model: values[0].toLowerCase() };
            for (let j = 1; j < headers.length; j++) {
                entry[headers[j]] = parseFloat(values[j]) || 0;
            }
            data.push(entry);
        }
    }

    return data;
};

// Pre-parse CSV data for both image sizes
const PARSED_DETECTION_DATA_640 = parseCSVData(CSV_DATA_640);
const PARSED_DETECTION_DATA_1024 = parseCSVData(CSV_DATA_1024);

// Create lookup maps for O(1) access - keyed by image size
const DETECTION_DATA_MAP_640 = new Map<string, DetectionData>();
PARSED_DETECTION_DATA_640.forEach((d) => {
    DETECTION_DATA_MAP_640.set(d.Model.toLowerCase(), d);
});

const DETECTION_DATA_MAP_1024 = new Map<string, DetectionData>();
PARSED_DETECTION_DATA_1024.forEach((d) => {
    DETECTION_DATA_MAP_1024.set(d.Model.toLowerCase(), d);
});

// Helper function to get model size variant (N, S, M, L, XL) from model name
const getModelSizeVariant = (modelName: string): string => {
    const lastChar = modelName.slice(-1).toLowerCase();
    const sizeMap: Record<string, string> = {
        n: "N",
        s: "S",
        m: "M",
        l: "L",
        x: "XL",
    };
    return sizeMap[lastChar] || lastChar.toUpperCase();
};

// Helper function to find the threshold bin where a model's recall falls below 25%
// When going from larger objects (right) to smaller objects (left), find the rightmost bin
// that's still >= 25% - this marks the threshold where performance is about to fall below 25%
// Returns the bin marking the threshold, or null if it never reaches 25% or never falls below
const findThresholdBin = (modelData: DetectionData | undefined): string | null => {
    if (!modelData) return null;

    // Find the rightmost bin that's still >= 25% (going from large to small objects)
    // This marks the threshold before it falls below 25%
    let lastAboveThreshold: string | null = null;
    for (let i = SIZE_BIN_ORDER.length - 1; i >= 0; i--) {
        const bin = SIZE_BIN_ORDER[i];
        const recall = modelData[bin] as number;
        if (recall >= 25) {
            lastAboveThreshold = bin;
        } else if (lastAboveThreshold !== null) {
            // We found a bin < 25% and we had a bin >= 25% before it
            // Return the last bin that was >= 25% (the threshold)
            return lastAboveThreshold;
        }
    }

    // If we never found a transition (all >= 25% or all < 25%), return null
    return null;
};

// Toggle component for switching between YOLOv8 and YOLOv11, and image sizes - memoized
const ToggleControls = React.memo(({
    isYOLOv11,
    setIsYOLOv11,
    imgsz,
    setImgsz,
}: {
    isYOLOv11: boolean;
    setIsYOLOv11: (isYOLOv11: boolean) => void;
    imgsz: 640 | 1024;
    setImgsz: (imgsz: 640 | 1024) => void;
}) => {
    const handleModelClick = React.useCallback(() => {
        setIsYOLOv11(!isYOLOv11);
    }, [isYOLOv11, setIsYOLOv11]);

    const handleImgszClick = React.useCallback(() => {
        setImgsz(imgsz === 640 ? 1024 : 640);
    }, [imgsz, setImgsz]);

    const modelVersion = isYOLOv11 ? "YOLOv11" : "YOLOv8";

    return (
        <div className="w-full flex gap-4 justify-between items-center">
            <span className="text-foreground-highlight">
                {modelVersion} @ {imgsz}px input
            </span>
            <div className="flex gap-2">
                <button
                    className="bg-background-muted hover:bg-background-highlight elevated py-1 px-1.5 rounded-sm"
                    onClick={handleImgszClick}
                >
                    <div className="flex gap-1 justify-center items-center text-xs font-medium">
                        Toggle imgsz
                    </div>
                </button>
                <button
                    className="bg-background-muted hover:bg-background-highlight elevated py-1 px-1.5 rounded-sm"
                    onClick={handleModelClick}
                >
                    <div className="flex gap-1 justify-center items-center text-xs font-medium">
                        Toggle model
                    </div>
                </button>
            </div>
        </div>
    );
});
ToggleControls.displayName = "ToggleControls";

function DetectionCliffChart() {
    const [mounted, setMounted] = React.useState(false);
    const [isYOLOv11, setIsYOLOv11] = React.useState(false);
    const [imgsz, setImgsz] = React.useState<640 | 1024>(640);
    const { theme } = useTheme();

    // Handle hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Determine which models to display based on toggle - memoized
    const modelsToDisplay = React.useMemo(
        () => isYOLOv11 ? YOLOV11_MODELS : YOLOV8_MODELS,
        [isYOLOv11]
    );

    // Get the appropriate data map based on image size
    const dataMap = React.useMemo(
        () => imgsz === 640 ? DETECTION_DATA_MAP_640 : DETECTION_DATA_MAP_1024,
        [imgsz]
    );

    // Transform data for chart - memoized with lookup map for O(1) access
    const chartData = React.useMemo(() => {
        return SIZE_BIN_ORDER.map((bin) => {
            const entry: any = { "Size Bin": bin };
            modelsToDisplay.forEach((model) => {
                const modelData = dataMap.get(model);
                entry[model] = modelData ? (modelData[bin] as number) : 0;
            });
            return entry;
        });
    }, [modelsToDisplay, dataMap]);

    // Calculate threshold bins for each model (where recall falls below 25%) - memoized
    const modelThresholds = React.useMemo(() => {
        const thresholds: Map<string, string> = new Map();
        modelsToDisplay.forEach((model) => {
            const modelData = dataMap.get(model);
            const thresholdBin = findThresholdBin(modelData);
            if (thresholdBin) {
                thresholds.set(model, thresholdBin);
            }
        });
        return thresholds;
    }, [modelsToDisplay, dataMap]);

    // Group models by threshold bin to avoid overlapping lines - memoized
    const groupedThresholds = React.useMemo(() => {
        const groups: Map<string, string[]> = new Map();
        modelsToDisplay.forEach((model) => {
            const thresholdBin = modelThresholds.get(model);
            if (thresholdBin) {
                const existing = groups.get(thresholdBin) || [];
                existing.push(model);
                groups.set(thresholdBin, existing);
            }
        });
        return groups;
    }, [modelsToDisplay, modelThresholds]);

    // Format size bin label with pixel range - memoized
    const formatSizeBinLabel = React.useCallback((sizeBin: string) => {
        const pixelRange = SIZE_BIN_PIXEL_RANGES[sizeBin] || "";
        return pixelRange ? `${sizeBin}\n(${pixelRange})` : sizeBin;
    }, []);

    // Custom tick component for two-line labels - memoized
    const CustomTick = React.memo((props: any) => {
        const { x, y, payload } = props;
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
                    fontSize={11}
                    transform="rotate(-45)"
                >
                    <tspan x={0} dy="0">{sizeBin}</tspan>
                    {pixelRange && <tspan x={0} dy="1.2em">{pixelRange}</tspan>}
                </text>
            </g>
        );
    });
    CustomTick.displayName = "CustomTick";

    // Custom tooltip - memoized
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
                        fontWeight: "600",
                    }}
                >
                    {label ? formatSizeBinLabel(label) : label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {payload.map((entry, index) => {
                        const modelName = entry.dataKey as string;
                        const color = MODEL_COLORS[modelName] || "#D4D4D4";
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
                                <span>
                                    {MODEL_DISPLAY_NAMES[modelName] || modelName}:{" "}
                                    {entry.value?.toFixed(1)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    });
    CustomTooltip.displayName = "CustomTooltip";

    const handleModelToggleChange = React.useCallback((newValue: boolean) => {
        setIsYOLOv11(newValue);
    }, []);

    const handleImgszChange = React.useCallback((newImgsz: 640 | 1024) => {
        setImgsz(newImgsz);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Toggle */}
            <ToggleControls
                isYOLOv11={isYOLOv11}
                setIsYOLOv11={handleModelToggleChange}
                imgsz={imgsz}
                setImgsz={handleImgszChange}
            />
            {/* Chart */}
            <ResponsiveContainer width="100%" height={500} key={`${theme}-${isYOLOv11}-${imgsz}`}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="unreliableZone" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(244, 135, 113, 0.2)" />
                            <stop offset="100%" stopColor="rgba(244, 135, 113, 0.1)" />
                        </linearGradient>
                    </defs>
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
                        label={{
                            value: "Object width",
                            position: "insideBottom",
                            offset: -5,
                            fill: "var(--color-foreground)",
                        }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
                        tickFormatter={(value) => `${value}%`}
                    >
                        <Label
                            style={{
                                textAnchor: "middle",
                                fill: "var(--color-foreground)",
                            }}
                            position="insideLeft"
                            angle={270}
                            value="Recall (%)"
                        />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    {/* Reference line at 25% recall */}
                    <ReferenceLine
                        y={25}
                        stroke="var(--color-foreground-muted)"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        label={{ value: "25% Recall", position: "right", fill: "var(--color-foreground)", fontSize: 11 }}
                    />
                    {/* Vertical reference lines for each model showing where recall falls below 25% */}
                    {Array.from(groupedThresholds.entries()).map(([thresholdBin, models]) => {
                        // Get size variants for all models in this group
                        const sizeVariants = models
                            .map((model) => getModelSizeVariant(model))
                            .join("/");

                        return (
                            <ReferenceLine
                                key={`threshold-${thresholdBin}-${models.join("-")}`}
                                x={thresholdBin}
                                stroke={"var(--color-foreground-muted)"}
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                label={{
                                    value: sizeVariants,
                                    position: "top",
                                    fill: "var(--color-foreground-muted)",
                                    fontSize: 10,
                                    offset: 5,
                                }}
                            />
                        );
                    })}
                    {/* Shaded area for unreliable detection zone (recall < 25%) - using custom background */}
                    <ReferenceArea
                        y1={0}
                        y2={25}
                        fill="url(#unreliableZone)"
                        stroke="none"
                        ifOverflow="visible"
                    />
                    {/* Lines for each model */}
                    {modelsToDisplay.map((model) => (
                        <Line
                            key={model}
                            type="monotone"
                            dataKey={model}
                            stroke={MODEL_COLORS[model]}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 6 }}
                            name={MODEL_DISPLAY_NAMES[model]}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default DetectionCliffChart;
