import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isActive: boolean;
}

const WaveformVisualizer = ({ isActive }: WaveformVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(12).fill(2));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(2));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 16 + 4));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-0.5 h-5">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-0.5 bg-primary rounded-full transition-all duration-100"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
