'use client';

import React, { useState, useRef, useCallback } from 'react';
import { GameIcon, gameColors } from '@/components/game-icon';
import {
  DrawingCanvas,
  type DrawingCanvasHandle,
} from '@/components/game/scribbl/drawing-canvas';
import { ColorPicker } from '@/components/game/scribbl/color-picker';
import { DRAW_COLORS, type GamePhase, type GameMode } from '@/lib/games/scribbl/types';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils';

const PHASE_LABEL: Record<GamePhase, string> = {
  scribble: 'Player 1: Draw your scribble!',
  complete: 'Player 2: Complete the drawing!',
  done: '🎨 Artwork Complete!',
};

const PHASE_DESCRIPTION: Record<GamePhase, { normal: string; expert: string }> = {
  scribble: {
    normal: 'Draw a random scribble on the canvas. Keep it abstract!',
    expert: '🔄 Expert mode: the canvas is flipped! Draw knowing it will be revealed right-side-up.',
  },
  complete: {
    normal: 'Turn the scribble into a drawing. Be as creative as you like!',
    expert: '🔄 Expert mode: canvas is still flipped — complete the drawing!',
  },
  done: {
    normal: 'Wonderful! Look at the finished collaboration.',
    expert: 'Canvas flipped back — look at the finished collaboration!',
  },
};

const PHASE_BUTTON: Record<GamePhase, string> = {
  scribble: 'Done Scribbling →',
  complete: 'Done Drawing →',
  done: 'Play Again',
};

export default function ScribblPage() {
  const [phase, setPhase] = useState<GamePhase>('scribble');
  const [mode, setMode] = useState<GameMode>('normal');
  const [player1Color, setPlayer1Color] = useState(DRAW_COLORS[0].value);
  const [player2Color, setPlayer2Color] = useState(DRAW_COLORS[2].value);
  const [erasing, setErasing] = useState(false);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const isMobile = useMediaQuery('(max-width: 767px)');

  const currentColor = phase === 'scribble' ? player1Color : player2Color;
  const setCurrentColor =
    phase === 'scribble' ? setPlayer1Color : setPlayer2Color;

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo();
  }, []);

  const handleAction = useCallback(() => {
    setErasing(false);
    if (phase === 'scribble') {
      setPhase('complete');
    } else if (phase === 'complete') {
      setPhase('done');
    } else {
      canvasRef.current?.reset();
      setPhase('scribble');
      setMode('normal');
      setPlayer1Color(DRAW_COLORS[0].value);
      setPlayer2Color(DRAW_COLORS[2].value);
    }
  }, [phase]);

  const handleColorSelect = useCallback(
    (c: string) => {
      setErasing(false);
      setCurrentColor(c);
    },
    [setCurrentColor]
  );

  const isDrawingPhase = phase === 'scribble' || phase === 'complete';
  const canvasFlipped = mode === 'expert' && isDrawingPhase;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['scribbl'].bg}`}
            >
              <GameIcon
                id="scribbl"
                className={`h-8 w-8 ${gameColors['scribbl'].text}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Scribble</h1>
          <p className="text-lg text-foreground/60">
            Complete a scribble into a drawing!
          </p>
        </div>

        {/* How to Play */}
        <Collapsible
          defaultOpen={!isMobile}
          className="mb-8 rounded-lg border border-foreground/20 bg-background"
        >
          <div className="px-6 pt-6 pb-3">
            <CollapsibleTrigger>
              <h2 className="text-xl font-semibold">How to Play</h2>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="px-6 pb-6 space-y-2 text-foreground/80">
              <p>
                • <strong>Player 1</strong> picks a color and draws a random
                scribble on the canvas.
              </p>
              <p>
                • When happy with the scribble, click{' '}
                <strong>Done Scribbling</strong>.
              </p>
              <p>
                • <strong>Player 2</strong> then uses the scribble to create a
                drawing, completing it however they like.
              </p>
              <p>
                • Click <strong>Done Drawing</strong> to reveal the finished
                artwork!
              </p>
              <p className="pt-2 font-semibold">Tools:</p>
              <p>
                • Use the <strong>Erase</strong> tool to erase part of your
                drawing with a wider brush.
              </p>
              <p>
                • Use <strong>Undo</strong> to undo the last stroke.
              </p>
              <p className="pt-2 font-semibold">Expert Mode:</p>
              <p>
                • In <strong>Expert mode</strong>, the canvas is flipped 180°
                during drawing. Both players must draw on the flipped canvas —
                once complete, the canvas is re-flipped to reveal the artwork!
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Mode selector – available only in the scribble phase */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="text-sm font-medium text-foreground/60">Mode:</span>
          {(['normal', 'expert'] as GameMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              disabled={phase !== 'scribble'}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                mode === m
                  ? 'bg-foreground text-background shadow'
                  : 'bg-foreground/10 text-foreground/70 hover:bg-foreground/20',
                phase !== 'scribble' && 'cursor-not-allowed opacity-50'
              )}
            >
              {m === 'normal' ? 'Normal' : '🔄 Expert'}
            </button>
          ))}
        </div>

        {/* Phase indicator */}
        <div className="mb-4 rounded-lg border border-foreground/20 bg-background p-4 text-center">
          <p className="text-lg font-semibold">{PHASE_LABEL[phase]}</p>
          <p className="mt-1 text-sm text-foreground/60">
            {PHASE_DESCRIPTION[phase][mode]}
          </p>
        </div>

        {/* Canvas */}
        <div className="mb-4 overflow-hidden rounded-xl border-4 border-foreground/10 shadow-lg">
          <DrawingCanvas
            ref={canvasRef}
            color={currentColor}
            lineWidth={3}
            disabled={phase === 'done'}
            erasing={erasing}
            flipped={canvasFlipped}
          />
        </div>

        {/* Toolbar (hidden when done) */}
        {phase !== 'done' && (
          <div className="mb-6 space-y-3 rounded-lg border border-foreground/20 bg-background p-4">
            {/* Color picker row */}
            <div>
              <p className="mb-2 text-center text-sm text-foreground/60">
                Choose a color:
              </p>
              <ColorPicker
                colors={DRAW_COLORS}
                selected={erasing ? '' : currentColor}
                onSelect={handleColorSelect}
              />
            </div>

            {/* Erase + Undo row */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setErasing((v) => !v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-sm font-medium transition-all',
                  erasing
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-foreground/30 text-foreground/70 hover:border-foreground/60 hover:bg-foreground/5'
                )}
                aria-pressed={erasing}
              >
                <span>⬜</span> Erase
              </button>
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 rounded-lg border border-foreground/30 px-4 py-1.5 text-sm font-medium text-foreground/70 transition-all hover:border-foreground/60 hover:bg-foreground/5"
              >
                <span>↩</span> Undo
              </button>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="flex justify-center">
          <button
            onClick={handleAction}
            className="rounded-lg bg-foreground px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-md active:scale-95"
          >
            {PHASE_BUTTON[phase]}
          </button>
        </div>
      </div>
    </div>
  );
}
