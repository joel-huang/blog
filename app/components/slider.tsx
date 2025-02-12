"use client";

import ReactSlider from "react-slider";

const Slider = ({
  min,
  max,
  value,
  labels,
  onChange,
  onSliderClick,
}: {
  min?: number;
  max?: number;
  value?: number;
  labels?: { year: number; name: string }[];
  onChange?: (value: number) => void;
  onSliderClick?: () => void;
}) => {
  return (
    <div className="w-full px-4 py-10">
      <ReactSlider
        className="h-2 w-full bg-neutral-400 rounded-md"
        thumbClassName="w-4 h-4 bg-neutral-300 hover:bg-neutral-100 outline-none rounded-full -mt-1"
        trackClassName="track"
        markClassName="mark"
        marks={true}
        min={min}
        max={max}
        value={value}
        step={1}
        alignTracks={false}
        onSliderClick={onSliderClick}
        onChange={(value) => onChange && onChange(value)}
        renderThumb={(props, state) => {
          const { key, ...restProps } = props;
          const prop = { ...restProps };
          return (
            <div key={key} {...prop}>
              <div className="absolute w-fit text-nowrap -bottom-14 left-1/2 -translate-x-1/2 elevated px-2 py-1 rounded text-sm select-none">
                {labels ? (
                  <div className="flex flex-col items-center">
                    <span>{labels[state.valueNow].year}</span>
                    <span>{labels[state.valueNow].name}</span>
                  </div>
                ) : (
                  state.valueNow
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default Slider;
