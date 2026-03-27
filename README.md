# Receipt Generator

**Try here : https://gemini-receipt-gen.vercel.app/**

A React-based receipt generator with AI-powered data generation. Supports 7-Eleven thermal receipts, Lazada order receipts, and A4 Invoice receipts with bilingual (Thai / Thai-English) support.

## Features

- **AI Generation**: Uses Google Gemini Flash 3 Model to generate realistic receipt data. (You will need to use your own API key.)
- **Templates**: 7-Eleven thermal, Lazada A4, and Invoice A4 (with Thai-only and Thai/English language modes)
- **Batch Generation**: Generate up to 20 receipts at once
- **Export Options**: PNG, PDF, or ZIP archive 

## For Local Host : Setup

```bash
npm install
npm run dev
```

## Usage

1. Enter your [Gemini API Key](https://aistudio.google.com/apikey) in the sidebar
2. Select a template (7-Eleven, Lazada, or Invoice)
3. For Invoice template, toggle between Thai-only and Thai/English modes
4. Click "Generate AI" to auto-fill receipt data, or manually edit fields
5. Download as PNG/PDF or add to collection for batch export

Note: Your API key is kept in memory only for the current session.

## Tech Stack

- React 19 + TypeScript
- Vite
- Google Gemini AI (`@google/genai`)
- html2canvas + jsPDF for exports
- JSZip for batch downloads

## Configuration

- `VITE_GEMINI_MODEL` (optional): override the default Gemini model name.
