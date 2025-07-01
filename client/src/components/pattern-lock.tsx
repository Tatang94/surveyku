import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
  id: number;
}

interface PatternLockProps {
  size?: number;
  gridSize?: number;
  onPatternChange?: (pattern: number[]) => void;
  onPatternComplete?: (pattern: number[]) => void;
  disabled?: boolean;
  showPath?: boolean;
  className?: string;
  minLength?: number;
  resetTrigger?: boolean;
}

export default function PatternLock({
  size = 300,
  gridSize = 3,
  onPatternChange,
  onPatternComplete,
  disabled = false,
  showPath = true,
  className,
  minLength = 4,
  resetTrigger
}: PatternLockProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPos, setCurrentPos] = useState<Point | null>(null);
  const [paths, setPaths] = useState<Point[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dotSize = 12;
  const spacing = size / (gridSize + 1);

  // Generate dot positions
  const dots = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    return {
      id: i + 1,
      x: spacing * (col + 1),
      y: spacing * (row + 1)
    };
  });

  // Reset pattern when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      resetPattern();
    }
  }, [resetTrigger]);

  const resetPattern = () => {
    setPattern([]);
    setPaths([]);
    setCurrentPos(null);
    setIsDrawing(false);
    clearCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const drawPath = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showPath) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (paths.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(paths[0].x, paths[0].y);
      
      for (let i = 1; i < paths.length; i++) {
        ctx.lineTo(paths[i].x, paths[i].y);
      }

      if (currentPos && isDrawing) {
        ctx.lineTo(currentPos.x, currentPos.y);
      }

      ctx.stroke();
    }
  }, [paths, currentPos, isDrawing, showPath]);

  useEffect(() => {
    drawPath();
  }, [drawPath]);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0, id: 0 };

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      id: 0
    };
  };

  const getDotAtPosition = (pos: Point): Point | null => {
    for (const dot of dots) {
      const distance = Math.sqrt(
        Math.pow(pos.x - dot.x, 2) + Math.pow(pos.y - dot.y, 2)
      );
      if (distance <= dotSize * 2) {
        return dot;
      }
    }
    return null;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    
    const pos = getEventPos(e);
    const dot = getDotAtPosition(pos);
    
    if (dot && !pattern.includes(dot.id)) {
      setIsDrawing(true);
      const newPattern = [dot.id];
      const newPaths = [dot];
      
      setPattern(newPattern);
      setPaths(newPaths);
      setCurrentPos(pos);
      
      onPatternChange?.(newPattern);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    
    const pos = getEventPos(e);
    setCurrentPos(pos);
    
    const dot = getDotAtPosition(pos);
    if (dot && !pattern.includes(dot.id)) {
      const newPattern = [...pattern, dot.id];
      const newPaths = [...paths, dot];
      
      setPattern(newPattern);
      setPaths(newPaths);
      
      onPatternChange?.(newPattern);
    }
  };

  const handleEnd = () => {
    if (!isDrawing || disabled) return;
    
    setIsDrawing(false);
    setCurrentPos(null);
    
    if (pattern.length >= minLength) {
      onPatternComplete?.(pattern);
    } else {
      // Pattern too short, reset after a short delay
      setTimeout(() => {
        resetPattern();
      }, 500);
    }
  };

  return (
    <div className={cn("relative select-none", className)}>
      <div
        ref={containerRef}
        className="relative bg-gray-50 rounded-lg border border-gray-200"
        style={{ width: size, height: size }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Canvas for drawing paths */}
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="absolute inset-0 pointer-events-none"
        />
        
        {/* Dots */}
        {dots.map((dot) => (
          <div
            key={dot.id}
            className={cn(
              "absolute rounded-full border-2 transition-all duration-200",
              pattern.includes(dot.id)
                ? "bg-blue-500 border-blue-600 scale-110"
                : "bg-gray-300 border-gray-400 hover:bg-gray-400"
            )}
            style={{
              width: dotSize * 2,
              height: dotSize * 2,
              left: dot.x - dotSize,
              top: dot.y - dotSize,
            }}
          />
        ))}
      </div>

    </div>
  );
}