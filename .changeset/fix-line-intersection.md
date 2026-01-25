---
"@pen-and-paper-games/web": patch
---

Fix line intersection bug in Hold The Line game

Lines drawn on the game board are now prevented from crossing or intersecting with existing lines, in accordance with the game rules. This ensures accurate gameplay and prevents confusion about allowed moves.

**Changes:**
- Added line segment intersection detection algorithm using cross product method
- Updated move validation to check for line intersections before allowing moves
- Added comprehensive unit tests to verify intersection detection works correctly
- Improved UI feedback for invalid moves with accessible error messages
- Fixed edge case where positions adjacent to both path ends weren't properly checked

**Impact:**
- Players can no longer create invalid game states with crossing lines
- Game rules are now correctly enforced
- Better user experience with clear feedback on invalid moves
