# EasyConvert - MVP Documentation

## 🚀 Project Overview
**EasyConvert** is a privacy-first, client-side web application providing a suite of document and developer tools.
The core philosophy is **"No Server Uploads"** — all file processing (PDF merging, splitting, JSON formatting) happens entirely within the user's browser using WebAssembly and JavaScript libraries.

## 🛠 Technology Stack
- **Framework**: React 18+ (Vite)
- **Styling**: TailwindCSS (v3.4) + Custom CSS Variables
- **Icons**: FontAwesome & Lucide React
- **Routing**: React Router DOM (v6)
- **Core Libraries**:
  - `pdf-lib`: For PDF manipulation (Merge, Split, Rotate)
  - `file-saver`: For client-side file downloads
  - `jszip`: For zipping multiple files
  - `papaparse`: For CSV/Text parsing

## ✨ MVP Features (Implemented)

### 1. Core Tools (Everyday Utilities)
| Feature | Status | Description |
| :--- | :--- | :--- |
| **JSON Formatter** | ✅ Ready | Beautifies and validates JSON strings. |
| **JSON Validator** | ✅ Ready | Checks for syntax errors in JSON. |
| **Comma Separator** | ✅ Ready | Converts column data to comma-separated lists. |
| **Text Comparison** | ✅ Ready | Diff checker for two text blocks. |
| **Text Formatter** | ✅ Ready | Cleans whitespace and structures text. |
| **QR Code Generator** | ✅ Ready | Generates downloadable QR codes. |
| **Image Resizer** | ✅ Ready | Client-side image resizing. |
| **Image Compressor** | ✅ Ready | Basic browser-based compression. |

### 2. PDF Tools (Client-Side)
| Feature | Status | Description |
| :--- | :--- | :--- |
| **Merge PDF** | ✅ Ready | Combines multiple PDFs into one. |
| **Split PDF** | ⚠️ Limited | Extracts ranges/pages (Browser Memory Limited). |
| **JPG to PDF** | ⚠️ Limited | Converts images to PDF pages. |
| **PDF to JPG** | ⚠️ Limited | Renders PDF pages as images. |
| **Rotate PDF** | ⚠️ Limited | Rotates pages 90/180/270 degrees. |
| **Unlock PDF** | ⚠️ Limited | Removes simple owner passwords. |

### 3. UI/UX Architecture
- **Theme**: Fully responsive Dark/Light mode support.
- **Navigation**: 
  - Glassmorphism sticky navbar.
  - "Privacy-first" trust indicators.
  - Ctrl+K Command Palette search bar.
- **Home Page**:
  - Aggressively compact Hero section.
  - Categorized tool grid (Core, PDF, Advanced).
  - Instant search filtering.

## 🚧 Future Roadmap (Post-MVP)
The following features are currently marked as **"Under Development"** or **"Coming Soon"** due to requirements for backend processing or heavy compute:
- [ ] OCR (Optical Character Recognition)
- [ ] PDF to Word / Excel (Complex conversion)
- [ ] Heavy Compression (Server-side Ghostscript/etc)
- [ ] Batch Processing (Unlimited files)

## 📂 Project Structure
```bash
e:/SAAS/
├── src/
│   ├── components/      # Reusable UI components (Navbar, Footer, FeatureButton)
│   ├── config/          # Configuration files (FEATURE_CONFIG.js)
│   ├── pages/           # Individual tool pages (MergePdf.jsx, JsonTools.jsx)
│   ├── App.jsx          # Main Router setup
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind directives & global styles
├── public/              # Static assets
└── package.json         # Dependencies & Scripts
```

## 🔧 Running Locally
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
3. **Build for Production**:
   ```bash
   npm run build
   ```

## 🔒 Privacy & Security
- **No Database**: We do not store user data.
- **No Analytics**: (MVP currently has no external tracking).
- **Local Processing**: All `File` objects are handled in memory and never sent to an API endpoint.

---
*Generated: January 15, 2026*
