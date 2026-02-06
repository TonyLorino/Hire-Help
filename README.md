# Hire Help

An AI-powered hiring assistant that helps you analyze job descriptions, compare candidate resumes, generate interview preparation materials, and make informed hiring decisions.

See [CHANGELOG.md](CHANGELOG.md) for recent updates.

## Features

### Core Analysis
- **Job Description Analysis**: Upload job descriptions (PDF, Word, or paste text) with automatic job title extraction and AI-powered improvement recommendations
- **Resume Comparison**: Upload multiple resumes (PDF, Word, or text) to compare candidates against job requirements
- **Smart Name Extraction**: AI-powered extraction of candidate names and locations from resumes
- **Candidate Rankings**: Get Best/Better/Good/Bad rankings based on JD match, with percentage scores and recommendations

### Interview Tools
- **Interview Preparation**: Generate customized interview questions with context on why to ask and what to look for
- **Interview Notes**: Paste interview notes for each candidate and get AI-powered analysis combining notes with JD/resume data
- **Recommendations**: View comprehensive candidate recommendations with strengths, concerns, and suggested next steps

### Post-Interview
- **Candidate Comparison**: Side-by-side comparison table with summary, interview highlights, and key concerns
- **Hiring Manager Emails**: Generate email templates summarizing candidate performance
- **Export Options**: Export recommendations and comparison tables as PDF, PNG, or copy to clipboard

### AI Chat Assistant
- **Streaming Responses**: Real-time AI responses with typing animation
- **Markdown Rendering**: Properly formatted responses with headers, lists, tables, and code blocks
- **Resizable Interface**: Drag to resize the chat area to your preference
- **Contextual Answers**: Ask questions about candidates, job descriptions, and hiring decisions

### Document Export
- Export interview prep materials to PDF or Word format
- Export recommendations and comparison tables as PDF or PNG images

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with Apple-inspired design
- **State Management**: Zustand
- **AI**: Azure OpenAI (GPT-5.2 Responses API)
- **File Processing**: pdf-parse (PDF), mammoth (Word)
- **Export**: docx (Word documents)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Azure OpenAI API access (API key, endpoint, and deployment name)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/hire-help.git
cd hire-help
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
touch .env.local
```

4. Add your Azure OpenAI credentials to `.env.local`:
```
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_RESOURCE_NAME=your-resource-name
AZURE_OPENAI_DEPLOYMENT=gpt-5.2
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key | Yes |
| `AZURE_OPENAI_RESOURCE_NAME` | Your Azure OpenAI resource name (e.g., `my-resource` from `my-resource.openai.azure.com`) | Yes |
| `AZURE_OPENAI_DEPLOYMENT` | Your model deployment name (e.g., gpt-5.2) | Yes |

## Usage

### 1. Upload Job Description

- Drag and drop a PDF/Word file, or paste your job description text
- Files are automatically processed and the job title is extracted
- Click "Recommend JD Updates" to get AI-powered suggestions for improving the job description

### 2. Upload Resumes

- After uploading a JD, you can upload candidate resumes
- Supports PDF, Word (.docx), and text files
- Multiple files can be uploaded at once
- AI automatically extracts candidate names and locations

### 3. Review Analysis

After uploading resumes, the app generates:

- **Summary Tab**: 2-paragraph summaries of each candidate
- **JD Match Tab**: Table showing what matches and gaps exist for each candidate
- **Comparison Tab**: Side-by-side comparison with rankings and recommendations

### 4. Interview Preparation

- Click the "Interview Prep" tab
- Select a candidate to generate interview materials
- Get customized questions categorized as:
  - Ice breakers
  - JD-specific questions
  - Candidate-specific questions
- Export to PDF or Word for use during interviews

### 5. Interview Notes

- Click the "Interview Notes" tab
- Paste your notes from the interview into the candidate's card
- Click "Send" to analyze the notes
- AI generates a comprehensive summary combining notes with JD/resume analysis
- Option to generate a hiring manager email template

### 6. Recommendations

- Click the "Recommendations" tab after analyzing interview notes
- View recommendation cards for each candidate with:
  - Interview synopsis
  - Strengths & matches
  - Concerns & gaps
  - Suggested next steps
- Use the comparison table to evaluate candidates side-by-side
- Print individual recommendations as PDF or copy for emails

### 7. Chat Assistant

- Use the chat interface at the bottom for ad-hoc questions
- Resize the chat area by dragging the handle
- Ask about specific candidates, job requirements, or get hiring advice
- Generate offer/rejection emails

## Project Structure

```
hire-help/
├── app/
│   ├── api/                    # API routes
│   │   ├── analyze-jd/         # JD analysis
│   │   ├── analyze-resumes/    # Resume analysis
│   │   ├── analyze-interview-notes/  # Interview notes analysis
│   │   ├── generate-hiring-email/    # Email generation
│   │   ├── chat/               # Chat completions
│   │   └── ...                 # Other endpoints
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page with resizable chat
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── layout/                 # Layout components (Header, LeftPanel, RightPanel)
│   ├── job-description/        # JD upload, preview, analysis
│   ├── resumes/                # Resume upload/list
│   ├── analysis/               # Analysis tables (Summary, JD Match, Comparison)
│   ├── interview/              # Interview prep & notes
│   ├── recommendations/        # Recommendations view
│   └── chat/                   # Chat interface with streaming
├── lib/
│   ├── openai.ts               # Azure OpenAI client
│   ├── file-parser.ts          # PDF/DOCX parsing
│   ├── prompts.ts              # AI prompts
│   ├── export.ts               # PDF/Word export
│   └── utils.ts                # Utilities
├── store/
│   └── app-store.ts            # Zustand store
└── types/
    └── index.ts                # TypeScript types
```

## License

MIT
