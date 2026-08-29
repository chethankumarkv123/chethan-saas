(function () {
  'use strict';

  // Suppress development-only console notices
  if (typeof console !== 'undefined' && console.warn) {
    var _warn = console.warn;
    console.warn = function () {
      if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('cdn.tailwindcss.com') !== -1) {
        return;
      }
      _warn.apply(console, arguments);
    };
  }

  // 1. Master Tool Catalog (All 34 Tools)
  var ALL_TOOLS = [
    { name: 'HTML to PDF', url: './htmlto.html', category: 'pdf', icon: 'fa-code', desc: 'Convert HTML code or web files to PDF' },
    { name: 'PDF Compressor', url: './pdf-compressor.html', category: 'pdf', icon: 'fa-compress-alt', desc: 'Reduce PDF file sizes up to 80%' },
    { name: 'PDF to Word', url: './pdftoword.html', category: 'pdf', icon: 'fa-file-word', desc: 'Convert PDF to editable DOCX' },
    { name: 'PDF to PowerPoint', url: './pdf-to-ppt.html', category: 'pdf', icon: 'fa-file-powerpoint', desc: 'Convert PDF slides to PPTX presentation' },
    { name: 'PDF Unlock', url: './pdf-unlock.html', category: 'pdf', icon: 'fa-unlock', desc: 'Remove password protection from PDF' },
    { name: 'QR Code Generator', url: './qr-generator.html', category: 'utility', icon: 'fa-qrcode', desc: 'Create custom QR codes for links & text' },
    { name: 'Image Compressor', url: './imagecompression.html', category: 'image', icon: 'fa-image', desc: 'Batch compress JPG, PNG, and WebP' },
    { name: 'Image Resizer', url: './imageresizer.html', category: 'image', icon: 'fa-expand-arrows-alt', desc: 'Resize & crop photos by dimensions' },
    { name: 'PDF Merge & Protect', url: './pdfmerge.html', category: 'pdf', icon: 'fa-layer-group', desc: 'Combine and password lock PDF files' },
    { name: 'PDF Split & Extract', url: './pdf-split.html', category: 'pdf', icon: 'fa-cut', desc: 'Extract specific pages or split PDF' },
    { name: 'PDF Rotate', url: './pdftorotate.html', category: 'pdf', icon: 'fa-redo', desc: 'Rotate sideways or upside-down pages' },
    { name: 'PDF to Excel', url: './pdftoexcel.html', category: 'pdf', icon: 'fa-file-excel', desc: 'Extract tabular data into XLSX sheets' },
    { name: 'PDF to CSV', url: './pdftocsv.html', category: 'pdf', icon: 'fa-table', desc: 'Extract table rows into CSV data' },
    { name: 'CSV to PDF', url: './csvto.html', category: 'data', icon: 'fa-file-csv', desc: 'Convert CSV data tables to PDF' },
    { name: 'Excel to PDF', url: './excelto.html', category: 'data', icon: 'fa-file-excel', desc: 'Convert multi-sheet Excel files to PDF' },
    { name: 'JSON to PDF', url: './jsonto.html', category: 'data', icon: 'fa-brackets-curly', desc: 'Format and export JSON data into PDF' },
    { name: 'XML to PDF', url: './xmlto.html', category: 'data', icon: 'fa-code-branch', desc: 'Render XML schemas into PDF documents' },
    { name: 'Speech to PDF', url: './speechto.html', category: 'utility', icon: 'fa-microphone', desc: 'Voice-to-text live transcription' },
    { name: 'Text to PDF', url: './textto.html', category: 'data', icon: 'fa-file-alt', desc: 'Plain text to structured PDF' },
    { name: 'PDF to JPG', url: './pdftojpg.html', category: 'pdf', icon: 'fa-file-image', desc: 'Convert PDF pages to JPG images' },
    { name: 'PDF to PNG', url: './pdftopng.html', category: 'pdf', icon: 'fa-file-image', desc: 'Lossless PNG image extraction' },
    { name: 'PDF to WEBP', url: './pdftowebp.html', category: 'pdf', icon: 'fa-file-image', desc: 'Convert PDF to modern WebP format' },
    { name: 'PDF to HTML', url: './pdftohtml.html', category: 'pdf', icon: 'fa-file-code', desc: 'Extract HTML code & styling from PDF' },
    { name: 'PDF to Text', url: './pdftotext.html', category: 'pdf', icon: 'fa-align-left', desc: 'Pure text extractor from PDF' },
    { name: 'PDF to JSON', url: './pdftojson.html', category: 'pdf', icon: 'fa-project-diagram', desc: 'Parse PDF content into JSON schema' },
    { name: 'PDF to XML', url: './pdftoxml.html', category: 'pdf', icon: 'fa-code', desc: 'Convert PDF document tree into XML' },
    { name: 'JPG to PDF', url: './jpgto.html', category: 'image', icon: 'fa-file-pdf', desc: 'Combine JPG photos into PDF' },
    { name: 'PNG to PDF', url: './pngto.html', category: 'image', icon: 'fa-file-pdf', desc: 'Assemble PNG pictures into PDF' },
    { name: 'WEBP to PDF', url: './webpto.html', category: 'image', icon: 'fa-file-pdf', desc: 'Convert WebP graphics into PDF' },
    { name: 'PDF to ZIP', url: './pdftozip.html', category: 'pdf', icon: 'fa-file-archive', desc: 'Package and compress PDF files in ZIP' },
    { name: 'YouTube Downloader', url: './yt/index.html', category: 'utility', icon: 'fa-youtube', desc: 'Download 4K/HD thumbnail images' },
    { name: 'Comma Separator', url: './comma-suparrator.html', category: 'data', icon: 'fa-stream', desc: 'Format lists into comma delimiters' },
    { name: 'Azure Cost Check', url: './azure-cost-check.html', category: 'data', icon: 'fa-cloud', desc: 'Find potential Azure cloud cost waste client-side' },
    { name: 'Text Comparator', url: './comparetexts.html', category: 'data', icon: 'fa-columns', desc: 'Side-by-side text diff & word counter' }
  ];

  // 2. Contextual Recommendations Map
  var RELATED_MAP = {
    'htmlto.html': ['pdf-compressor.html', 'pdfmerge.html', 'pdftoword.html', 'pdf-to-ppt.html'],
    'pdf-compressor.html': ['pdfmerge.html', 'pdf-split.html', 'pdf-unlock.html', 'pdftoword.html'],
    'pdf-unlock.html': ['pdf-compressor.html', 'pdfmerge.html', 'pdftoword.html', 'pdftoexcel.html'],
    'pdf-to-ppt.html': ['pdf-compressor.html', 'htmlto.html', 'pdfmerge.html', 'pdftoword.html'],
    'pdftoword.html': ['pdf-compressor.html', 'pdf-to-ppt.html', 'pdfmerge.html', 'pdftoexcel.html'],
    'pdfmerge.html': ['pdf-compressor.html', 'pdf-split.html', 'pdf-unlock.html', 'pdftorotate.html'],
    'pdf-split.html': ['pdfmerge.html', 'pdf-compressor.html', 'pdftozip.html', 'pdftorotate.html'],
    'pdftorotate.html': ['pdfmerge.html', 'pdf-compressor.html', 'pdf-split.html', 'pdftojpg.html'],
    'pdftoexcel.html': ['pdftocsv.html', 'excelto.html', 'csvto.html', 'pdf-compressor.html'],
    'pdftocsv.html': ['pdftoexcel.html', 'csvto.html', 'jsonto.html', 'comma-suparrator.html'],
    'csvto.html': ['excelto.html', 'jsonto.html', 'xmlto.html', 'pdf-compressor.html'],
    'excelto.html': ['csvto.html', 'pdftoexcel.html', 'jsonto.html', 'pdf-compressor.html'],
    'jsonto.html': ['xmlto.html', 'csvto.html', 'pdftojson.html', 'textto.html'],
    'xmlto.html': ['jsonto.html', 'csvto.html', 'pdftoxml.html', 'textto.html'],
    'speechto.html': ['textto.html', 'htmlto.html', 'pdf-compressor.html', 'pdfmerge.html'],
    'textto.html': ['speechto.html', 'htmlto.html', 'jsonto.html', 'pdf-compressor.html'],
    'pdftojpg.html': ['pdftopng.html', 'pdftowebp.html', 'pdf-compressor.html', 'jpgto.html'],
    'pdftopng.html': ['pdftojpg.html', 'pdftowebp.html', 'pngto.html', 'pdf-compressor.html'],
    'pdftowebp.html': ['pdftojpg.html', 'pdftopng.html', 'webpto.html', 'pdf-compressor.html'],
    'pdftohtml.html': ['htmlto.html', 'pdftoword.html', 'pdftotext.html', 'pdf-compressor.html'],
    'pdftotext.html': ['pdftohtml.html', 'textto.html', 'speechto.html', 'pdftocsv.html'],
    'pdftojson.html': ['jsonto.html', 'pdftoxml.html', 'pdftocsv.html', 'pdftotext.html'],
    'pdftoxml.html': ['xmlto.html', 'pdftojson.html', 'pdftocsv.html', 'pdftotext.html'],
    'jpgto.html': ['pngto.html', 'webpto.html', 'pdf-compressor.html', 'pdfmerge.html'],
    'pngto.html': ['jpgto.html', 'webpto.html', 'imagecompression.html', 'pdfmerge.html'],
    'webpto.html': ['jpgto.html', 'pngto.html', 'imagecompression.html', 'imageresizer.html'],
    'imagecompression.html': ['imageresizer.html', 'jpgto.html', 'pngto.html', 'webpto.html'],
    'imageresizer.html': ['imagecompression.html', 'jpgto.html', 'pngto.html', 'qr-generator.html'],
    'qr-generator.html': ['imageresizer.html', 'imagecompression.html', 'htmlto.html', 'pdfmerge.html'],
    'pdftozip.html': ['pdf-split.html', 'pdfmerge.html', 'pdf-compressor.html', 'pdftojpg.html'],
    'comma-suparrator.html': ['azure-cost-check.html', 'comparetexts.html', 'pdftocsv.html', 'csvto.html'],
    'azure-cost-check.html': ['comma-suparrator.html', 'comparetexts.html', 'pdftocsv.html', 'csvto.html'],
    'comparetexts.html': ['comma-suparrator.html', 'textto.html', 'pdftotext.html', 'speechto.html']
  };

  // 3. Generate Master Navbar HTML
  function getMasterNavbarHtml() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var isHome = path === 'index.html' || path === '';
    var isAzure = path === 'azure-cost-check.html';
    var isAbout = path === 'about.html';
    var isContact = path === 'contact.html';

    return `
      <nav id="masterGlobalNav" class="sticky top-0 z-50 bg-white/95 dark:bg-[#000000]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1f1f23] transition-colors shadow-sm w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            
            <!-- Logo -->
            <a href="./index.html" class="flex items-center space-x-3 group shrink-0">
              <img src="./chethan-saas.png" alt="OnePageTools Logo" class="h-12 w-auto transition-transform group-hover:scale-105">
            </a>

            <!-- Desktop Menu Links -->
            <div class="hidden md:flex items-center space-x-6">
              <a href="./index.html" class="text-sm font-medium ${isHome ? 'text-indigo-600 dark:text-[#38bdf8] font-bold' : 'text-slate-700 dark:text-slate-300'} hover:text-indigo-600 dark:hover:text-[#38bdf8] transition-colors">Home</a>
              <a href="./azure-cost-check.html" class="text-sm font-bold ${isAzure ? 'text-[#0070f3] dark:text-[#38bdf8]' : 'text-indigo-600 dark:text-[#38bdf8]'} hover:text-indigo-700 dark:hover:text-[#0070f3] transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-[#0070f3]/10 border border-indigo-200 dark:border-[#0070f3]/30">
                <i class="fas fa-cloud text-xs"></i> Azure Cost Check
              </a>
              <a href="./about.html" class="text-sm font-medium ${isAbout ? 'text-indigo-600 dark:text-[#38bdf8] font-bold' : 'text-slate-700 dark:text-slate-300'} hover:text-indigo-600 dark:hover:text-[#38bdf8] transition-colors">About</a>
              <a href="./contact.html" class="text-sm font-medium ${isContact ? 'text-indigo-600 dark:text-[#38bdf8] font-bold' : 'text-slate-700 dark:text-slate-300'} hover:text-indigo-600 dark:hover:text-[#38bdf8] transition-colors">Contact</a>

              <!-- All Tools Mega Menu Dropdown -->
              <div class="relative" id="masterMegaMenuContainer">
                <button id="masterMegaMenuBtn" type="button" class="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-[#38bdf8] transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-[#18181b] cursor-pointer">
                  <span>All 34 Tools</span>
                  <i class="fas fa-chevron-down ml-1.5 text-xs"></i>
                </button>
                
                <!-- Mega Dropdown Panel -->
                <div id="masterMegaMenuDropdown" class="hidden absolute right-0 mt-2 w-[760px] bg-white dark:bg-[#09090b] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#27272a] p-6 grid grid-cols-3 gap-6 text-sm z-50">
                  <div>
                    <h4 class="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-[#38bdf8] mb-3 flex items-center gap-1.5">
                      <i class="fas fa-file-export"></i> PDF Converters
                    </h4>
                    <ul class="space-y-2 text-slate-600 dark:text-slate-300">
                      <li><a href="./htmlto.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-code text-xs text-indigo-500"></i> HTML to PDF</a></li>
                      <li><a href="./pdftoword.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-file-word text-xs text-blue-500"></i> PDF to Word</a></li>
                      <li><a href="./pdf-to-ppt.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-file-powerpoint text-xs text-orange-500"></i> PDF to PPT</a></li>
                      <li><a href="./pdftoexcel.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-file-excel text-xs text-green-500"></i> PDF to Excel</a></li>
                      <li><a href="./pdftojpg.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-file-image text-xs text-yellow-500"></i> PDF to JPG</a></li>
                      <li><a href="./pdftopng.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-file-image text-xs text-teal-500"></i> PDF to PNG</a></li>
                      <li><a href="./pdftowebp.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-file-image text-xs text-purple-500"></i> PDF to WEBP</a></li>
                      <li><a href="./pdftotext.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-align-left text-xs text-slate-400"></i> PDF to Text</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-[#38bdf8] mb-3 flex items-center gap-1.5">
                      <i class="fas fa-tools"></i> PDF Management
                    </h4>
                    <ul class="space-y-2 text-slate-600 dark:text-slate-300">
                      <li><a href="./pdf-compressor.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-compress-alt text-xs text-red-500"></i> PDF Compressor</a></li>
                      <li><a href="./pdfmerge.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-layer-group text-xs text-indigo-500"></i> PDF Merge & Protect</a></li>
                      <li><a href="./pdf-split.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-cut text-xs text-amber-500"></i> PDF Split & Extract</a></li>
                      <li><a href="./pdftorotate.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-redo text-xs text-purple-500"></i> PDF Rotate</a></li>
                      <li><a href="./pdf-unlock.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-unlock text-xs text-rose-500"></i> PDF Unlock</a></li>
                      <li><a href="./pdftozip.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-file-archive text-xs text-gray-500"></i> PDF to ZIP</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-[#38bdf8] mb-3 flex items-center gap-1.5">
                      <i class="fas fa-cloud"></i> Images & Cloud Data
                    </h4>
                    <ul class="space-y-2 text-slate-600 dark:text-slate-300">
                      <li><a href="./azure-cost-check.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5 font-bold text-indigo-600 dark:text-[#38bdf8]"><i class="fas fa-cloud text-xs"></i> Azure Cost Check <span class="text-[9px] bg-indigo-100 dark:bg-[#0070f3]/20 px-1.5 py-0.5 rounded font-bold uppercase">New</span></a></li>
                      <li><a href="./comma-suparrator.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-stream text-xs text-violet-500"></i> Comma Separator</a></li>
                      <li><a href="./comparetexts.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-columns text-xs text-sky-500"></i> Text Diff</a></li>
                      <li><a href="./imagecompression.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-file-image text-xs text-emerald-500"></i> Image Compressor</a></li>
                      <li><a href="./imageresizer.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-expand-arrows-alt text-xs text-cyan-500"></i> Image Resizer</a></li>
                      <li><a href="./qr-generator.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fas fa-qrcode text-xs text-blue-500"></i> QR Generator</a></li>
                      <li><a href="./yt/index.html" class="hover:text-indigo-600 dark:hover:text-[#38bdf8] flex items-center gap-1.5"><i class="fab fa-youtube text-xs text-red-600"></i> YT Downloader</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side Controls -->
            <div class="flex items-center space-x-3">
              <button onclick="window.openCommandPalette()" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-slate-300 text-xs hover:border-indigo-400 dark:hover:border-[#0070f3] transition cursor-pointer" aria-label="Command Palette">
                <i class="fas fa-search text-[11px] text-slate-400"></i>
                <span>Quick Find</span>
                <kbd class="font-mono bg-white dark:bg-[#27272a] px-1.5 py-0.5 rounded border border-slate-300 dark:border-[#3f3f46] text-[10px]">Ctrl+K</kbd>
              </button>

              <!-- Theme Toggle Button -->
              <button id="themeToggle" class="p-2.5 rounded-xl bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#27272a] transition cursor-pointer" aria-label="Toggle Theme">
                <span id="themeIcon"><i class="fas fa-sun text-amber-400"></i></span>
              </button>
              
              <!-- Mobile Drawer Toggle -->
              <button id="masterMobileToggleBtn" type="button" class="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#27272a] cursor-pointer" aria-label="Open Navigation Menu">
                <i class="fas fa-bars text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Drawer -->
        <div id="masterMobileDrawer" class="hidden md:hidden border-t border-slate-200 dark:border-[#1f1f23] px-4 pt-4 pb-6 space-y-3 bg-white dark:bg-[#000000]">
          <div class="space-y-1">
            <a href="./index.html" class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#18181b]">Home</a>
            <a href="./azure-cost-check.html" class="block px-3 py-2 rounded-lg text-sm font-bold text-[#0070f3] dark:text-[#38bdf8] bg-indigo-50/60 dark:bg-[#0070f3]/10 flex items-center gap-2"><i class="fas fa-cloud"></i> Azure Cost Check</a>
            <a href="./about.html" class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#18181b]">About</a>
            <a href="./contact.html" class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#18181b]">Contact</a>
          </div>
          <div class="pt-2 border-t border-slate-100 dark:border-[#1f1f23]">
            <button onclick="window.openCommandPalette()" class="w-full text-left px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between">
              <span class="flex items-center gap-2"><i class="fas fa-search text-slate-400"></i> Search All 34 Tools</span>
              <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-[#27272a] text-[10px]">Ctrl+K</kbd>
            </button>
          </div>
        </div>
      </nav>
    `;
  }

  // 4. Inject and Bind Master Navigation
  function renderGlobalNavbar() {
    var existingNav = document.getElementById('masterGlobalNav') || document.querySelector('nav');
    if (existingNav) {
      existingNav.outerHTML = getMasterNavbarHtml();
    } else {
      document.body.insertAdjacentHTML('afterbegin', getMasterNavbarHtml());
    }

    // Attach Mobile Drawer Toggle
    var mobileBtn = document.getElementById('masterMobileToggleBtn');
    var mobileDrawer = document.getElementById('masterMobileDrawer');
    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        mobileDrawer.classList.toggle('hidden');
      });
    }

    // Attach Mega Dropdown Toggle
    var megaContainer = document.getElementById('masterMegaMenuContainer');
    var megaBtn = document.getElementById('masterMegaMenuBtn');
    var megaDropdown = document.getElementById('masterMegaMenuDropdown');
    
    if (megaBtn && megaDropdown) {
      megaBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        megaDropdown.classList.toggle('hidden');
      });

      // Hover support
      if (megaContainer) {
        megaContainer.addEventListener('mouseenter', function () {
          megaDropdown.classList.remove('hidden');
        });
        megaContainer.addEventListener('mouseleave', function () {
          megaDropdown.classList.add('hidden');
        });
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', function (e) {
        if (!megaBtn.contains(e.target) && !megaDropdown.contains(e.target)) {
          megaDropdown.classList.add('hidden');
        }
      });
    }
  }

  // 5. Global Theme Controller
  function initTheme() {
    var savedTheme = localStorage.getItem('site-theme') || 'dark';

    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      var icons = document.querySelectorAll('#themeIcon, .theme-icon');
      icons.forEach(function (icon) {
        icon.innerHTML = theme === 'dark' ? '<i class="fas fa-sun text-amber-400"></i>' : '<i class="fas fa-moon text-indigo-500"></i>';
      });
    }

    applyTheme(savedTheme);

    var toggleButtons = document.querySelectorAll('#themeToggle, #theme-toggle, #darkModeToggle, .theme-toggle-btn');
    toggleButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var isDark = document.documentElement.classList.contains('dark');
        var newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('site-theme', newTheme);
        applyTheme(newTheme);
      });
    });
  }

  // 6. Global Command Palette Modal (Ctrl+K / Cmd+K)
  function initCommandPalette() {
    if (document.getElementById('cmdPaletteModal')) return;

    var paletteHtml = `
      <div id="cmdPaletteModal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4 hidden transition-opacity">
        <div class="bg-white dark:bg-[#09090b] w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-[#27272a] overflow-hidden transform transition-all">
          <div class="relative border-b border-slate-200 dark:border-[#27272a]">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input id="cmdPaletteInput" type="text" placeholder="Jump to any tool (Type e.g. azure, compress, word, qualys, csv)..." class="w-full pl-11 pr-12 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none" autocomplete="off">
            <kbd class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-slate-100 dark:bg-[#18181b] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-[#27272a] font-mono">ESC</kbd>
          </div>
          <div id="cmdPaletteResults" class="max-h-80 overflow-y-auto p-2 space-y-1"></div>
          <div class="p-3 bg-slate-50 dark:bg-[#050505] border-t border-slate-200 dark:border-[#27272a] text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Type to search 34 in-browser tools</span>
            <span>Press <kbd class="font-mono bg-white dark:bg-[#18181b] px-1 py-0.5 rounded border dark:border-[#27272a]">ESC</kbd> to close</span>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', paletteHtml);

    var modal = document.getElementById('cmdPaletteModal');
    var input = document.getElementById('cmdPaletteInput');
    var results = document.getElementById('cmdPaletteResults');

    function renderResults(query) {
      var q = (query || '').toLowerCase().trim();
      var filtered = ALL_TOOLS.filter(function (t) {
        return !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      });

      results.innerHTML = '';
      if (filtered.length === 0) {
        results.innerHTML = '<div class="p-6 text-center text-sm text-slate-400">No matching tools found.</div>';
        return;
      }

      filtered.forEach(function (tool) {
        var a = document.createElement('a');
        a.href = tool.url;
        a.className = 'flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-[#18181b] transition group';
        a.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-[#0070f3]/10 text-indigo-600 dark:text-[#38bdf8] flex items-center justify-center text-sm">
              <i class="fas ${tool.icon}"></i>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#38bdf8]">${tool.name}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">${tool.desc}</div>
            </div>
          </div>
          <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#18181b] px-2 py-0.5 rounded">${tool.category}</span>
        `;
        results.appendChild(a);
      });
    }

    function openPalette() {
      modal.classList.remove('hidden');
      input.value = '';
      renderResults('');
      setTimeout(function () { input.focus(); }, 50);
    }

    function closePalette() {
      modal.classList.add('hidden');
    }

    window.openCommandPalette = openPalette;

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('hidden')) openPalette();
        else closePalette();
      }
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closePalette();
      }
    });

    input.addEventListener('input', function () {
      renderResults(input.value);
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closePalette();
    });
  }

  // 7. Contextual Suggested Tools
  function renderSuggestedTools() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === 'index.html' || path === '' || path === 'about.html' || path === 'contact.html' || path === 'privacy-policy.html' || path === 'disclaimer.html') {
      return;
    }

    var relatedKeys = RELATED_MAP[path] || ['azure-cost-check.html', 'pdf-compressor.html', 'htmlto.html', 'pdftoword.html'];
    var matchedTools = ALL_TOOLS.filter(function (t) {
      return relatedKeys.some(function (k) { return t.url.endsWith(k); });
    });

    if (matchedTools.length === 0) return;
    if (document.getElementById('optSuggestedToolsSection')) return;

    var suggestedHtml = document.createElement('section');
    suggestedHtml.id = 'optSuggestedToolsSection';
    suggestedHtml.className = 'max-w-5xl mx-auto px-4 py-12 border-t border-slate-200 dark:border-[#1f1f23] my-8 w-full';

    var cardsHtml = matchedTools.map(function (tool) {
      return `
        <a href="${tool.url}" class="group block p-4 bg-slate-50 dark:bg-[#09090b] hover:bg-white dark:hover:bg-[#111115] rounded-2xl border border-slate-200 dark:border-[#27272a] hover:border-indigo-500 dark:hover:border-[#0070f3] hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-[#0070f3]/10 text-indigo-600 dark:text-[#38bdf8] flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
              <i class="fas ${tool.icon}"></i>
            </div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#38bdf8]">${tool.name}</h4>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${tool.desc}</p>
          <div class="mt-3 text-[11px] font-semibold text-indigo-600 dark:text-[#38bdf8] flex items-center gap-1">
            <span>Open Tool</span>
            <i class="fas fa-arrow-right text-[9px] group-hover:translate-x-1 transition-transform"></i>
          </div>
        </a>
      `;
    }).join('');

    suggestedHtml.innerHTML = `
      <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/30">
              <i class="fas fa-sparkles text-indigo-400"></i>
              <span>Next Step Recommendations</span>
            </div>
            <h3 class="text-xl font-bold text-white tracking-tight">Suggested Tools for Your Workflow</h3>
          </div>
          <a href="./index.html#toollists" class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition">
            <span>View all 34 tools</span>
            <i class="fas fa-arrow-right text-[10px]"></i>
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          ${cardsHtml}
        </div>
      </div>
    `;

    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(suggestedHtml, footer);
    } else {
      document.body.appendChild(suggestedHtml);
    }
  }

    // 9. Lightweight 60FPS Ambient Moving Particles & Constellation Engine
  function initAmbientParticles() {
    if (document.getElementById('ambientParticleCanvas')) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'ambientParticleCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.75';
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var width, height;
    var particles = [];
    var particleCount = Math.min(window.innerWidth > 768 ? 45 : 22, 50);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Create particles
    for (var i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.5 + 1.5,
        color: i % 3 === 0 ? 'rgba(0, 112, 243, ' : (i % 3 === 1 ? 'rgba(139, 92, 246, ' : 'rgba(6, 182, 212, '),
        alpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }

    var mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      var isDark = document.documentElement.classList.contains('dark');
      var baseLineAlpha = isDark ? 0.12 : 0.08;
      var lineDist = 130;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce from edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse gentle interaction
        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x -= (dx / dist) * 0.8;
          p.y -= (dy / dist) * 0.8;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (isDark ? p.alpha : p.alpha * 0.8) + ')';
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.shadowColor = p.color + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect lines
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var ldx = p.x - p2.x;
          var ldy = p.y - p2.y;
          var ldist = Math.sqrt(ldx * ldx + ldy * ldy);

          if (ldist < lineDist) {
            var lineOpacity = (1 - (ldist / lineDist)) * baseLineAlpha;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark ? `rgba(99, 102, 241, ${lineOpacity})` : `rgba(79, 70, 229, ${lineOpacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  // 8. Initialize Everything on DOM Load
  function initAll() {
    initAmbientParticles();
    renderGlobalNavbar();
    initTheme();
    initCommandPalette();
    renderSuggestedTools();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
