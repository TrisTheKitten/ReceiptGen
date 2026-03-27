# Receipt Generator

**Try here : https://gemini-receipt-gen.vercel.app/**

A React-based receipt generator with AI-powered data generation. Supports 7-Eleven thermal receipts, Lazada order receipts, A4 Invoice receipts, and Tax Invoice receipts with bilingual (Thai / Thai-English) support.

## Features

- **AI Generation**: Uses Google Gemini Flash 3 to generate realistic receipt data with your own API key
- **Multiple Templates**: 7-Eleven thermal, Lazada A4, Invoice A4, and Tax Invoice (Thai-only and Thai/English modes)
- **Scanner Effects**: Realistic visual effects including rotation, perspective, noise, vignette, paper texture, and various background styles
- **Batch Generation**: Generate up to 20 unique receipts at once
- **Collection Management**: Add receipts to a collection, load them back for editing, or remove them
- **Export Options**: PNG, PDF, or ZIP archive for batch downloads

## For Local Host : Setup

```bash
npm install
npm run dev
```

## Usage

1. Enter your [Gemini API Key](https://aistudio.google.com/apikey) in the sidebar
2. Select a template (7-Eleven, Lazada, Invoice, or Tax Invoice)
3. Toggle between Thai-only and Thai/English language modes for Invoice and Tax Invoice templates
4. Click "Generate AI" to auto-fill receipt data, or manually edit fields
5. Customize scanner effects (rotation, perspective, noise, vignette, background) or randomize them
6. Download as PNG/PDF or add to collection for batch export

Note: Your API key is kept in memory only for the current session.

## Tech Stack

- React 19 + TypeScript
- Vite
- Google Gemini AI (`@google/genai`)
- html2canvas + jsPDF for exports
- JSZip for batch downloads

## Configuration

- `VITE_GEMINI_MODEL` (optional): Override the default Gemini model name.
