import JSZip from 'jszip';

// Vite eager glob imports to capture all source files and configs as raw text strings
const rawFiles = import.meta.glob(
  [
    '/src/**/*.{ts,tsx,css,json}',
    '/index.html',
    '/vite.config.ts',
    '/tsconfig.json',
    '/vercel.json',
    '/package.json',
    '/.env.example',
    '/.gitignore'
  ],
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add all globbed files
  for (const [filePath, content] of Object.entries(rawFiles)) {
    // Strip leading slash
    const relativePath = filePath.replace(/^\//, '');
    zip.file(relativePath, content);
  }

  // Add a comprehensive README.md file
  const readmeContent = `# KHAN MANAGEMENT - Point of Sale (POS), MFS & Inventory System

A modern Point of Sale (POS), MFS Mobile Banking Ledger, Inventory, and Customer Ledger System built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start (Local Setup)

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start Development Server:**
   \`\`\`bash
   npm run dev
   \`\`\`
   Open http://localhost:3000 in your browser.

3. **Build for Production:**
   \`\`\`bash
   npm run build
   \`\`\`

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Framework Preset: **Vite**
4. Click **Deploy**.

## 📁 Key Features
- **POS Terminal:** Instant barcode scanning, items cart, bill summary, and 80mm thermal receipt printing.
- **MFS Management:** bKash, Nagad, Rocket buy/sale transactions, live balance tracking, and commission calculation.
- **Inventory & Stock:** Stock monitoring, low-stock warnings, and barcode price tag generation.
- **Customer Ledger (Baki Khata):** Outstanding dues tracking, payment collection receipts, and SMS reminders.
- **Expenses & Purchases:** Daily shop expense ledger and wholesale supplier bills.
- **Reports:** Profit & Loss financial statement and CSV exports.
`;

  zip.file('README.md', readmeContent);

  // Generate ZIP file blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'khan-management-pos-full-code.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
