
import { parentPort, workerData } from 'worker_threads';
import XLSX from 'xlsx'

function parseExcel(buffer, originalname) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const [headerRow, ...dataRows] = rawData as (string[])[];

  if( !headerRow || !dataRows) {
    throw new Error('Invalid Excel file');
  }

  const partNumberIndex = headerRow && headerRow?.findIndex(col => col?.toLowerCase().includes('part number'));
  const priceIndex = headerRow && headerRow?.findIndex(col => col?.toLowerCase().includes('price'));

  if (partNumberIndex === -1 || priceIndex === -1) {
    throw new Error('Part Number or Price column not found');
  }

  const fileReference = originalname + '-' + Date.now();

  const products = dataRows.map(row => {
    const partNumber = row[partNumberIndex];
    const price = row[priceIndex];

    if (!partNumber || isNaN(Number(price))) return null;

    return {
      fileName: fileReference,
      partNumber: partNumber.toString(),
      price: parseFloat(price),
      deliveryDate: 3,
    };
  }).filter(p => p !== null);

  return products;
}

// Process the data and send back result
try {
  const products = parseExcel(workerData.buffer, workerData.originalname);
  parentPort.postMessage({ success: true, products });
} catch (error) {
  parentPort.postMessage({ success: false, error: error.message });
}
