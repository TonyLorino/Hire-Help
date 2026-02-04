# Hire Help

An AI-powered hiring assistant that helps you analyze job descriptions, compare candidate resumes, generate interview preparation materials, and make informed hiring decisions.

## Features

- **Job Description Analysis**: Upload job descriptions (PDF, Word, or paste text) with automatic job title extraction and AI-powered improvement recommendations
- **Resume Comparison**: Upload multiple resumes (PDF, Word, or text) to compare candidates against job requirements
- **Smart Name Extraction**: AI-powered extraction of candidate names and locations from resumes
- **Candidate Rankings**: Get Best/Better/Good/Bad rankings based on JD match, with percentage scores and recommendations
- **Interview Preparation**: Generate customized interview questions with context on why to ask and what to look for
- **Post-Interview Analysis**: Paste interview notes for AI analysis and candidate evaluation
- **Document Export**: Export interview prep materials to PDF or Word format
- **Chat Assistant**: Interactive AI assistant for questions about candidates, job descriptions, and hiring decisions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with Apple-inspired design
- **State Management**: Zustand
- **AI**: Azure OpenAI (GPT-4)
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
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
AZURE_OPENAI_API_VERSION=2025-01-01-preview
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
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint URL | Yes |
| `AZURE_OPENAI_DEPLOYMENT` | Your model deployment name (e.g., gpt-4.1) | Yes |
| `AZURE_OPENAI_API_VERSION` | API version (default: 2025-01-01-preview) | No |

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

### 5. Post-Interview Analysis

- Use the chat interface to paste interview notes
- Get AI analysis combining notes + resume + JD
- Receive recommendations on whether to advance candidates
- Generate offer/rejection emails

## Project Structure

```
hire-help/
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
│   ├── openai.ts         # Azure OpenAI client
│   ├── file-parser.ts    # PDF/DOCX parsing
│   ├── prompts.ts        # AI prompts
│   └── utils.ts          # Utilities
├── store/
│   └── app-store.ts      # Zustand store
└── types/
    └── index.ts          # TypeScript types
```

## License

MIT
