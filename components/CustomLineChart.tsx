import React, { useRef, useEffect } from "react";
import { ScrollView, View } from "react-native";
import Svg, {
  Polyline,
  G,
  Text as SvgText,
  Rect,
  Circle,
} from "react-native-svg";

interface LineChartProps {
  data: number[];
  labels: string[];
  width: number;
  height: number;
}

const CustomLineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  width,
  height,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  const maxData = Math.max(...data);
  const minData = Math.min(...data);

  const dataRange = maxData - minData === 0 ? 1 : maxData - minData;

  const padding = 50;
  const topPadding = 0;
  const chartWidth = width * data.length + padding * 8;
  const chartHeight = height + 25;

  const verticalScalingFactor = 0.5;

  const points = data
    .map((value, index) => {
      const x =
        data.length === 1
          ? padding + (chartWidth - padding * 2) / 2
          : padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
      const y =
        topPadding +
        height -
        ((value - minData) / dataRange) * height * verticalScalingFactor;
      return isNaN(x) || isNaN(y) ? null : { x, y };
    })
    .filter((point): point is { x: number; y: number } => point !== null);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ minHeight: 310, maxHeight: 310 }}
    >
      <View style={{ backgroundColor: "#1F2831", height: 300 }}>
        <Svg width={chartWidth} height={chartHeight + 40}>
          <Rect
            x="0"
            y="0"
            width={chartWidth}
            height={chartHeight + 40}
            fill="#1F2831"
          />
          {points.length > 0 && (
            <>
              <Polyline
                points={points
                  .map((point) => `${point.x},${point.y}`)
                  .join(" ")}
                fill="none"
                stroke="#3FA1CA"
                strokeWidth="3"
              />
              {points.map((point, index) => (
                <Circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#3FA1CA"
                />
              ))}
            </>
          )}
          <G>
            {data.map((value, index) => {
              const x =
                data.length === 1
                  ? padding + (chartWidth - padding * 2) / 2
                  : padding +
                    (index / (data.length - 1)) * (chartWidth - padding * 2);
              const y =
                topPadding +
                height -
                ((value - minData) / dataRange) *
                  height *
                  verticalScalingFactor;
              if (isNaN(x) || isNaN(y)) {
                return null;
              }
              return (
                <SvgText
                  key={index}
                  x={x}
                  y={y - 20}
                  fontSize="14"
                  fill="#fff"
                  textAnchor="middle"
                >
                  {value.toFixed(1)}
                </SvgText>
              );
            })}
          </G>
          <G>
            {labels.map((label, index) => {
              const x =
                data.length === 1
                  ? padding + (chartWidth - padding * 2) / 2
                  : padding +
                    (index / (data.length - 1)) * (chartWidth - padding * 2);
              if (isNaN(x)) {
                return null;
              }
              return (
                <SvgText
                  key={index}
                  x={x}
                  y={chartHeight + 40}
                  fontSize="14"
                  fill="#fff"
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              );
            })}
          </G>
        </Svg>
      </View>
    </ScrollView>
  );
};

export default CustomLineChart;
