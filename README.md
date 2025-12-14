# morph-mini

A modern, clean web application for creating and editing professional resumes with real-time preview and PDF export functionality.

## Features

- **Modern SaaS-like Interface**: Clean, intuitive design with sidebar editor
- **Real-time Preview**: See your resume update as you type
- **Drag-and-Drop Reordering**: Reorder contact details, bullet points, and sections by dragging
- **PDF Export**: Download your resume as a PDF with file picker support
- **ATS-Friendly**: Clean HTML structure optimized for Applicant Tracking Systems
- **A4/Letter Format**: Always maintains proper document sizing (1 page)
- **Easy Editing**: Collapsible sidebar sections for all resume components
- **Direct Content Editing**: Click to edit text directly in the preview

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **jsPDF** - PDF generation
- **html2canvas** - HTML to image conversion
- **Lucide React** - Icons

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx         # Main page component
│   └── globals.css      # Global styles
├── components/
│   ├── ResumePreview.tsx    # Resume preview component
│   └── SidebarEditor.tsx    # Sidebar editor component
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── resume-context.tsx   # React context for state
│   └── pdf-export.ts        # PDF export functionality
└── package.json
```

## Usage

### Basic Editing
1. Edit your resume information using the sidebar editor
2. See real-time updates in the preview pane
3. Click text directly in the preview to edit inline
4. Click "Download PDF" to export your resume

### Drag-and-Drop Features

#### Reorder Contact Details
- In the preview sidebar, drag any contact item (location, phone, email, LinkedIn) to reorder them
- The new order will be reflected in the PDF export

#### Reorder Bullet Points
- **In Preview**: Drag bullet points directly in the preview to reorder them within each job
- **In Sidebar**: Use the drag handles in the sidebar editor to reorder bullets
- Both methods work seamlessly and sync instantly

#### Reorder Sections (Experience vs Projects)
- Drag entire sections in the preview to change their order
- Swap "Professional Experience" and "Projects" sections by dragging the section headers
- Perfect for emphasizing different aspects of your background

## Browser Support

- Modern browsers with ES6+ support
- File System Access API support for folder selection (Chrome/Edge)
- Falls back to regular download in other browsers
