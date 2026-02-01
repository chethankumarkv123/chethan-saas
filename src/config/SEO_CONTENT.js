
export const SEO_CONTENT = {
    // --- PDF TOOLS ---
    pdfMerge: {
        toolName: "Merge PDF",
        description: "Combine multiple PDF files into a single document instantly in your browser.",
        useCases: ["Merging chapters.", "Combining invoices.", "Consolidating reports.", "Organizing documents."],
        steps: ["Upload PDFs.", "Reorder pages.", "Click Merge.", "Download."],
        limitsText: "Best for files < 50MB."
    },
    pdfSplit: {
        toolName: "Split PDF",
        description: "Separate a PDF into individual pages or extract specific page ranges.",
        useCases: ["Extracting pages.", "Removing pages.", "Splitting chapters.", "Isolating sections."],
        steps: ["Upload PDF.", "Select pages.", "Click Split.", "Download."],
        limitsText: "Local processing."
    },
    pdfRotate: {
        toolName: "Rotate PDF",
        description: "Permanently rotate individual pages or the entire PDF document.",
        useCases: ["Fixing orientation.", "Rotating scans.", "Correcting layouts.", "Adjusting pages."],
        steps: ["Upload PDF.", "Select rotation.", "Apply.", "Download."],
        limitsText: "Safe and private."
    },
    pdfSign: {
        toolName: "Sign PDF",
        description: "Add your electronic signature to any PDF document.",
        useCases: ["Signing contracts.", "Approving forms.", "Adding initials.", "Digital signatures."],
        steps: ["Upload PDF.", "Create signature.", "Place on page.", "Download."],
        limitsText: "Visual signature only."
    },
    pdfCompress: {
        toolName: "Compress PDF",
        description: "Reduce PDF file size while maintaining quality for emailing or uploading.",
        useCases: ["Shrinking email attachments.", "Optimizing storage.", "Faster uploads.", "Web publishing."],
        steps: ["Upload PDF.", "Wait for compression.", "Check size savings.", "Download."],
        limitsText: "Browser-based compression."
    },
    pdfUnlock: {
        toolName: "Unlock PDF",
        description: "Remove owner passwords and restrictions from PDF files instantly.",
        useCases: ["Printing restricted PDFs.", "Copying text.", "Editing locked files.", "Recovering access."],
        steps: ["Upload locked PDF.", "Enter password if known.", "Remove restrictions.", "Download."],
        limitsText: "Can remove restrictions if content is accessible."
    },
    pdfAddText: {
        toolName: "Add Text to PDF",
        description: "Insert text, notes, or captions anywhere on your PDF pages.",
        useCases: ["Filling headers.", "Adding comments.", "Labeling pages.", "Inserting info."],
        steps: ["Upload PDF.", "Type text.", "Position it.", "Download."],
        limitsText: "Simple text overlay."
    },
    pdfAddDate: {
        toolName: "Add Date to PDF",
        description: "Stamp your PDF with the current date or a custom timestamp.",
        useCases: ["Dating forms.", "Timestamping receipts.", "Marking versions.", "Legal dating."],
        steps: ["Upload PDF.", "Select date format.", "Stamp page.", "Download."],
        limitsText: "Customizable formats."
    },
    pdfAddImage: {
        toolName: "Add Image to PDF",
        description: "Insert logos, watermarks, or photos into your PDF document.",
        useCases: ["Adding company logos.", "Inserting photos.", "Watermarking.", "Stamping seals."],
        steps: ["Upload PDF.", "Upload Image.", "Resize and place.", "Download."],
        limitsText: "Supports JPG/PNG."
    },
    pdfFillForm: {
        toolName: "Fill PDF Form",
        description: "Type directly onto PDF forms that are not interactive.",
        useCases: ["Filling applications.", "Completing surveys.", "Typing on scans.", "Digital paperwork."],
        steps: ["Upload PDF.", "Click to type.", "Fill fields.", "Download."],
        limitsText: "Text input only."
    },
    pdfHighlight: {
        toolName: "Highlight PDF",
        description: "Highlight important text or areas on your PDF pages.",
        useCases: ["Reviewing drafts.", "Marking key points.", "Studying notes.", "Emphasizing text."],
        steps: ["Upload PDF.", "Select highlight area.", "Apply color.", "Download."],
        limitsText: "Visual overlay."
    },
    pdfToJpg: {
        toolName: "PDF to JPG",
        description: "Convert PDF pages to JPG images.",
        useCases: ["Social media sharing.", "Extracting images.", "Thumbnail creation.", "Web usage."],
        steps: ["Upload PDF.", "Convert pages.", "Download images.", "Save as ZIP."],
        limitsText: "High quality output."
    },
    pdfToPng: {
        toolName: "PDF to PNG",
        description: "Convert PDF pages to PNG images.",
        useCases: ["High res graphics.", "Transparent conversion.", "Design assets.", "Lossless extraction."],
        steps: ["Upload PDF.", "Convert.", "Download PNGs.", "Save as ZIP."],
        limitsText: "Lossless quality."
    },
    jpgToPdf: {
        toolName: "JPG to PDF",
        description: "Convert JPGs to a single PDF.",
        useCases: ["Photo albums.", "Receipt compilation.", "Scanned docs.", "Portfolios."],
        steps: ["Upload JPGs.", "Order them.", "Convert.", "Download PDF."],
        limitsText: "Unlimited pages."
    },
    pngToPdf: {
        toolName: "PNG to PDF",
        description: "Convert PNGs to PDF.",
        useCases: ["Graphic portfolios.", "Screenshot docs.", "Design presentations.", "Archiving."],
        steps: ["Upload PNGs.", "Order them.", "Convert.", "Download PDF."],
        limitsText: "Maintains aspect ratio."
    },
    pdfToWord: {
        toolName: "PDF to Word",
        description: "Convert PDF documents to editable Microsoft Word (DOCX) files.",
        useCases: ["Editing contracts.", "Recovering content.", "Repurposing docs.", "Formatting text."],
        steps: ["Upload PDF.", "Convert to DOCX.", "Download file.", "Edit in Word."],
        limitsText: "Text-based PDFs work best."
    },
    pdfToExcel: {
        toolName: "PDF to Excel",
        description: "Extract tables from PDF to Excel spreadsheets.",
        useCases: ["Financial analysis.", "Data extraction.", "Inventory lists.", "Table recovery."],
        steps: ["Upload PDF.", "Extract tables.", "Download XLSX.", "Open in Excel."],
        limitsText: "Tabular data only."
    },
    pdfToCsv: {
        toolName: "PDF to CSV",
        description: "Convert PDF tables to CSV format.",
        useCases: ["Database import.", "Data analysis.", "Spreadsheet work.", "Raw data access."],
        steps: ["Upload PDF.", "Convert.", "Download CSV.", "Import data."],
        limitsText: "Best for simple tables."
    },
    pdfToText: {
        toolName: "PDF to Text",
        description: "Extract raw text from PDF files.",
        useCases: ["Copying content.", "Data mining.", "Text analysis.", "Reading."],
        steps: ["Upload PDF.", "Extract text.", "Copy or Download.", "Use text."],
        limitsText: "Extracts readable text."
    },
    pdfToHtml: {
        toolName: "PDF to HTML",
        description: "Convert PDF to HTML web pages.",
        useCases: ["Web publishing.", "Blog posts.", "Online viewing.", "Accessibility."],
        steps: ["Upload PDF.", "Convert.", "Get HTML code.", "Publish."],
        limitsText: "Basic layout preservation."
    },

    // --- DEVELOPER TOOLS ---
    jsonFormatter: {
        toolName: "JSON Formatter",
        description: "Format and validate JSON data.",
        useCases: ["Debugging.", "Pretty printing.", "Validation.", "Learning."],
        steps: ["Paste JSON.", "Format.", "Check errors.", "Copy."],
        limitsText: "Instant validation."
    },
    jsonValidator: {
        toolName: "JSON Validator",
        description: "Validate JSON syntax errors.",
        useCases: ["Debugging API.", "Checking config.", "Fixing syntax.", "Verification."],
        steps: ["Paste JSON.", "Validate.", "See errors.", "Fix."],
        limitsText: "Strict syntax check."
    },
    jwtDecoder: {
        toolName: "JWT Decoder",
        description: "Decode and verify JSON Web Tokens.",
        useCases: ["Debugging Auth.", "Checking claims.", "Verifying expiration.", "Inspecting tokens."],
        steps: ["Paste Token.", "View Header/Payload.", "Verify Signature.", "Check Expiry."],
        limitsText: "Client-side decoding."
    },
    base64: {
        toolName: "Base64 Tool",
        description: "Encode and Decode Base64 strings.",
        useCases: ["Data encoding.", "URL safety.", "Obfuscation.", "Debugging."],
        steps: ["Enter text.", "Encode/Decode.", "View result.", "Copy."],
        limitsText: "UTF-8 support."
    },
    urlEncoder: {
        toolName: "URL Encoder",
        description: "Encode and Decode URLs.",
        useCases: ["Safe links.", "Query params.", "API debugging.", "Fixing URLs."],
        steps: ["Enter URL.", "Encode/Decode.", "Result.", "Copy."],
        limitsText: "Standard URI encoding."
    },
    htmlEncoder: {
        toolName: "HTML Encoder",
        description: "Escape HTML entities.",
        useCases: ["XSS prevention.", "Code snipping.", "Displaying code.", "Safety."],
        steps: ["Enter HTML.", "Encode.", "Get entities.", "Copy."],
        limitsText: "Standard entities."
    },
    uuidGenerator: {
        toolName: "UUID Generator",
        description: "Generate random UUIDs.",
        useCases: ["Database IDs.", "Session keys.", "Unique tokens.", "Testing."],
        steps: ["Select count.", "Generate.", "Copy IDs.", "Use."],
        limitsText: "V4 UUIDs."
    },
    regexTester: {
        toolName: "Regex Tester",
        description: "Test regular expressions.",
        useCases: ["Pattern matching.", "Validation.", "Search/Replace.", "Learning."],
        steps: ["Enter Regex.", "Enter Text.", "See matches.", "Debug."],
        limitsText: "JS RegExp."
    },
    cronGenerator: {
        toolName: "Cron Generator",
        description: "Create Cron schedule expressions graphically.",
        useCases: ["Scheduling tasks.", "Server jobs.", "Automation.", "Learning Cron."],
        steps: ["Select intervals.", "View expression.", "Copy.", "Implement."],
        limitsText: "Standard Cron syntax."
    },
    cronExplainer: {
        toolName: "Cron Explainer",
        description: "Explain Cron expressions in English.",
        useCases: ["Understanding schedules.", "Debugging.", "Verification.", "Learning."],
        steps: ["Paste Cron.", "Read explanation.", "Verify.", "Use."],
        limitsText: "Standard syntax."
    },
    chmodCalc: {
        toolName: "Chmod Calculator",
        description: "Calculate Linux file permissions.",
        useCases: ["Server admin.", "File security.", "Script setup.", "Learning permissions."],
        steps: ["Select permissions.", "Get code (755).", "Copy.", "Apply."],
        limitsText: "Octal and Symbolic."
    },
    sshGenerator: {
        toolName: "SSH Key Gen",
        description: "Generate SSH key pairs.",
        useCases: ["Server access.", "Git auth.", "Secure shell.", "Encryption."],
        steps: ["Generate.", "Copy Private/Public.", "Save secure.", "Use."],
        limitsText: "Client-side generation."
    },
    sqlRunner: {
        toolName: "SQL Runner",
        description: "Run SQL on CSV files.",
        useCases: ["Data analysis.", "Querying CSV.", "Reporting.", "Filtering."],
        steps: ["Upload CSV.", "Write SQL.", "Run query.", "See results."],
        limitsText: "In-browser SQLite."
    },
    timestampConverter: {
        toolName: "Timestamp Converter",
        description: "Convert Unix timestamps.",
        useCases: ["Date debugging.", "Log analysis.", "Time conversion.", "Epoch time."],
        steps: ["Enter timestamp.", "See date.", "Convert back.", "Copy."],
        limitsText: "Seconds/Millis."
    },
    baseConverter: {
        toolName: "Base Converter",
        description: "Convert numbers between bases.",
        useCases: ["Binary/Hex/Decimal.", "Low-level coding.", "Math.", "Networking."],
        steps: ["Enter number.", "Select bases.", "Convert.", "Copy."],
        limitsText: "Bin/Oct/Dec/Hex."
    },
    dataSizeConverter: {
        toolName: "Data Converter",
        description: "Convert byte sizes.",
        useCases: ["Storage calc.", "Bandwidth.", "File sizes.", "Engineering."],
        steps: ["Enter size.", "Convert.", "See units.", "Copy."],
        limitsText: "B/KB/MB/GB/TB."
    },
    ipSubnetCalculator: {
        toolName: "Subnet Calculator",
        description: "Calculate subnets and IP ranges.",
        useCases: ["Networking.", "CIDR.", "IP planning.", "Config."],
        steps: ["Enter IP/CIDR.", "Calculate.", "See info.", "Copy."],
        limitsText: "IPv4."
    },
    cidrOverlap: {
        toolName: "CIDR Overlap",
        description: "Check if two CIDR ranges overlap.",
        useCases: ["Network planning.", "Avoiding conflicts.", "Security rules.", "AWS VPC."],
        steps: ["Enter CIDR 1.", "Enter CIDR 2.", "Check.", "Result."],
        limitsText: "IPv4."
    },
    publicIp: {
        toolName: "What is My IP",
        description: "Check your public IP address.",
        useCases: ["Connectivity.", "VPN check.", "Whitelisting.", "Info."],
        steps: ["Open page.", "See IP.", "Copy.", "Done."],
        limitsText: "IPv4/IPv6."
    },
    portLookup: {
        toolName: "Port Lookup",
        description: "Find service by port number.",
        useCases: ["Firewall config.", "Debugging.", "Security.", "Learning."],
        steps: ["Enter port.", "Search.", "See service.", "Copy."],
        limitsText: "Common ports."
    },
    hashGenerator: {
        toolName: "Hash Generator",
        description: "Generate SHA/MD5 hashes.",
        useCases: ["Integrity check.", "Security.", "Fingerprinting.", "Comparisons."],
        steps: ["Enter text.", "Generate.", "Copy hash.", "Verify."],
        limitsText: "SHA-1/256."
    },

    // --- UTILITY & OTHER ---
    qrCode: {
        toolName: "QR Generator",
        description: "Create QR codes.",
        useCases: ["Sharing URLs.", "Wifi login.", "Contacts.", "Marketing."],
        steps: ["Enter text.", "Generate.", "Download URL.", "Print."],
        limitsText: "PNG output."
    },
    imageResizer: {
        toolName: "Image Resizer",
        description: "Resize images to specific dimensions.",
        useCases: ["Web optimization.", "Social media.", "Thumbnails.", "Email."],
        steps: ["Upload.", "Set size.", "Resize.", "Download."],
        limitsText: "JPG/PNG."
    },
    imageCompressor: {
        toolName: "Image Compressor",
        description: "Compress images to save space.",
        useCases: ["Web speed.", "Storage.", "Emailing.", "Performance."],
        steps: ["Upload.", "Compress.", "Compare.", "Download."],
        limitsText: "Lossy/Lossless."
    },
    commaSeparator: {
        toolName: "Comma Separator",
        description: "Convert column to comma separated list.",
        useCases: ["SQL IN clauses.", "CSV generation.", "Data formatting.", "Lists."],
        steps: ["Paste column.", "Select delimiter.", "Convert.", "Copy."],
        limitsText: "Text processing."
    },
    compareText: {
        toolName: "Diff Checker",
        description: "Compare two text blocks.",
        useCases: ["Code diffs.", "Version check.", "Drafts.", "Changes."],
        steps: ["Paste Left.", "Paste Right.", "Compare.", "View diff."],
        limitsText: "Line by line."
    },
    textCleaner: {
        toolName: "Text Cleaner",
        description: "Clean and format text.",
        useCases: ["Removing format.", "Trimming.", "Deduping.", "Cleaning."],
        steps: ["Paste text.", "Clean.", "View.", "Copy."],
        limitsText: "Auto-format."
    },
    excelToJson: {
        toolName: "Excel to JSON",
        description: "Convert Excel/CSV to JSON.",
        useCases: ["Data migration.", "Dev config.", "Importing.", "Web apps."],
        steps: ["Upload.", "Convert.", "Download.", "Copy."],
        limitsText: "Standard sheets."
    },
    jsonToExcel: {
        toolName: "JSON to Excel",
        description: "Convert JSON to Excel/CSV.",
        useCases: ["Reporting.", "Data export.", "Spreadsheets.", "Analysis."],
        steps: ["Paste JSON.", "Convert.", "Download.", "Open."],
        limitsText: "Flat objects."
    },
    csvCleaner: {
        toolName: "CSV Cleaner",
        description: "Clean CSV files.",
        useCases: ["Data prep.", "Fixing formats.", "Removing empty.", "Standardizing."],
        steps: ["Upload.", "Clean.", "Preview.", "Download."],
        limitsText: "Browser processing."
    },
    duplicateFinder: {
        toolName: "Duplicate Finder",
        description: "Remove duplicates from data.",
        useCases: ["Mailing lists.", "Data hygiene.", "Uniqueness.", "Filtering."],
        steps: ["Upload.", "Find dupes.", "Remove.", "Download."],
        limitsText: "Exact match."
    },
    formulaExplainer: {
        toolName: "Excel Formula Explainer",
        description: "Explain Excel formulas in English.",
        useCases: ["Learning.", "Debugging.", "Documentation.", "Understanding."],
        steps: ["Paste formula.", "Explain.", "Read.", "Understand."],
        limitsText: "Common functions."
    },

    // --- GENERIC FALLBACK ---
    generic: {
        toolName: "Developer Tool",
        description: "A useful utility for developers and professionals.",
        useCases: ["Productivity.", "Conversion.", "Calculation.", "Automation."],
        steps: ["Input data.", "Process.", "View result.", "Download/Copy."],
        limitsText: "Private and secure."
    }
};

export const getSeoConfig = (key) => {
    return SEO_CONTENT[key] || SEO_CONTENT.generic;
};
