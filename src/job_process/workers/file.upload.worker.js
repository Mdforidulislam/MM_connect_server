import {parentPort, workerData} from 'worker_threads';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function saveProducts(products ) {
  try {
  const result =  await prisma.product.createMany({
      data: products,
      // skipDuplicates: true
    });

    parentPort.postMessage({ status: 'ok', count: products.length });
  } catch (error) {
    parentPort.postMessage({ status: 'error', error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

saveProducts(workerData);
