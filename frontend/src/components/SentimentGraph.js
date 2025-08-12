// components/SentimentGraph.js
import React, { useEffect, useRef } from 'react';

const SentimentGraph = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      // Simple sentiment visualization without Chart.js dependency
      const ctx = chartRef.current.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
      
      // Count emotions
      const emotionCounts = data.reduce((acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
        return acc;
      }, {});

      // Draw simple bar chart
      const emotions = Object.keys(emotionCounts);
      const maxCount = Math.max(...Object.values(emotionCounts));
      const barWidth = chartRef.current.width / emotions.length;
      
      emotions.forEach((emotion, index) => {
        const barHeight = (emotionCounts[emotion] / maxCount) * (chartRef.current.height - 40);
        const x = index * barWidth;
        const y = chartRef.current.height - barHeight - 20;
        
        // Draw bar
        ctx.fillStyle = `hsl(${index * 60}, 70%, 60%)`;
        ctx.fillRect(x + 10, y, barWidth - 20, barHeight);
        
        // Draw emotion
        ctx.fillStyle = '#333';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(emotion, x + barWidth/2, chartRef.current.height - 5);
        
        // Draw count
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText(emotionCounts[emotion], x + barWidth/2, y - 5);
      });
    }
  }, [data]);

  return (
    <div className="sentiment-graph">
      <h3>Live Audience Sentiment</h3>
      <canvas 
        ref={chartRef} 
        width="300" 
        height="200"
        style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
      />
      {data.length === 0 && (
        <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>
          No reactions yet
        </p>
      )}
    </div>
  );
};

export default SentimentGraph;
