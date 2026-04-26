'use client';

import React, { useState, useCallback } from 'react';
import type { GameState, Hand } from '@/lib/games/chopsticks/types';
import { Button } from '@/components/ui/button';

interface BoardProps {
  gameState: GameState;
  onAttack: (attackerHand: Hand, targetHand: Hand) => void;
  onSplit: (newLeft: number, newRight: number) => void;
  player1Name: string;
  player2Name: string;
}

/** Renders a hand button showing the finger count. */
function HandButton({
  value,
  label,
  isSelected,
  isTarget,
  isClickable,
  onClick,
  colorClass,
}: {
  value: number;
  label: string;
  isSelected: boolean;
  isTarget: boolean;
  isClickable: boolean;
  onClick: () => void;
  colorClass: string;
}) {
  const isDead = value === 0;

  const ringClass = isSelected
    ? `ring-4 ${colorClass.replace('bg-', 'ring-')}`
    : isTarget && isClickable
      ? 'ring-2 ring-foreground/40'
      : '';

  const opacityClass = isDead ? 'opacity-30' : isClickable ? '' : 'opacity-60';

  const sizeClass = 'h-20 w-20 md:h-24 md:w-24';

  if (!isClickable || isDead) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`${sizeClass} flex items-center justify-center rounded-full border-2 border-foreground/20 ${opacityClass}`}
          aria-label={`${label}: ${isDead ? 'dead' : `${value} finger${value === 1 ? '' : 's'}`}`}
        >
          <span className="text-3xl font-bold">{isDead ? '✕' : value}</span>
        </div>
        <span className="text-xs text-foreground/50">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        className={`${sizeClass} flex cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
          isSelected
            ? `border-transparent ${colorClass} text-background ${ringClass}`
            : isTarget
              ? 'border-foreground/40 bg-background hover:border-foreground/70 hover:bg-foreground/5'
              : `border-foreground/30 bg-background hover:border-foreground/60 hover:bg-foreground/5`
        } ${opacityClass}`}
        aria-label={`${label}: ${value} finger${value === 1 ? '' : 's'}${isSelected ? ', selected as attacker' : isTarget ? ', tap to attack' : ''}`}
        aria-pressed={isSelected}
      >
        <span className={`text-3xl font-bold ${isSelected ? 'text-background' : ''}`}>
          {value}
        </span>
      </button>
      <span className="text-xs text-foreground/50">{label}</span>
    </div>
  );
}

/** Renders a player's two hands side-by-side. */
function PlayerHands({
  hands,
  playerLabel,
  isCurrentPlayer,
  selectedHand,
  phase,
  onSelectAttacker,
  onSelectTarget,
  colorClass,
  isAttacking,
}: {
  hands: { left: number; right: number };
  playerLabel: string;
  isCurrentPlayer: boolean;
  selectedHand: Hand | null;
  phase: 'idle' | 'attacking' | 'splitting';
  onSelectAttacker?: (hand: Hand) => void;
  onSelectTarget?: (hand: Hand) => void;
  colorClass: string;
  isAttacking: boolean;
}) {
  const handLabels: Hand[] = ['left', 'right'];

  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className={`text-sm font-medium ${isCurrentPlayer ? colorClass.replace('bg-', 'text-') : 'text-foreground/50'}`}
      >
        {playerLabel}
      </p>
      <div className="flex gap-6">
        {handLabels.map((hand) => {
          const value = hands[hand];
          const isDead = value === 0;

          let isClickable = false;
          let isSelected = false;
          let isTarget = false;

          if (isCurrentPlayer && phase === 'idle' && !isDead) {
            isClickable = true;
          } else if (isCurrentPlayer && phase === 'attacking' && selectedHand === hand) {
            isClickable = true;
            isSelected = true;
          } else if (!isCurrentPlayer && isAttacking && phase === 'attacking' && !isDead) {
            isClickable = true;
            isTarget = true;
          }

          return (
            <HandButton
              key={hand}
              value={value}
              label={hand === 'left' ? 'Left' : 'Right'}
              isSelected={isSelected}
              isTarget={isTarget}
              isClickable={isClickable}
              onClick={() => {
                if (isCurrentPlayer && onSelectAttacker) {
                  onSelectAttacker(hand);
                } else if (!isCurrentPlayer && onSelectTarget) {
                  onSelectTarget(hand);
                }
              }}
              colorClass={colorClass}
            />
          );
        })}
      </div>
    </div>
  );
}

type InteractionPhase = 'idle' | 'attacking' | 'splitting';

export function Board({
  gameState,
  onAttack,
  onSplit,
  player1Name,
  player2Name,
}: BoardProps) {
  const [phase, setPhase] = useState<InteractionPhase>('idle');
  const [selectedHand, setSelectedHand] = useState<Hand | null>(null);

  const isPlaying = gameState.status === 'playing';
  const currentPlayer = gameState.currentPlayer;

  // Fixed layout: Player 2 always on top, Player 1 always on bottom
  const player1Hands = gameState.hands[0];
  const player2Hands = gameState.hands[1];
  const currentHands = currentPlayer === 1 ? player1Hands : player2Hands;

  const validSplits = isPlaying ? (() => {
    const { left, right } = currentHands;
    const total = left + right;
    const splits: [number, number][] = [];
    for (let l = 0; l <= Math.min(total, 4); l++) {
      const r = total - l;
      if (r < 0 || r > 4) continue;
      if (l === left && r === right) continue;
      splits.push([l, r]);
    }
    return splits;
  })() : [];

  const handleSelectAttacker = useCallback(
    (hand: Hand) => {
      if (!isPlaying) return;
      if (phase === 'idle') {
        setSelectedHand(hand);
        setPhase('attacking');
      } else if (phase === 'attacking' && selectedHand === hand) {
        // Deselect
        setSelectedHand(null);
        setPhase('idle');
      }
    },
    [isPlaying, phase, selectedHand]
  );

  const handleSelectTarget = useCallback(
    (hand: Hand) => {
      if (!isPlaying || phase !== 'attacking' || selectedHand === null) return;
      onAttack(selectedHand, hand);
      setSelectedHand(null);
      setPhase('idle');
    },
    [isPlaying, phase, selectedHand, onAttack]
  );

  const handleSplitClick = useCallback(
    (newLeft: number, newRight: number) => {
      onSplit(newLeft, newRight);
      setPhase('idle');
      setSelectedHand(null);
    },
    [onSplit]
  );

  const handleShowSplit = useCallback(() => {
    setPhase(phase === 'splitting' ? 'idle' : 'splitting');
    setSelectedHand(null);
  }, [phase]);

  const handleCancel = useCallback(() => {
    setPhase('idle');
    setSelectedHand(null);
  }, []);

  const currentPlayerName = currentPlayer === 1 ? player1Name : player2Name;
  const opponentName = currentPlayer === 1 ? player2Name : player1Name;

  const player1Color = 'bg-periwinkle';
  const player2Color = 'bg-powder-blush';

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-8">
      {/* Player 2 — always on top */}
      <PlayerHands
        hands={player2Hands}
        playerLabel={player2Name}
        isCurrentPlayer={currentPlayer === 2}
        selectedHand={selectedHand}
        phase={phase}
        onSelectAttacker={handleSelectAttacker}
        onSelectTarget={handleSelectTarget}
        colorClass={player2Color}
        isAttacking={phase === 'attacking'}
      />

      {/* Divider / instructions */}
      <div className="w-full max-w-xs text-center">
        <div className="mb-1 text-xs font-medium text-foreground/40 tracking-widest uppercase" aria-hidden="true">
          vs
        </div>
        {isPlaying && (
          <p className="text-sm text-foreground/60" aria-live="polite">
            {phase === 'idle' &&
              `${currentPlayerName}: tap a hand to attack, or split`}
            {phase === 'attacking' &&
              `Tap ${opponentName}'s hand to attack — or cancel`}
            {phase === 'splitting' && 'Choose a split:'}
          </p>
        )}
      </div>

      {/* Player 1 — always on bottom */}
      <PlayerHands
        hands={player1Hands}
        playerLabel={player1Name}
        isCurrentPlayer={currentPlayer === 1}
        selectedHand={selectedHand}
        phase={phase}
        onSelectAttacker={handleSelectAttacker}
        onSelectTarget={handleSelectTarget}
        colorClass={player1Color}
        isAttacking={phase === 'attacking'}
      />

      {/* Action buttons */}
      {isPlaying && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {phase === 'attacking' && (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          {phase !== 'attacking' && validSplits.length > 0 && (
            <Button
              variant={phase === 'splitting' ? 'default' : 'outline'}
              size="sm"
              onClick={handleShowSplit}
            >
              {phase === 'splitting' ? 'Cancel Split' : 'Split'}
            </Button>
          )}
        </div>
      )}

      {/* Split options */}
      {isPlaying && phase === 'splitting' && validSplits.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {validSplits.map(([l, r]) => (
            <Button
              key={`${l}-${r}`}
              variant="outline"
              size="sm"
              onClick={() => handleSplitClick(l, r)}
              aria-label={`Split to left ${l}, right ${r}`}
            >
              {l} | {r}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
