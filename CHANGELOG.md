# Changelog

All notable changes to this project will be documented in this file.

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
