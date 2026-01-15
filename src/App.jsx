import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
// Context
import { UIProvider } from './context/UIContext';
// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalModal } from './components/GlobalModal';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { MobileDisclaimer } from './components/MobileDisclaimer';
import { ToastProvider } from './components/Toast';
import { ScrollToTop } from './components/ScrollToTop';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const Disclaimer = lazy(() => import('./pages/Disclaimer').then(module => ({ default: module.Disclaimer })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));

// Tools
const CompareText = lazy(() => import('./pages/CompareText').then(module => ({ default: module.CompareText })));
const CommaSeparator = lazy(() => import('./pages/CommaSeparator').then(module => ({ default: module.CommaSeparator })));
const PdfToWord = lazy(() => import('./pages/PdfToWord').then(module => ({ default: module.PdfToWord })));
const PdfToCsv = lazy(() => import('./pages/PdfToCsv').then(module => ({ default: module.PdfToCsv })));
const MergePdf = lazy(() => import('./pages/MergePdf').then(module => ({ default: module.MergePdf })));
const PdfSplit = lazy(() => import('./pages/PdfSplit').then(module => ({ default: module.PdfSplit })));
const PdfCompress = lazy(() => import('./pages/PdfCompress').then(module => ({ default: module.PdfCompress })));
const PdfUnlock = lazy(() => import('./pages/PdfUnlock').then(module => ({ default: module.PdfUnlock })));
const PdfRotate = lazy(() => import('./pages/PdfRotate').then(module => ({ default: module.PdfRotate })));
const PdfSign = lazy(() => import('./pages/PdfSign').then(module => ({ default: module.PdfSign })));
const PdfAddText = lazy(() => import('./pages/PdfAddText').then(module => ({ default: module.PdfAddText })));
const PdfFillForm = lazy(() => import('./pages/PdfFillForm').then(module => ({ default: module.PdfFillForm })));
const PdfAddDate = lazy(() => import('./pages/PdfAddDate').then(module => ({ default: module.PdfAddDate })));
const PdfAddImage = lazy(() => import('./pages/PdfAddImage').then(module => ({ default: module.PdfAddImage })));
const PdfHighlight = lazy(() => import('./pages/PdfHighlight').then(module => ({ default: module.PdfHighlight })));

const ImageTools = lazy(() => import('./pages/ImageTools').then(module => ({ default: module.ImageTools })));
const PdfToImage = lazy(() => import('./pages/PdfToImage').then(module => ({ default: module.PdfToImage })));
const ImagesToPdf = lazy(() => import('./pages/ImagesToPdf').then(module => ({ default: module.ImagesToPdf })));
const PdfToOther = lazy(() => import('./pages/PdfToOther').then(module => ({ default: module.PdfToOther })));
const TextToPdf = lazy(() => import('./pages/TextToPdf').then(module => ({ default: module.TextToPdf })));
const FileToPdf = lazy(() => import('./pages/FileToPdf').then(module => ({ default: module.FileToPdf })));
const JsonTools = lazy(() => import('./pages/JsonTools').then(module => ({ default: module.JsonTools })));
const QrCodeGenerator = lazy(() => import('./pages/QrCodeGenerator').then(module => ({ default: module.QrCodeGenerator })));
const TextCleaner = lazy(() => import('./pages/TextCleaner').then(module => ({ default: module.TextCleaner })));

// Developer Tools - Converters
const BaseConverter = lazy(() => import('./pages/devtools/Converters').then(module => ({ default: module.BaseConverter })));
const TimestampConverter = lazy(() => import('./pages/devtools/Converters').then(module => ({ default: module.TimestampConverter })));
const DataSizeConverter = lazy(() => import('./pages/devtools/Converters').then(module => ({ default: module.DataSizeConverter })));

// Developer Tools - Encoders
const Base64Tool = lazy(() => import('./pages/devtools/Encoders').then(module => ({ default: module.Base64Tool })));
const UrlEncoder = lazy(() => import('./pages/devtools/Encoders').then(module => ({ default: module.UrlEncoder })));
const HtmlEncoder = lazy(() => import('./pages/devtools/Encoders').then(module => ({ default: module.HtmlEncoder })));

// Developer Tools - Generators
const UuidGenerator = lazy(() => import('./pages/devtools/Generators').then(module => ({ default: module.UuidGenerator })));
const RandomString = lazy(() => import('./pages/devtools/Generators').then(module => ({ default: module.RandomString })));
const RandomNumber = lazy(() => import('./pages/devtools/Generators').then(module => ({ default: module.RandomNumber })));

// Developer Tools - Calculators
const ScientificCalc = lazy(() => import('./pages/devtools/Calculators').then(module => ({ default: module.ScientificCalc })));
const PercentageCalc = lazy(() => import('./pages/devtools/Calculators').then(module => ({ default: module.PercentageCalc })));
const DateDiff = lazy(() => import('./pages/devtools/Calculators').then(module => ({ default: module.DateDiff })));

// Developer Tools - Network
const IpSubnetCalculator = lazy(() => import('./pages/devtools/NetworkTools').then(module => ({ default: module.IpSubnetCalculator })));
const CidrOverlap = lazy(() => import('./pages/devtools/NetworkTools').then(module => ({ default: module.CidrOverlap })));

// Developer Tools - Linux/DevOps
const CronGenerator = lazy(() => import('./pages/devtools/LinuxTools').then(module => ({ default: module.CronGenerator })));
const ChmodCalc = lazy(() => import('./pages/devtools/LinuxTools').then(module => ({ default: module.ChmodCalc })));

// Developer Tools - Text & Config (Request 317)
const RegexTester = lazy(() => import('./pages/devtools/RegexTester').then(module => ({ default: module.RegexTester })));
const CaseConverter = lazy(() => import('./pages/devtools/TextComponents').then(module => ({ default: module.CaseConverter })));
const EnvConverter = lazy(() => import('./pages/devtools/TextComponents').then(module => ({ default: module.EnvConverter })));
const CurlConverter = lazy(() => import('./pages/devtools/CodeTools').then(module => ({ default: module.CurlConverter })));
const DiffChecker = lazy(() => import('./pages/devtools/CodeTools').then(module => ({ default: module.DiffChecker })));
const CidrSplitter = lazy(() => import('./pages/devtools/CloudTools').then(module => ({ default: module.CidrSplitter })));
const K8sConverter = lazy(() => import('./pages/devtools/CloudTools').then(module => ({ default: module.K8sConverter })));

// Excel & Data Tools
const ExcelToJson = lazy(() => import('./pages/excel/ExcelTools').then(module => ({ default: module.ExcelToJson })));
const JsonToExcel = lazy(() => import('./pages/excel/ExcelTools').then(module => ({ default: module.JsonToExcel })));
const CsvCleaner = lazy(() => import('./pages/excel/DataTools').then(module => ({ default: module.CsvCleaner })));
const FormulaExplainer = lazy(() => import('./pages/excel/DataTools').then(module => ({ default: module.FormulaExplainer })));

// Excel - Conversions (Request 381)
const ExcelToCsv = lazy(() => import('./pages/excel/ExcelConversions').then(module => ({ default: module.ExcelToCsv })));
const CsvToExcel = lazy(() => import('./pages/excel/ExcelConversions').then(module => ({ default: module.CsvToExcel })));
const ExcelToSql = lazy(() => import('./pages/excel/ExcelConversions').then(module => ({ default: module.ExcelToSql })));
const ExcelToYaml = lazy(() => import('./pages/excel/ExcelConversions').then(module => ({ default: module.ExcelToYaml })));

// Excel - Cleaning & Ops (Request 381)
const DuplicateFinder = lazy(() => import('./pages/excel/DataCleaning').then(module => ({ default: module.DuplicateFinder })));
const ColumnSplitter = lazy(() => import('./pages/excel/DataCleaning').then(module => ({ default: module.ColumnSplitter })));
const TransposeTool = lazy(() => import('./pages/excel/DataCleaning').then(module => ({ default: module.TransposeTool })));

// Excel - Utils (Request 381)
const ExcelDateConverter = lazy(() => import('./pages/excel/ExcelUtils').then(module => ({ default: module.ExcelDateConverter })));
const FormulaGenerator = lazy(() => import('./pages/excel/ExcelUtils').then(module => ({ default: module.FormulaGenerator })));

// Excel - Ops (Request 440)
const ExcelErrorExplainer = lazy(() => import('./pages/excel/ExcelOps').then(module => ({ default: module.ExcelErrorExplainer })));
const ColumnMerger = lazy(() => import('./pages/excel/ExcelOps').then(module => ({ default: module.ColumnMerger })));
const HeaderNormalizer = lazy(() => import('./pages/excel/ExcelOps').then(module => ({ default: module.HeaderNormalizer })));
const ExcelFilter = lazy(() => import('./pages/excel/ExcelFilter').then(module => ({ default: module.ExcelFilter })));
const ExcelDataProcessor = lazy(() => import('./pages/excel/ExcelDataProcessor').then(module => ({ default: module.ExcelDataProcessor })));


// Network & System (Request 411)
const PublicIp = lazy(() => import('./pages/devtools/NetworkRefTools').then(module => ({ default: module.PublicIp })));
const PortLookup = lazy(() => import('./pages/devtools/NetworkRefTools').then(module => ({ default: module.PortLookup })));
const HttpStatus = lazy(() => import('./pages/devtools/NetworkRefTools').then(module => ({ default: module.HttpStatus })));

// Security (Request 411)
const HashGenerator = lazy(() => import('./pages/devtools/SecurityTools').then(module => ({ default: module.HashGenerator })));

// Time & Schedule (Request 411)
const TimezoneConverter = lazy(() => import('./pages/devtools/TimeTools').then(module => ({ default: module.TimezoneConverter })));
const CronExplainer = lazy(() => import('./pages/devtools/TimeTools').then(module => ({ default: module.CronExplainer })));


function App() {
  return (
    <UIProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans flex flex-col">
          <Navbar />
          <MobileDisclaimer />
          <main className="flex-grow">
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><ProcessingOverlay isProcessing={true} message="Loading..." /></div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                {/* Utilities */}
                <Route path="/compare-text" element={<CompareText />} />
                <Route path="/comma-suparrator" element={<CommaSeparator />} />
                <Route path="/json-formatter" element={<JsonTools mode="formatter" />} />
                <Route path="/json-validator" element={<JsonTools mode="validator" />} />
                <Route path="/qr-code" element={<QrCodeGenerator />} />
                <Route path="/text-cleaner" element={<TextCleaner />} />

                {/* Developer Tools */}
                <Route path="/base-converter" element={<BaseConverter />} />
                <Route path="/timestamp-converter" element={<TimestampConverter />} />
                <Route path="/data-size-converter" element={<DataSizeConverter />} />
                <Route path="/base64" element={<Base64Tool />} />
                <Route path="/url-encoder" element={<UrlEncoder />} />
                <Route path="/html-encoder" element={<HtmlEncoder />} />
                <Route path="/uuid-generator" element={<UuidGenerator />} />
                <Route path="/random-string" element={<RandomString />} />
                <Route path="/random-number" element={<RandomNumber />} />
                <Route path="/scientific-calculator" element={<ScientificCalc />} />
                <Route path="/percentage-calculator" element={<PercentageCalc />} />
                <Route path="/date-difference" element={<DateDiff />} />

                {/* Network Tools */}
                <Route path="/ip-subnet-calculator" element={<IpSubnetCalculator />} />
                <Route path="/ip-calculator" element={<Navigate to="/ip-subnet-calculator" replace />} />
                <Route path="/subnet-calculator" element={<Navigate to="/ip-subnet-calculator" replace />} />
                <Route path="/usable-ip-calculator" element={<Navigate to="/ip-subnet-calculator" replace />} />
                <Route path="/ip-range-calculator" element={<Navigate to="/ip-subnet-calculator" replace />} />
                <Route path="/cidr-overlap" element={<CidrOverlap />} />

                {/* New Dev Tools (Request 317) */}
                <Route path="/regex-tester" element={<RegexTester />} />
                <Route path="/case-converter" element={<CaseConverter />} />
                <Route path="/env-converter" element={<EnvConverter />} />
                <Route path="/curl-converter" element={<CurlConverter />} />
                <Route path="/diff-checker" element={<DiffChecker />} />
                <Route path="/cidr-splitter" element={<CidrSplitter />} />
                <Route path="/k8s-converter" element={<K8sConverter />} />

                {/* New System Tools (Request 411) */}
                <Route path="/public-ip" element={<PublicIp />} />
                <Route path="/port-lookup" element={<PortLookup />} />
                <Route path="/http-status" element={<HttpStatus />} />
                <Route path="/hash-generator" element={<HashGenerator />} />
                <Route path="/timezone-converter" element={<TimezoneConverter />} />
                <Route path="/cron-explainer" element={<CronExplainer />} />


                {/* DevOps Tools */}
                <Route path="/cron-generator" element={<CronGenerator />} />
                <Route path="/chmod-calculator" element={<ChmodCalc />} />

                {/* Excel & Data Tools */}
                <Route path="/excel-to-json" element={<ExcelToJson />} />
                <Route path="/json-to-excel" element={<JsonToExcel />} />
                <Route path="/csv-cleaner" element={<CsvCleaner />} />
                <Route path="/formula-explainer" element={<FormulaExplainer />} />

                <Route path="/excel-to-csv" element={<ExcelToCsv />} />
                <Route path="/csv-to-excel" element={<CsvToExcel />} />
                <Route path="/excel-to-sql" element={<ExcelToSql />} />
                <Route path="/excel-to-yaml" element={<ExcelToYaml />} />

                <Route path="/excel-data-processor" element={<ExcelDataProcessor />} />
                <Route path="/duplicate-finder" element={<Navigate to="/excel-data-processor" replace />} />
                <Route path="/filter-excel-data" element={<Navigate to="/excel-data-processor" replace />} />
                <Route path="/excel-filter" element={<Navigate to="/excel-data-processor" replace />} />
                <Route path="/transpose-excel" element={<TransposeTool />} />

                <Route path="/excel-date-converter" element={<ExcelDateConverter />} />
                <Route path="/formula-generator" element={<FormulaGenerator />} />
                <Route path="/excel-error-explainer" element={<ExcelErrorExplainer />} />
                <Route path="/column-merger" element={<ColumnMerger />} />
                <Route path="/header-normalizer" element={<HeaderNormalizer />} />
                <Route path="/excel-filter" element={<ExcelFilter />} />

                {/* Major Tools */}
                <Route path="/pdf-to-word" element={<PdfToWord />} />
                <Route path="/pdf-to-csv" element={<PdfToCsv />} />
                <Route path="/pdf-to-excel" element={<PdfToCsv />} />
                <Route path="/merge-pdf" element={<MergePdf />} />
                <Route path="/split-pdf" element={<PdfSplit />} />
                <Route path="/compress-pdf" element={<PdfCompress />} />
                <Route path="/unlock-pdf" element={<PdfUnlock />} />
                <Route path="/rotate-pdf" element={<PdfRotate />} />
                <Route path="/sign-pdf" element={<PdfSign />} />
                <Route path="/add-text-pdf" element={<PdfAddText />} />
                <Route path="/fill-pdf-form" element={<PdfFillForm />} />
                <Route path="/add-date-pdf" element={<PdfAddDate />} />
                <Route path="/add-image-pdf" element={<PdfAddImage />} />
                <Route path="/highlight-pdf" element={<PdfHighlight />} />

                {/* Image Tools */}
                <Route path="/image-resizer" element={<ImageTools initialMode="resizer" />} />
                <Route path="/image-compressor" element={<ImageTools initialMode="compressor" />} />
                <Route path="/pdf-to-jpg" element={<PdfToImage defaultFormat="jpg" />} />
                <Route path="/pdf-to-png" element={<PdfToImage defaultFormat="png" />} />
                <Route path="/pdf-to-webp" element={<PdfToImage defaultFormat="webp" />} />
                <Route path="/jpg-to-pdf" element={<ImagesToPdf mode="jpg" />} />
                <Route path="/png-to-pdf" element={<ImagesToPdf mode="png" />} />
                <Route path="/webp-to-pdf" element={<ImagesToPdf mode="webp" />} />

                {/* File to PDF Tools */}
                <Route path="/csv-to-pdf" element={<FileToPdf mode="csv" />} />
                <Route path="/excel-to-pdf" element={<FileToPdf mode="excel" />} />
                <Route path="/json-to-pdf" element={<FileToPdf mode="json" />} />
                <Route path="/xml-to-pdf" element={<FileToPdf mode="xml" />} />

                {/* Other Tools */}
                <Route path="/pdf-to-json" element={<PdfToOther mode="json" />} />
                <Route path="/pdf-to-html" element={<PdfToOther mode="html" />} />
                <Route path="/pdf-to-text" element={<PdfToOther mode="text" />} />
                <Route path="/pdf-to-zip" element={<PdfToOther mode="zip" />} />

                <Route path="/text-to-pdf" element={<TextToPdf />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <GlobalModal />
          <ToastProvider />
        </div>
      </Router>
    </UIProvider>
  );
}

export default App;
