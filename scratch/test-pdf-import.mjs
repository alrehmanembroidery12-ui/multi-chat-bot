import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

console.log('PDFParse class:', typeof PDFParse);
console.log('PDFParse prototype properties:', Object.getOwnPropertyNames(PDFParse.prototype));
console.log('PDFParse static properties:', Object.getOwnPropertyNames(PDFParse));
