# Receipt Generator

A React-based receipt generator with AI-powered data generation. Supports 7-Eleven receipts and Lazada order receipts.

## Features

- **AI Generation**: Uses Google Gemini Flash 3 Model to generate realistic receipt data. (You will need to use your own API key.)
- **Templates**: 7-Eleven receipt and Lazada receipt styles
- **Batch Generation**: Generate up to 20 receipts at once
- **Export Options**: PNG, PDF, or ZIP archive

## Setup

```bash
npm install
npm run dev
```

## Usage

1. Enter your [Gemini API Key](https://aistudio.google.com/apikey) in the sidebar
2. Select a template (7-Eleven or Lazada)
3. Click "Generate AI" to auto-fill receipt data, or manually edit fields
4. Download as PNG/PDF or add to collection for batch export

## Tech Stack

- React 19 + TypeScript
- Vite
- Google Gemini AI (`@google/genai`)
- html2canvas + jsPDF for exports
- JSZip for batch downloads
