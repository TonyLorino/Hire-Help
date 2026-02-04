# Resume Compare

An AI-powered hiring assistant that helps you analyze job descriptions, compare candidate resumes, generate interview preparation materials, and make informed hiring decisions.

## Features

- **Job Description Analysis**: Upload and analyze job descriptions for clarity and completeness, with AI-powered improvement recommendations
- **Resume Comparison**: Upload multiple resumes (PDF, Word, or text) to compare candidates against job requirements
- **Candidate Rankings**: Get Best/Better/Good/Bad rankings based on JD match, with percentage scores and recommendations
- **Interview Preparation**: Generate customized interview questions with context on why to ask and what to look for
- **Post-Interview Analysis**: Paste interview notes for AI analysis and candidate evaluation
- **Document Export**: Export interview prep materials to PDF or Word format
- **Chat Assistant**: Interactive AI assistant for questions about candidates, job descriptions, and hiring decisions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with Apple-inspired design
- **State Management**: Zustand
- **AI**: OpenAI GPT-4/GPT-4-turbo
- **File Processing**: pdf-parse (PDF), mammoth (Word)
- **Export**: docx (Word documents)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
cd Resume-Compare
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4-turbo
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Upload Job Description

- Paste your job description in the left panel
- Click "Upload Job Description"
- Optionally click "Recommend JD Updates" to get AI-powered suggestions for improving the job description

### 2. Upload Resumes

- After uploading a JD, you can upload candidate resumes
- Supports PDF, Word (.docx), and text files
- Multiple files can be uploaded at once
- Candidates are automatically parsed and named

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

### 5. Post-Interview Analysis

- Use the chat interface to paste interview notes
- Get AI analysis combining notes + resume + JD
- Receive recommendations on whether to advance candidates
- Generate offer/rejection emails

## Project Structure

```
resume-compare/
├── app/
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── job-description/  # JD-related components
│   ├── resumes/          # Resume upload/list
│   ├── analysis/         # Analysis tables
│   ├── interview/        # Interview prep
│   └── chat/             # Chat interface
├── lib/
│   ├── openai.ts         # OpenAI client
│   ├── file-parser.ts    # PDF/DOCX parsing
│   ├── prompts.ts        # AI prompts
│   └── utils.ts          # Utilities
├── store/
│   └── app-store.ts      # Zustand store
└── types/
    └── index.ts          # TypeScript types
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `OPENAI_MODEL` | Model to use (default: gpt-4-turbo) | No |

## License

MIT
