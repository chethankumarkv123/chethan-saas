export const SEO_CONTENT = {
    // --- PDF TOOLS ---
    mergePdf: {
        toolName: "Merge PDF",
        description: "Combine multiple PDF files into a single document instantly in your browser. Organize your PDFs quickly without software installation.",
        useCases: [
            "Combining scanned pages into one invoice.",
            "Merging multiple chapters of a report.",
            "Organizing study materials into a single file.",
            "Consolidating work documents for sharing."
        ],
        steps: [
            "Upload your PDF files.",
            "Drag and drop to reorder pages if needed.",
            "Click 'Merge' to combine the files.",
            "Download your new single PDF document."
        ],
        limitsText: "Best for small to medium-sized PDF files to ensure fast processing directly in your browser."
    },
    splitPdf: {
        toolName: "Split PDF",
        description: "Separate a PDF into individual pages or extract specific page ranges quickly and securely.",
        useCases: [
            "Extracting a single page from a large report.",
            "Splitting a contract into separate sections.",
            "Removing unwanted pages from a scanned document.",
            "Breaking down a book into chapters."
        ],
        steps: [
            "Upload the PDF you want to split.",
            "Select the pages or ranges to extract.",
            "Click 'Split' to process the file.",
            "Download your selected pages as new PDFs."
        ],
        limitsText: "Processing speed depends on your browser capability for very large PDFs."
    },
    pdfRotate: {
        toolName: "Rotate PDF",
        description: "Permanently rotate individual pages or the entire PDF document. Fix orientation issues instantly.",
        useCases: [
            "Fixing upside-down scanned pages.",
            "Structuring standard documents.",
            "Correcting landscape/portrait mix.",
            "Organizing pages for printing."
        ],
        steps: [
            "Upload your PDF file.",
            "Select pages to rotate or choose 'All'.",
            "Set rotation angle (90°, 180°, 270°).",
            "Download the corrected PDF."
        ],
        limitsText: "Processing happens in-browser, ensuring privacy."
    },
    pdfSign: {
        toolName: "Sign PDF Online",
        description: "Add your electronic signature to any PDF document. Draw, type, or upload a signature image and place it anywhere.",
        useCases: [
            "Signing contracts and agreements.",
            "Completing application forms.",
            "Approving documents digitally.",
            "Adding initials to pages."
        ],
        steps: [
            "Upload the PDF you need to sign.",
            "Create your signature (Draw, Type, or Upload).",
            "Drag and drop the signature onto the page.",
            "Download the signed PDF document."
        ],
        limitsText: "Adds a visual image signature. Not a certified digital signature (e-sign). Files processed locally."
    },
    pdfToImage: {
        toolName: "PDF to Image",
        description: "Convert PDF pages into high-quality images (PNG/JPG) for easy sharing or embedding.",
        useCases: [
            "Turning a PDF flyer into an image for social media.",
            "Extracting charts or diagrams from reports.",
            "Making PDF content viewable on devices without PDF readers.",
            "Creating thumbnails for document previews."
        ],
        steps: [
            "Upload your PDF document.",
            "Choose the output format (PNG or JPG).",
            "Process the file to convert pages.",
            "Download individual images or a ZIP archive."
        ],
        limitsText: "High-resolution conversions work best with standard document sizes."
    },
    imageToPdf: {
        toolName: "Image to PDF",
        description: "Convert images (JPG, PNG) into a single PDF document. Perfect for creating portfolios or reports from photos.",
        useCases: [
            "Creating a PDF portfolio from image files.",
            "Compiling scanned photos into a document.",
            "Sending multiple receipts as one PDF.",
            "Converting screenshots into a readable report."
        ],
        steps: [
            "Upload your image files (JPG, PNG).",
            "Reorder images if necessary.",
            "Click 'Convert' to create the PDF.",
            "Download your new PDF document."
        ],
        limitsText: "Supports standard image formats. Very large images may be resized."
    },
    pdfToText: {
        toolName: "PDF to Text",
        description: "Extract plain text from your PDF documents for editing or analysis. Copy content easily.",
        useCases: [
            "Copying text from a read-only PDF.",
            "Extracting data for spreadsheets or analysis.",
            "Editing content from an old PDF document.",
            "Recovering text from uneditable files."
        ],
        steps: [
            "Upload your PDF file.",
            "Wait for the text extraction process.",
            "Review the extracted text preview.",
            "Copy to clipboard or download as a text file."
        ],
        limitsText: "Works best with text-based PDFs. Scanned PDFs without OCR may yield no text."
    },

    // --- UTILITY TOOLS ---
    compareText: {
        toolName: "Compare Text",
        description: "Find differences between two text blocks instantly. Highlight added, removed, and changed lines.",
        useCases: [
            "Comparing code versions or snippets.",
            "Checking differences between two document drafts.",
            "Verifying data consistency.",
            "Spotting changes in log files."
        ],
        steps: [
            "Paste the original text on the left.",
            "Paste the new text on the right.",
            "View the highlighted differences automatically.",
            "Copy snippets if needed."
        ],
        limitsText: "Designed for effective comparison of text snippets and code blocks."
    },
    commaSeparator: {
        toolName: "Comma Separator",
        description: "Convert lists into comma-separated values (CSV) or other formats instantly.",
        useCases: [
            "Formatting data for Excel or SQL queries.",
            "Converting a column of emails for bulk sending.",
            "Preparing lists for API payloads.",
            "Cleaning up raw data lists."
        ],
        steps: [
            "Paste your list of items.",
            "Select the desired separator (comma, new line, etc.).",
            "See the formatted text instantly.",
            "Copy the result to your clipboard."
        ],
        limitsText: "Handles standard text lists effectively."
    },
    textCleaner: {
        toolName: "Text Cleaner",
        description: "Remove robust formatting, extra spaces, and unwanted characters from your text efficiently.",
        useCases: [
            "Cleaning up text copied from a website.",
            "Removing extra spaces from a document.",
            "Normalization of text for database entry.",
            "Preparing content for clean pasting."
        ],
        steps: [
            "Paste your messy text.",
            "Select cleaning options (trim spaces, remove lines).",
            "View the cleaned text instantly.",
            "Copy the result."
        ],
        limitsText: "Text processing happens instantly in the browser."
    },

    // --- DEVELOPER TOOLS ---
    jsonFormatter: {
        toolName: "JSON Formatter",
        description: "Format, validate, and beautify JSON data. Make minimized JSON readable.",
        useCases: [
            "Debugging API responses.",
            "Formatting configuration files.",
            "Validating JSON structure.",
            "Beautifying minimized JSON code."
        ],
        steps: [
            "Paste your raw JSON string.",
            "View the formatted and colored output.",
            "Check for validation errors if any.",
            "Copy the beautified JSON."
        ],
        limitsText: "Handles standard JSON payloads efficiently."
    },
    jsonValidator: {
        toolName: "JSON Validator",
        description: "Check if your JSON data represents a valid object. Find syntax errors quickly.",
        useCases: [
            "Troubleshooting API errors.",
            "Validating config files before deployment.",
            "Checking raw data consistency.",
            "Learning valid JSON syntax."
        ],
        steps: [
            "Paste your JSON data.",
            "See instant validation status.",
            "Locate syntax errors highlighted.",
            "Fix and re-validate."
        ],
        limitsText: "Focused on syntax validation for standard JSON."
    },
    regexTester: {
        toolName: "Regex Tester",
        description: "Test your Regular Expressions against text strings in real-time. Debug patterns easily.",
        useCases: [
            "Testing email validation patterns.",
            "Debugging data extraction regex.",
            "Learning regex matching behavior.",
            "Verifying string search patterns."
        ],
        steps: [
            "Enter your Regex pattern.",
            "Enter the text to test against.",
            "See matches highlighted instantly.",
            "Check captured groups and flags."
        ],
        limitsText: "Supports JavaScript RegExp syntax."
    },
    uuidGenerator: {
        toolName: "UUID Generator",
        description: "Generate standard UUIDs (v4) instantly for your applications and databases.",
        useCases: [
            "Creating unique IDs for database records.",
            "Generating API keys or session identifiers.",
            "Mocking data for development.",
            "Testing ID handling in applications."
        ],
        steps: [
            "Select the number of UUIDs to generate.",
            "Click to generate.",
            "Copy a single ID or the whole list.",
            "Use in your project."
        ],
        limitsText: "Generates standard random (v4) UUIDs."
    },
    base64: {
        toolName: "Base64 Encoder/Decoder",
        description: "Encode text to Base64 or decode Base64 strings back to text instantly.",
        useCases: [
            "Encoding credentials for basic auth headers.",
            "Decoding data embedded in URLs.",
            "Inspecting Base64 encoded payloads.",
            "Data obfuscation tasks."
        ],
        steps: [
            "Choose Encode or Decode mode.",
            "Paste your input string.",
            "View the result immediately.",
            "Copy the output."
        ],
        limitsText: "Works with UTF-8 text strings."
    },
    urlEncoder: {
        toolName: "URL Encoder/Decoder",
        description: "Encode or decode URLs to ensure they are safe for browser address bars and APIs.",
        useCases: [
            "Debugging query parameters.",
            "Encoding special characters in URLs.",
            "Reading decoded API requests.",
            "Fixing broken link formats."
        ],
        steps: [
            "Choose Encode or Decode mode.",
            "Paste the URL string.",
            "Get the safe/readable URL instantly.",
            "Copy only what you need."
        ],
        limitsText: "Follows standard URI encoding rules."
    },
    hashGenerator: {
        toolName: "Hash Generator",
        description: "Create SHA-1 and SHA-256 hashes from any text using secure browser APIs.",
        useCases: [
            "Verifying file integrity checks.",
            "Hashing passwords for testing (never production!).",
            "Creating digital fingerprints of text.",
            "Learning about cryptographic hashes."
        ],
        steps: [
            "Enter your text input.",
            "View generated SHA-1 and SHA-256 hashes.",
            "Copy the specific hash you need.",
            "Clear to start over."
        ],
        limitsText: "Uses secure local browser crypto APIs. Does not support MD5."
    },

    // --- NETWORK & SYSTEM ---
    publicIp: {
        toolName: "What is My IP",
        description: "Instantly check your public IPv4 or IPv6 address directly from your browser.",
        useCases: [
            "Checking network configuration.",
            "Verifying VPN connection status.",
            "Whitelisting your IP for firewalls.",
            "Troubleshooting connectivity issues."
        ],
        steps: [
            "Open the page to see your IP.",
            "Identify if it is IPv4 or IPv6.",
            "Copy the address with one click.",
            "Refresh to check again."
        ],
        limitsText: "Detects the IP address visible to the public internet."
    },
    portLookup: {
        toolName: "Port Number Lookup",
        description: "Find out what common service runs on a specific network port number.",
        useCases: [
            "Identifying unknown traffic on a port.",
            "Configuring firewall rules.",
            "Debugging service connections.",
            "Learning standard registered ports."
        ],
        steps: [
            "Enter a port number (e.g. 80, 443).",
            "See the associated service name.",
            "Read brief details about the protocol.",
            "Clear to calculate another."
        ],
        limitsText: "Covers standard and common registered ports."
    },
    subnetCalc: {
        toolName: "Subnet Calculator",
        description: "Calculate network ranges, broadcast addresses, and netmasks from IP and CIDR.",
        useCases: [
            "Planning network infrastructure.",
            "Configuring router subnets.",
            "Calculating usable IP addresses.",
            "Learning CIDR notation."
        ],
        steps: [
            "Enter an IP address.",
            "Select the CIDR mask bit.",
            "View generated network details instantly.",
            "Copy necessary configuration data."
        ],
        limitsText: "Standard IPv4 subnet calculations."
    },

    // --- EXCEL & DATA TOOLS ---
    excelToJson: {
        toolName: "Excel to JSON Converter",
        description: "Convert Excel or CSV spreadsheets into clean JSON format for use in applications.",
        useCases: [
            "Importing spreadsheet data into a web app.",
            "Converting configs for developers.",
            "Migrating legacy data to modern formats.",
            "Quickly visualizing Excel data as code."
        ],
        steps: [
            "Upload your Excel or CSV file.",
            "Preview the data structure.",
            "See the generated JSON output.",
            "Copy or Download the JSON file."
        ],
        limitsText: "Optimized for single-sheet files and standard data sizes."
    },
    jsonToExcel: {
        toolName: "JSON to Excel Converter",
        description: "Transform JSON data arrays into downloadable Excel or CSV spreadsheets.",
        useCases: [
            "Exporting database records to Excel.",
            "Converting API responses for reporting.",
            "Analyzing JSON data in a spreadsheet.",
            "Creating reports from data dumps."
        ],
        steps: [
            "Paste your JSON array of objects.",
            "Preview the table representation.",
            "Click on 'Download Excel' or 'CSV'.",
            "Open file in your spreadsheet software."
        ],
        limitsText: "Requires a flat JSON array of objects for best results."
    },
    csvCleaner: {
        toolName: "CSV Cleaner",
        description: "Clean messy CSV files by trimming spaces, fixing headers, and removing empty rows.",
        useCases: [
            "Preparing data for database import.",
            "Cleaning up manual data entry errors.",
            "Standardizing files from different sources.",
            "Removing blank rows automatically."
        ],
        steps: [
            "Upload your messy CSV file.",
            "View the cleaning statistics.",
            "Preview the cleaned data.",
            "Download the optimized CSV file."
        ],
        limitsText: "Processing is done locally in browser. Best for mid-sized CSVs."
    },
    duplicateFinder: {
        toolName: "Duplicate Finder",
        description: "Identify and remove duplicate rows from your Excel or CSV files instantly.",
        useCases: [
            "Cleaning mailing lists.",
            "Removing redundant database entries.",
            "Sanitizing survey responses.",
            "Ensuring data uniqueness."
        ],
        steps: [
            "Upload your data file.",
            "See the count of unique vs duplicate rows.",
            "Preview unique data.",
            "Download the deduplicated file."
        ],
        limitsText: "Detects exact row matches. Limit of 5000 rows for browser performance."
    },
    formulaExplainer: {
        toolName: "Excel Formula Explainer",
        description: "Paste an Excel formula and get a simple English explanation of what it does.",
        useCases: [
            "Understanding inherited spreadsheets.",
            "Debugging complex nested formulas.",
            "Learning how Excel functions work.",
            "Documenting spreadsheet logic."
        ],
        steps: [
            "Paste your Excel formula.",
            "Click 'Explain'.",
            "Read the breakdown of the logic.",
            "Use the knowledge to fix or improve it."
        ],
        limitsText: "Supports common logic, lookup, and math functions."
    },

    // --- TIME TOOLS ---
    timestampConverter: {
        toolName: "Unix Timestamp Converter",
        description: "Convert Unix timestamps to human-readable dates and vice versa.",
        useCases: [
            "Debugging server logs.",
            "Setting database query timeframes.",
            "converting API date formats.",
            "Checking epoch times."
        ],
        steps: [
            "Enter a timestamp or a date.",
            "See the converted equivalent instantly.",
            "Copy the result.",
            "Switch formats if needed."
        ],
        limitsText: "Outputs standard ISO and local date formats."
    },
    cronExplainer: {
        toolName: "Cron Expression Explainer",
        description: "Translate cryptic cron schedule expressions into clear English sentences.",
        useCases: [
            "Verifying server job schedules.",
            "Setting up automated tasks.",
            "Debugging cron syntax errors.",
            "Understanding legacy crontab entries."
        ],
        steps: [
            "Enter your Cron expression (e.g. * * * * *).",
            "Read the human-readable explanation.",
            "Check expected run times.",
            "Adjust expression as needed."
        ],
        limitsText: "Supports standard 5-part cron syntax."
    },

    // --- PLACEHOLDERS FOR OTHERS TO USE GENERIC ---
    generic: {
        toolName: "Developer Tool",
        description: "A useful utility for developers and professionals to simplify daily tasks.",
        useCases: ["Simplifying complex tasks.", "Converting data formats.", "Debugging code.", "Improving productivity."],
        steps: ["Input your data.", "Process with the tool.", "View the result.", "Copy or download output."],
        limitsText: "Designed for speed and privacy."
    }
};

export const getSeoConfig = (key) => {
    return SEO_CONTENT[key] || SEO_CONTENT.generic;
};
