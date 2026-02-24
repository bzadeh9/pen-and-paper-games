'use client';

import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  PAPER_COLOR,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '@/lib/games/scribbl/types';

// Pencil cursor: Heroicons "pencil" outline, 20×20, hotspot at tip (bottom-left)
const PENCIL_CURSOR =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' stroke='%23374151' stroke-width='1.5' fill='none'><path stroke-linecap='round' stroke-linejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125'/></svg>\") 2 18, crosshair";

export interface DrawingCanvasHandle {
  reset: () => void;
}

interface DrawingCanvasProps {
  color: string;
  lineWidth?: number;
  disabled?: boolean;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ color, lineWidth = 3, disabled = false }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);

    const initCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = PAPER_COLOR;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }, []);

    useEffect(() => {
      initCanvas();
    }, [initCanvas]);

    useImperativeHandle(ref, () => ({ reset: initCanvas }), [initCanvas]);

    const getPos = useCallback(
      (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        if ('touches' in e) {
          const touch = e.touches[0];
          return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY,
          };
        }
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      },
      []
    );

    const startDrawing = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        isDrawingRef.current = true;
        const pos = getPos(e.nativeEvent as MouseEvent | TouchEvent, canvas);
        lastPosRef.current = pos;
        // Draw a filled dot at the starting point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      },
      [color, lineWidth, disabled, getPos]
    );

    const draw = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingRef.current || disabled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const pos = getPos(e.nativeEvent as MouseEvent | TouchEvent, canvas);
        const last = lastPosRef.current;
        if (last) {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }
        lastPosRef.current = pos;
      },
      [color, lineWidth, disabled, getPos]
    );

    const stopDrawing = useCallback(() => {
      isDrawingRef.current = false;
      lastPosRef.current = null;
    }, []);

    return (
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full"
        style={{
          touchAction: 'none',
          cursor: disabled ? 'default' : PENCIL_CURSOR,
          display: 'block',
        }}
        aria-label="Drawing canvas"
      />
    );
  }
);
