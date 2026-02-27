'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GameIcon, gameColors } from '@/components/game-icon';
import {
  DrawingCanvas,
  type DrawingCanvasHandle,
} from '@/components/game/scribbl/drawing-canvas';
import { ColorPicker } from '@/components/game/scribbl/color-picker';
import { DRAW_COLORS, type GamePhase, type GameMode } from '@/lib/games/scribbl/types';
import { getRandomConcept, FLIP_INTERVAL_MS } from '@/lib/games/scribbl/engine';
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

const PHASE_DESCRIPTION: Record<GamePhase, Record<GameMode, string>> = {
  scribble: {
    regular: 'Draw a random scribble on the canvas. Keep it abstract!',
    'upside-down': '🙃 Upside-Down mode: the canvas is flipped! Draw knowing it will be revealed right-side-up.',
    flip: '🔄 Flip mode: the canvas flips every 5 seconds — keep drawing!',
    themed: 'Draw a random scribble on the canvas — Player 2 will receive a theme to complete it!',
  },
  complete: {
    regular: 'Turn the scribble into a drawing. Be as creative as you like!',
    'upside-down': '🙃 Canvas is still upside-down — complete the drawing!',
    flip: '🔄 The canvas is still flipping — complete the drawing!',
    themed: 'Complete the drawing to match your theme below!',
  },
  done: {
    regular: 'Wonderful! Look at the finished collaboration.',
    'upside-down': 'Canvas flipped back — look at the finished collaboration!',
    flip: 'Canvas is right-side-up — look at the finished collaboration!',
    themed: 'Wonderful! How well did Player 2 capture the theme?',
  },
};

const PHASE_BUTTON: Record<GamePhase, string> = {
  scribble: 'Done Scribbling →',
  complete: 'Done Drawing →',
  done: 'Play Again',
};

const MODE_LABELS: Record<GameMode, string> = {
  regular: '✏️ Regular',
  'upside-down': '🙃 Upside-Down',
  flip: '🔄 Flip',
  themed: '🎯 Themed',
};

const ALL_MODES: GameMode[] = ['regular', 'upside-down', 'flip', 'themed'];

export default function ScribblPage() {
  const [phase, setPhase] = useState<GamePhase>('scribble');
  const [mode, setMode] = useState<GameMode>('regular');
  const [player1Color, setPlayer1Color] = useState(DRAW_COLORS[0].value);
  const [player2Color, setPlayer2Color] = useState(DRAW_COLORS[2].value);
  const [erasing, setErasing] = useState(false);
  const [autoFlipped, setAutoFlipped] = useState(false);
  const [concept, setConcept] = useState<string | null>(null);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const currentColor = phase === 'scribble' ? player1Color : player2Color;
  const setCurrentColor =
    phase === 'scribble' ? setPlayer1Color : setPlayer2Color;

  const isDrawingPhase = phase === 'scribble' || phase === 'complete';

  // Auto-flip timer: only active in 'flip' mode while drawing and when
  // the user has not requested reduced motion.
  useEffect(() => {
    const drawing = phase === 'scribble' || phase === 'complete';
    if (mode !== 'flip' || !drawing || reducedMotion) {
      setAutoFlipped(false);
      return;
    }
    setAutoFlipped(false);
    const id = setInterval(() => {
      setAutoFlipped((v) => !v);
    }, FLIP_INTERVAL_MS);
    // `phase` drives restart so the flip resets when Player 2 takes over.
    return () => clearInterval(id);
  }, [phase, mode, reducedMotion]);

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo();
  }, []);

  const handleAction = useCallback(() => {
    setErasing(false);
    if (phase === 'scribble') {
      if (mode === 'themed') {
        setConcept(getRandomConcept());
      }
      setPhase('complete');
    } else if (phase === 'complete') {
      setPhase('done');
    } else {
      canvasRef.current?.reset();
      setPhase('scribble');
      setMode('regular');
      setPlayer1Color(DRAW_COLORS[0].value);
      setPlayer2Color(DRAW_COLORS[2].value);
      setConcept(null);
    }
  }, [phase, mode]);

  const handleColorSelect = useCallback(
    (c: string) => {
      setErasing(false);
      setCurrentColor(c);
    },
    [setCurrentColor]
  );

  // Canvas orientation logic per mode:
  //  regular     → never flipped
  //  upside-down → statically flipped during both drawing phases, normal at reveal
  //  flip        → follows the auto-flip timer during drawing phases, normal at reveal
  //  themed      → never flipped
  const staticFlipped = mode === 'upside-down' && isDrawingPhase;
  const canvasFlipped = mode === 'flip' ? autoFlipped : staticFlipped;

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
              <p className="pt-2 font-semibold">Game Modes:</p>
              <p>
                • <strong>✏️ Regular</strong> — classic scribble and pass. No
                tricks!
              </p>
              <p>
                • <strong>🙃 Upside-Down</strong> — the canvas is flipped 180°
                for both players. It is revealed right-side-up at the end!
              </p>
              <p>
                • <strong>🔄 Flip</strong> — the canvas automatically flips
                every 5 seconds while both players draw. It is shown
                right-side-up when complete.
              </p>
              <p>
                • <strong>🎯 Themed</strong> — once Player 1 finishes, Player 2
                is given a random concept (e.g. &quot;house&quot;,
                &quot;rocket ship&quot;) to incorporate into the drawing.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Mode selector – locked once drawing has started */}
        <div className="mb-4">
          <p className="mb-2 text-center text-sm font-medium text-foreground/60">
            Choose a mode:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ALL_MODES.map((m) => (
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
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Phase indicator */}
        <div className="mb-4 rounded-lg border border-foreground/20 bg-background p-4 text-center">
          <p className="text-lg font-semibold">{PHASE_LABEL[phase]}</p>
          <p className="mt-1 text-sm text-foreground/60">
            {PHASE_DESCRIPTION[phase][mode]}
          </p>
          {mode === 'flip' && isDrawingPhase && reducedMotion && (
            <p className="mt-1 text-xs text-foreground/50" aria-live="polite">
              Auto-flip disabled (reduced-motion preference detected).
            </p>
          )}
        </div>

        {/* Concept prompt for Player 2 — Themed mode only */}
        {phase === 'complete' && mode === 'themed' && concept && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-lg border-2 border-foreground/30 bg-foreground/5 p-4 text-center"
          >
            <p className="text-sm font-medium text-foreground/60">
              <span aria-hidden="true">🎯</span> Player 2&apos;s concept:
            </p>
            <p className="mt-1 text-2xl font-bold tracking-wide">{concept}</p>
            <p className="mt-1 text-sm text-foreground/50">
              Complete the drawing to represent this concept!
            </p>
          </div>
        )}

        {/* Canvas */}
        <div className="mb-4 overflow-hidden rounded-xl border-4 border-foreground/10 shadow-lg">
          <DrawingCanvas
            ref={canvasRef}
            color={currentColor}
            lineWidth={3}
            disabled={phase === 'done'}
            erasing={erasing}
            flipped={canvasFlipped}
            reducedMotion={reducedMotion}
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
