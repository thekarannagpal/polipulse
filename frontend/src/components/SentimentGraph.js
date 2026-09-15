// components/SentimentGraph.js
import React, { useEffect, useRef } from 'react';

const SentimentGraph = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background with dark fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (data.length === 0) return;

    // Count emotions
    const emotionCounts = data.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {});

    const emotions = Object.keys(emotionCounts);
    if (emotions.length === 0) return;

    const maxCount = Math.max(...Object.values(emotionCounts));
    const padding = 30;
    const chartHeight = height - padding * 2;
    const barWidth = Math.min(45, (width - padding * 2) / emotions.length - 12);
    const totalBarsWidth = emotions.length * (barWidth + 12);
    const startX = (width - totalBarsWidth) / 2;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = height - padding - (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding / 2, y);
      ctx.lineTo(width - padding / 2, y);
      ctx.stroke();
    }

    // Draw bars
    emotions.forEach((emotion, index) => {
      const count = emotionCounts[emotion];
      const barHeight = Math.max(10, (count / maxCount) * chartHeight);
      const x = startX + index * (barWidth + 12);
      const y = height - padding - barHeight;

      // Create glowing gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
      const hue = (index * 60 + 220) % 360;
      gradient.addColorStop(0, `hsla(${hue}, 85%, 65%, 0.95)`);
      gradient.addColorStop(1, `hsla(${hue}, 85%, 45%, 0.3)`);

      ctx.fillStyle = gradient;

      // Draw rounded rectangle top
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
      ctx.lineTo(x + barWidth, height - padding);
      ctx.lineTo(x, height - padding);
      ctx.closePath();
      ctx.fill();

      // Draw emoji label below
      ctx.fillStyle = '#f3f4f6';
      ctx.font = '18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(emotion, x + barWidth / 2, height - 8);

      // Draw count value above bar
      ctx.fillStyle = '#9ca3af';
      ctx.font = '600 12px "Space Grotesk", sans-serif';
      ctx.fillText(count, x + barWidth / 2, y - 6);
    });
  }, [data]);

  return (
    <div className="sentiment-graph-card">
      <div className="card-title-bar">
        <h4>📊 Live Audience Sentiment Canvas</h4>
        <span className="live-dot-pulse"></span>
      </div>
      <div className="canvas-wrapper">
        <canvas 
          ref={chartRef} 
          width="320" 
          height="180"
          className="sentiment-canvas"
        />
        {data.length === 0 && (
          <div className="canvas-empty-overlay">
            <span className="empty-chart-icon">📈</span>
            <p>Audience reactions will render real-time emotional pulse here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentGraph;
