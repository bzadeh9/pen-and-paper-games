---
"@pen-and-paper-games/web": patch
---

Knight Chase: Improved mobile responsiveness and error handling UX

- Fixed mobile viewport issues - board now scales responsively to fit screens as small as 375px
- Replaced obtrusive error banner with subtle tooltip above knight piece for invalid moves
- Added shake animation to knight piece on invalid move attempts for better visual feedback
- Improved accessibility with proper ARIA labels for tooltips
- Enhanced touch targets and responsive sizing for better mobile experience
- Added tests for responsive layout and new error tooltip behavior
