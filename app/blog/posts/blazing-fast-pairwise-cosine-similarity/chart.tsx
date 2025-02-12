"use client";

import { ChartLine, ChartSpline } from "lucide-react";
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
  Cell,
} from "recharts";

// Move data outside component to avoid reinitialization
const CHART_DATA = [
  { name: "scipy", time: 142362.0 },
  { name: "numpy", time: 112752.9 },
  { name: "torch", time: 83144.2 },
  { name: "sklearn", time: 401.8 },
  { name: "np matrix", time: 136.2 },
  { name: "✨ ours", time: 48.6 },
];

// Formatter utility moved outside component
const nFormatter = (num, digits) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast((item) => num >= item.value);
  return item
    ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol)
    : "0";
};

// Separate ToggleLog into its own component
const ToggleLog = ({
  isLog,
  setIsLog,
}: {
  isLog: boolean;
  setIsLog: (isLog: boolean) => void;
}) => {
  return (
    <div className="w-full flex gap-2 justify-end">
      <span className="text-neutral-200">{isLog ? "Log" : "Linear"}</span>
      <button
        className="bg-neutral-800 hover:bg-neutral-700 elevated py-1 px-1.5 rounded-sm"
        onClick={() => setIsLog(!isLog)}
      >
        {isLog ? (
          <div className="flex gap-1 justify-center items-center">
            <ChartSpline size={16} />
          </div>
        ) : (
          <div className="flex gap-1 justify-center items-center">
            <ChartLine size={16} />
          </div>
        )}
      </button>
    </div>
  );
};

function TimingChart() {
  const [isLog, setIsLog] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  // Handle hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server-side and first client render
  }

  const transformedData = CHART_DATA.map((d) => ({
    ...d,
    time: isLog ? Math.log(d.time) : d.time,
  }));

  return (
    <div className="flex flex-col gap-2">
      <ToggleLog isLog={isLog} setIsLog={setIsLog} />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={transformedData}>
          <CartesianGrid
            strokeDasharray="3 3"
            style={{
              stroke: "#222",
            }}
          />
          <XAxis
            dataKey="name"
            domain={["auto", "auto"]}
            tickFormatter={(value) =>
              value.length > 10 ? value.slice(0, 10) + "..." : value
            }
          >
            <Label dy={10} position="insideBottom" value="Method" />
          </XAxis>
          <YAxis tickFormatter={(value) => nFormatter(value, 1)}>
            <Label
              style={{
                textAnchor: "middle",
              }}
              position="insideLeft"
              angle={270}
              value={isLog ? "Log Time (µs)" : "Time (µs)"}
            />
          </YAxis>
          <Tooltip
            labelStyle={{
              color: "rgb(229, 229, 229)",
            }}
            itemStyle={{
              color: "rgb(229, 229, 229)",
            }}
            cursor={{ fill: "rgba(38, 38, 38, 0.25)" }}
            contentStyle={{
              backgroundColor: "rgb(38, 38, 38)",
              border: "none",
              boxShadow:
                "0px 3px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.18), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 1px rgba(255, 255, 255, 0.3)",
              borderRadius: "0.25rem",
            }}
            wrapperStyle={{
              transition: "all 100ms",
            }}
            formatter={(value) =>
              isLog
                ? `${nFormatter(Math.exp(value as number), 1)} µs`
                : `${nFormatter(value as number, 1)} µs`
            }
          />
          <Bar dataKey="time" fill="#000000">
            {CHART_DATA.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === CHART_DATA.length - 1 ? "#CE9178" : "#333"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TimingChart;
