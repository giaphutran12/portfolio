# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0.0] - 2026-11-07

### Added
- Added a real agent behind the dog. It answers from a fixed knowledge base about Edward and says it does not know instead of guessing.
- Added page actions: the assistant can scroll to a section or open a project's detail dialog.
- Added call booking in chat: it shows Edward's real open times as buttons in your local time, and books the one you pick after you press Confirm. The invite arrives by email.
- Added "message Edward" in chat: it shows exactly what will be sent and sends only after you press Confirm.
- Added a Confirm/Cancel card for every action that reaches a real person, one-line receipts, and neutral messages when something fails.
- Added limits: 3 booking or message actions an hour per visitor IP, 40 messages per chat, and 4000 characters per message part.
- Added structured `[ASSISTANT]` log lines (ids, counts and reasons only) and `docs/assistant.md`.

### Changed
- Switched the chat to the Vercel AI SDK with OpenAI as the only provider (`ASSISTANT_MODEL`, default `gpt-6-luna`). Without `OPENAI_API_KEY` it answers with one line that points to the contact section.
- Replaced the quick prompts with "What is Tower?", "What's Edward building right now?", "Show me his best project" and "Book a call with Edward".
- Chat history now lives under a new storage key, so old plain-text conversations are cleared on first visit.

### Removed
- Removed Kimi/Moonshot support, the provider failover layer, the `openai` package and the keyword fallback answers.

## [0.0.2.0] - 2026-07-23

### Fixed
- Fixed the mobile nav menu so it can always be closed again: the hamburger now stays visible and tappable above the full-screen overlay, and tapping the dark backdrop also closes the menu.
- Fixed the page scrolling behind the open mobile menu — opening the menu now locks scrolling and closing it always releases the lock, including when leaving the page or resizing to desktop.
- Fixed nav links doing nothing on tap: choosing a section now reliably closes the menu and smooth-scrolls to that section.
- Fixed the mobile menu getting stuck open (and invisibly locking scroll) when the window crosses the desktop breakpoint.
- Fixed the AI assistant and project dialogs painting on top of the open navigation menu.

### Added
- Added keyboard and screen-reader support to the mobile menu: Escape closes it, focus moves into the menu on open and returns to the hamburger on close, and Tab stays within the menu while it is open.
- Added a hamburger-to-X animation, a gentle fade-in for the menu overlay, and reduced-motion support for both.
- Added a regression test suite for the mobile nav (18 tests covering open/close, scroll lock, focus management, breakpoint behavior, and scroll fallbacks).

## [0.0.1.0] - 2026-04-17

### Added
- Added an AI portfolio assistant with an animated dog companion, rich chat formatting, persisted conversation history, and quick prompt actions.
- Added sprite-based dog assets and motion logic with regression tests covering 2D following, freeze behavior, and chat panel scroll behavior.
- Added Kimi configuration helpers and provider resolution tests for multi-provider chat failover.

### Changed
- Updated the chat API to try Kimi first, then fall back to OpenAI when configured.
- Improved the chat panel so hidden UI no longer steals clicks and open-state scrolling stays reliable.

### Fixed
- Fixed the assistant dog regression so it follows in 2D again instead of flattening into 1D movement.
- Fixed sprite-sheet math so the dog animation no longer appears to drift vertically between frames.
- Fixed invalid JSON handling and added direct route tests for chat fallbacks.
