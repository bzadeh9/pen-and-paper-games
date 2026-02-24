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

// Eraser cursor: a small rectangle with a dividing line
const ERASER_CURSOR =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'><rect x='2' y='6' width='18' height='12' rx='2' fill='%23f1f5f9' stroke='%23374151' stroke-width='1.5'/><line x1='11' y1='6' x2='11' y2='18' stroke='%23374151' stroke-width='1'/></svg>\") 11 14, cell";

export interface DrawingCanvasHandle {
  reset: () => void;
  undo: () => void;
}

interface DrawingCanvasProps {
  color: string;
  lineWidth?: number;
  disabled?: boolean;
  erasing?: boolean;
  flipped?: boolean;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas(
    { color, lineWidth = 3, disabled = false, erasing = false, flipped = false },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const historyRef = useRef<ImageData[]>([]);

    const initCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = PAPER_COLOR;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      historyRef.current = [];
    }, []);

    useEffect(() => {
      initCanvas();
    }, [initCanvas]);

    const undo = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (historyRef.current.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const snapshot = historyRef.current.pop();
      if (snapshot) {
        ctx.putImageData(snapshot, 0, 0);
      }
    }, []);

    useImperativeHandle(ref, () => ({ reset: initCanvas, undo }), [initCanvas, undo]);

    // When the canvas is CSS-rotated 180°, the visual top-left maps to the
    // canvas coordinate bottom-right, so coordinates must be inverted.
    const getPos = useCallback(
      (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        let clientX: number, clientY: number;
        if ('touches' in e) {
          const touch = e.touches[0];
          clientX = touch.clientX;
          clientY = touch.clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        const rawX = (clientX - rect.left) * scaleX;
        const rawY = (clientY - rect.top) * scaleY;
        if (flipped) {
          return { x: CANVAS_WIDTH - rawX, y: CANVAS_HEIGHT - rawY };
        }
        return { x: rawX, y: rawY };
      },
      [flipped]
    );

    const startDrawing = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Save snapshot before each stroke so it can be undone
        historyRef.current.push(ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
        isDrawingRef.current = true;
        const pos = getPos(e.nativeEvent as MouseEvent | TouchEvent, canvas);
        lastPosRef.current = pos;
        // Draw a filled dot at the starting point
        const dotRadius = erasing ? (lineWidth * 3) / 2 : lineWidth / 2;
        ctx.fillStyle = erasing ? PAPER_COLOR : color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      },
      [color, lineWidth, disabled, erasing, getPos]
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
          ctx.strokeStyle = erasing ? PAPER_COLOR : color;
          ctx.lineWidth = erasing ? lineWidth * 3 : lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }
        lastPosRef.current = pos;
      },
      [color, lineWidth, disabled, erasing, getPos]
    );

    const stopDrawing = useCallback(() => {
      isDrawingRef.current = false;
      lastPosRef.current = null;
    }, []);

    const activeCursor = disabled
      ? 'default'
      : erasing
        ? ERASER_CURSOR
        : PENCIL_CURSOR;

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
          cursor: activeCursor,
          display: 'block',
          transform: flipped ? 'rotate(180deg)' : undefined,
          transition: 'transform 0.4s ease',
        }}
        aria-label="Drawing canvas"
      />
    );
  }
);
