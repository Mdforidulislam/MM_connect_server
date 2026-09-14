import { parentPort, workerData } from 'worker_threads';

const { productList, profitMargin } = workerData;

function calculateProducts(products, margin) {
  const output = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const price = p.Price / (1 - margin / 100);
    output.push({
      ...p,
      Price: Number(price.toFixed(2))
    });
  }

  return output;
}

const processed = calculateProducts(productList, profitMargin);

parentPort.postMessage(processed);
