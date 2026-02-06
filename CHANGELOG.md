# Changelog

All notable changes to Hire Help will be documented in this file.

## [1.2.0] - 2026-02-05

### Added

#### Export Improvements
- **Comparison Table Export**: New export buttons for the Candidate Comparison table:
  - Print as PDF
  - Save as PNG image
  - Copy to clipboard (formatted text for emails)
- **Recommendation Card PNG Export**: Save individual recommendation cards as PNG images

#### Comparison Table Enhancements
- **Summary Column**: New column showing 3-sentence synopsis for each candidate
- **Full Bullet Points**: Interview highlights and key concerns now show 2-8 items with word wrap (previously limited to 2 truncated items)

### Changed

#### API Migration
- **Azure OpenAI Responses API**: Migrated from Chat Completions API to the newer Responses API for GPT-5.2 support
- **Simplified Configuration**: Now uses `AZURE_OPENAI_RESOURCE_NAME` instead of full endpoint URL and API version

### Fixed
- Fixed interview notes analysis failing after API migration
- Fixed hiring email generation failing after API migration
- Fixed markdown formatting (bold/italic) not rendering in recommendation synopsis

---

## [1.1.0] - 2026-02-04

### Added

#### New Tabs
- **Interview Notes Tab**: Individual cards for each candidate with text fields to paste interview notes. Includes a "Send" button that initiates AI analysis combining notes with JD/resume match data, generating a comprehensive summary with strengths, gaps, and next steps.
- **Recommendations Tab**: Displays candidate recommendation cards with interview synopsis, strengths & matches, concerns & gaps, and suggested next steps. Includes a comparison table for side-by-side evaluation of all analyzed candidates.

#### Recommendations Features
- **Print to PDF**: Each recommendation card has a print button that opens a nicely formatted print dialog for saving as PDF.
- **Copy to Clipboard**: Copy button extracts formatted plain text suitable for pasting into emails, with visual checkmark feedback on success.
- **Hiring Manager Email Generation**: AI-generated email templates summarizing candidate performance for hiring managers.

#### Chat Interface Improvements
- **Resizable Chat Frame**: The entire chat area is now resizable by dragging the handle at the top. Defaults to 35% of viewport height.
- **Streaming Responses**: AI responses now stream in real-time with a typing animation (blinking cursor) similar to ChatGPT/Gemini.
- **Auto-scroll**: Chat automatically scrolls to the bottom when new messages arrive.
- **Markdown Rendering**: Assistant responses now properly render markdown (bold, italic, headers, lists, tables, code blocks) instead of showing raw syntax.

#### Table Improvements
- **Sticky Headers**: All tables (JD Match, Comparison, Interview Prep, Recommendations) now have frozen header rows that stay visible while scrolling through content.
- **Dynamic Heights**: Tables now scale with viewport height instead of using a fixed 500px, making them much taller and more usable.

### Fixed

#### Layout & UI
- **Sidebar Overflow**: Fixed an issue where the left sidebar would expand beyond its 380px bounds when uploading JD or resumes. Now uses proper width constraints and native scroll.
- **Tab Bar Protection**: The tab bar is now protected so it never gets obscured by content. Content scrolls within its container below the tabs.
- **Chat Input Visibility**: Restructured the chat interface to guarantee the input field never goes off-screen when resizing. Minimum chat height enforced at 220px.
- **Inline Markdown in Recommendations**: Fixed raw markdown syntax (e.g., `**bold**`) appearing in recommendation cards. Now renders as proper formatted text.

### Technical Changes
- Replaced Radix ScrollArea with native scroll divs in several components for more reliable overflow handling
- Added comprehensive width constraints (`min-w-0`, `max-w-full`, `overflow-clip`) throughout the sidebar hierarchy
- Moved chat height constants to module level for proper initialization
- Restructured ChatInterface with absolute positioning for the bottom section to ensure input visibility

---

## [1.0.0] - Initial Release

### Features
- Job Description Analysis with AI-powered improvement recommendations
- Multi-resume upload and comparison (PDF, Word, text)
- Smart candidate name and location extraction
- Candidate rankings (Best/Better/Good/Bad) with percentage scores
- Interview preparation question generation
- Document export to PDF and Word
- Interactive chat assistant for hiring decisions
