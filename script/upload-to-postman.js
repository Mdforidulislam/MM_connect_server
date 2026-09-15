const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;
const COLLECTION_FILE_PATH = 'postman-collection.json';

const localCollection = JSON.parse(fs.readFileSync(COLLECTION_FILE_PATH, 'utf8'));
const COLLECTION_NAME = localCollection.info.name;

console.log(`🔍 Looking for collection "${COLLECTION_NAME}"...`);

async function getCollectionUidByName(name) {
  const { data } = await axios.get('https://api.getpostman.com/collections', {
    headers: { 'X-Api-Key': POSTMAN_API_KEY },
  });

  const match = data.collections.find((coll) => coll.name === name); 
  return match?.uid || null;
}

function smartMergeCollections(oldColl, newColl) {
  return {
    ...oldColl,
    item: mergeItems(oldColl.item, newColl.item),
  };
}

function mergeItems(oldItems, newItems) {
  const map = new Map();
  oldItems.forEach((item) => map.set(item.name, item));
  newItems.forEach((item) => map.set(item.name, item)); // New overrides old
  return Array.from(map.values());
}

async function syncCollection() {
  try {
    const uid = await getCollectionUidByName(COLLECTION_NAME);

    if (uid) {
      console.log(`📦 Found existing collection "${COLLECTION_NAME}" — updating...`);

      const { data: oldData } = await axios.get(
        `https://api.getpostman.com/collections/${uid}`,
        {
          headers: { 'X-Api-Key': POSTMAN_API_KEY },
        }
      );

      const merged = smartMergeCollections(oldData.collection, localCollection);

      await axios.put(
        `https://api.getpostman.com/collections/${uid}`,
        { collection: merged },
        {
          headers: {
            'X-Api-Key': POSTMAN_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Updated collection "${COLLECTION_NAME}" successfully.`);
    } else {
      console.log(`➕ No existing collection named "${COLLECTION_NAME}". Creating new...`);

      await axios.post(
        'https://api.getpostman.com/collections',
        { collection: localCollection },
        {
          headers: {
            'X-Api-Key': POSTMAN_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Created new collection "${COLLECTION_NAME}" successfully.`);
    }
  } catch (err) {
    console.error('❌ Error syncing collection:', err.message);
  }
}

syncCollection();
