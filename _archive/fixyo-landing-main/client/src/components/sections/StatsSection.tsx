/* FixYo Stats Section — Warm Modernism
 * Full-width navy band with animated counters
 */
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 11, suffix: "+", label: "Trade Categories", description: "Plumbers to painters" },
  { value: 500, suffix: "+", label: "Tradies Onboard", description: "And growing fast" },
  { value: 14, suffix: "min", label: "Avg. Quote Time", description: "From job to sent quote" },
  { value: 100, suffix: "%", label: "Australian-Built", description: "GST-compliant by default" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="bg-[#1B2B4B] py-14">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${i < stats.length - 1 ? "lg:border-r lg:border-white/10" : ""}`}
            >
              <div className="font-['Sora'] font-extrabold text-4xl lg:text-5xl text-amber-400 mb-1">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-['Sora'] font-semibold text-white text-sm mb-1">{stat.label}</div>
              <div className="text-white/50 text-xs">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
