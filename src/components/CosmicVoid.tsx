'use client';

import React, { useState, useEffect } from 'react';

export function CosmicVoid() {
  const [mounted, setMounted] = useState(false);
  const [stars] = useState(() => 
    Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3}px`,
      duration: `${2 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="cosmic-void no-print" />;
  }

  return (
    <div className="cosmic-void no-print">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
      <div className="nebula bg-purple-600/20 top-[-10%] left-[-10%]" />
      <div className="nebula bg-blue-600/20 bottom-[-10%] right-[-10%]" />
    </div>
  );
}
