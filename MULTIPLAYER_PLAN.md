# Multiplayer Implementation Plan: Chopsticks (Issue #80)

## Overview
This document outlines the architecture and implementation plan for introducing real-time, remote multiplayer for the 'Chopsticks' game. The goal is to allow two players to generate a game link/code and play against each other across different devices (web and mobile). 

This infrastructure is designed to be reusable for future turn-based games, relies on anonymous sessions, and utilizes **Supabase** for real-time networking.

---

## Architecture: Supabase Realtime

We will use **Supabase** to handle backend state and real-time synchronization. Supabase offers a feature called **Realtime Channels**, which provides exactly what we need:
1. **Database / Postgres Changes:** To store the core game state and allow reconnecting players to fetch the latest board.
2. **Broadcast:** For low-latency transmission of transient events (like "typing" or UI animations).
3. **Presence:** To easily detect when a user drops connection, powering our 30-second reconnect window.

### 1. Supabase Project Setup
1. Create a new project in your [Supabase Dashboard](https://supabase.com/).
2. Retrieve your `Project URL` and `anon` public API key from **Project Settings -> API**.
3. Install the client in your project:
   ```bash
   npm install @supabase/supabase-js
   ```

### 2. Database Schema (Postgres)
Create a table to store the game sessions. Run the following in the Supabase SQL Editor:

```sql
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  join_code VARCHAR(6) UNIQUE NOT NULL,
  game_type VARCHAR(50) DEFAULT 'chopsticks',
  state JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Since we are doing anonymous play, allow anonymous reads/updates for now.
CREATE POLICY "Allow anonymous read access" ON games FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON games FOR UPDATE USING (true);
```

### 3. Realtime Client Integration (Example)
To sync game state and handle disconnects, the client will connect to a specific game channel.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Example: Connecting to a game room
const joinGameRoom = (joinCode: string, playerId: string) => {
  const roomChannel = supabase.channel(`game_${joinCode}`, {
    config: { presence: { key: playerId } },
  });

  roomChannel
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `join_code=eq.${joinCode}` }, (payload) => {
      console.log('Game state updated:', payload.new.state);
    })
    .on('presence', { event: 'sync' }, () => {
      const state = roomChannel.presenceState();
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await roomChannel.track({ online_at: new Date().toISOString() });
      }
    });

  return roomChannel;
};
```

---

## Execution Plan / Child Issues

### Phase 1: [Backend/Core] Set up reusable real-time game room infrastructure
**Goal:** Establish the foundational Supabase connection and generic room logic.
- **Tasks:**
  - Initialize the Supabase client in the shared core library.
  - Implement functions to `createGame(type)`.
  - Implement functions to `joinGame(code)`.
  - Ensure logic is isolated so it can be reused for games other than Chopsticks.
  - **Quality Gates:** Unit tests for room creation/joining logic. Generate changeset.

### Phase 2: [UI/UX] Create "Host Game" and "Join Game" flows
**Goal:** Build the interfaces for users to initiate and join multiplayer sessions anonymously.
- **Tasks:**
  - Create the "Host Game" view.
  - Create the "Join Game" view.
  - Handle edge cases.
  - **Quality Gates:** Must be implemented in *both* `mobile` and `web` projects. Ensure text inputs and loading states meet accessibility requirements. Generate changeset.

### Phase 3: [Core/UI] Implement Chopsticks real-time gameplay synchronization
**Goal:** Hook the existing Chopsticks logic into the Supabase realtime channel.
- **Tasks:**
  - Update the `games` table record whenever a valid move is made.
  - Lock the UI for the player whose turn it *isn't*.
  - When the `postgres_changes` event fires, update the local React/React Native state.
  - Handle the win/loss state broadcasting.
  - **Quality Gates:** Unit tests for the multiplayer state wrapper. Generate changeset.

### Phase 4: [Core/UI] Handle connection lifecycles (Disconnects, Forfeits, Rematches)
**Goal:** Manage network drops and post-game flows using Supabase Presence.
- **Tasks:**
  - Monitor the Supabase `presence` state. Trigger a localized 30-second countdown UI on disconnect.
  - If the timer hits 0, update the database `status` to 'abandoned', and show a "Victory by Forfeit" screen.
  - Add a "Rematch" button on the post-game screen.
  - **Quality Gates:** Ensure timer and forfeit modals meet usability guidelines. Generate changeset.
