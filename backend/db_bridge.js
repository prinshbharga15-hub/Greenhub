import 'dotenv/config';
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import os from 'os';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Security: API key authentication
const API_KEY = process.env.BRIDGE_API_KEY || 'greenhub_bridge_dev_key_' + os.hostname().toLowerCase();

app.use('/db', (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['x-setup-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid or missing API key' });
  }
  next();
});

const ALLOWED_COLLECTIONS = ['users', 'products', 'categories', 'orders', 'order_items', 'cart', 'carts', 'wishlist', 'wishlists', 'reviews', 'coupons', 'coupon_usage', 'password_resets'];

const mongoUrl = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'greenhub';
let db;

function deserializeQuery(obj) {
  if (!obj) return obj;
  if (typeof obj === 'object' && obj.date !== undefined && obj.timezone_type !== undefined && typeof obj.date === 'string') {
    return new Date(obj.date);
  }
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deserializeQuery);
  
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_id' && typeof value === 'string' && value.length === 24) {
      newObj[key] = new ObjectId(value);
    } else if (key === '_id' && value && typeof value === 'object' && value.$oid) {
      newObj[key] = new ObjectId(value.$oid);
    } else if (value && typeof value === 'object') {
      newObj[key] = deserializeQuery(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

function serializeResponse(obj) {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(serializeResponse);
  if (obj instanceof ObjectId) return obj.toString();
  if (typeof obj !== 'object') return obj;
  
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof ObjectId) {
      newObj[key] = value.toString();
    } else if (value instanceof Date) {
      newObj[key] = value.toISOString();
    } else if (value && typeof value === 'object') {
      newObj[key] = serializeResponse(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

const DANGEROUS_OPERATORS = ['$where', '$expr', '$function', '$accumulator'];
function sanitizeQuery(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof ObjectId || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeQuery);
  if (typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (DANGEROUS_OPERATORS.includes(key)) continue;
    sanitized[key] = sanitizeQuery(value);
  }
  return sanitized;
}

function prepareFilter(filter) {
  const safe = sanitizeQuery(deserializeQuery(filter));
  if (Array.isArray(safe) && safe.length === 0) {
    return {};
  }
  return safe;
}

const runDbOp = async (req, res, callback) => {
  try {
    if (!db) {
      const client = await MongoClient.connect(mongoUrl);
      db = client.db(dbName);
    }
    const result = await callback(db);
    res.json({ success: true, data: serializeResponse(result) });
  } catch (error) {
    console.error('DB Bridge Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

app.post('/db/find', (req, res) => {
  const { collection, filter = {}, options } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const safeFilter = prepareFilter(filter);
    const opts = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
    let query = db.collection(collection).find(safeFilter);
    if (opts.sort && typeof opts.sort === 'object' && !Array.isArray(opts.sort)) query = query.sort(opts.sort);
    if (opts.skip) query = query.skip(parseInt(opts.skip));
    if (opts.limit) query = query.limit(parseInt(opts.limit));
    if (opts.projection) query = query.project(opts.projection);
    return await query.toArray();
  });
});

app.post('/db/findOne', (req, res) => {
  const { collection, filter = {}, options } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const safeFilter = prepareFilter(filter);
    const opts = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
    return await db.collection(collection).findOne(safeFilter, opts);
  });
});

app.post('/db/insertOne', (req, res) => {
  const { collection, document } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const doc = sanitizeQuery(deserializeQuery(document));
    if (!doc.createdAt) doc.createdAt = new Date();
    const result = await db.collection(collection).insertOne(doc);
    return { ...doc, _id: result.insertedId };
  });
});

app.post('/db/updateOne', (req, res) => {
  const { collection, filter, update, options } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const safeFilter = prepareFilter(filter);
    const safeUpdate = sanitizeQuery(deserializeQuery(update));
    const opts = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
    const result = await db.collection(collection).updateOne(
      safeFilter,
      safeUpdate,
      opts
    );
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId
    };
  });
});

app.post('/db/updateMany', (req, res) => {
  const { collection, filter, update, options } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const safeFilter = prepareFilter(filter);
    const safeUpdate = sanitizeQuery(deserializeQuery(update));
    const opts = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
    const result = await db.collection(collection).updateMany(
      safeFilter,
      safeUpdate,
      opts
    );
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  });
});

app.post('/db/deleteOne', (req, res) => {
  const { collection, filter } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const safeFilter = prepareFilter(filter);
    const result = await db.collection(collection).deleteOne(safeFilter);
    return { deletedCount: result.deletedCount };
  });
});

app.post('/db/deleteMany', (req, res) => {
  const { collection, filter } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const safeFilter = prepareFilter(filter);
    const result = await db.collection(collection).deleteMany(safeFilter);
    return { deletedCount: result.deletedCount };
  });
});

app.post('/db/countDocuments', (req, res) => {
  const { collection, filter = {} } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const safeFilter = prepareFilter(filter);
    return await db.collection(collection).countDocuments(safeFilter);
  });
});

app.post('/db/aggregate', (req, res) => {
  const { collection, pipeline = [] } = req.body;
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ success: false, error: 'Invalid collection name' });
  }
  runDbOp(req, res, async (db) => {
    const safePipeline = sanitizeQuery(deserializeQuery(pipeline));
    return await db.collection(collection).aggregate(safePipeline).toArray();
  });
});

app.post('/db/setup', (req, res) => {
  runDbOp(req, res, async (db) => {
    await db.collection('categories').deleteMany({});
    const categories = [
      { name: 'Fruits', slug: 'fruits', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=300' },
      { name: 'Vegetables', slug: 'vegetables', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dairy & Eggs', slug: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300' },
      { name: 'Bakery', slug: 'bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300' },
      { name: 'Meat & Seafood', slug: 'meat-seafood', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=300' },
      { name: 'Beverages', slug: 'beverages', image: 'https://images.unsplash.com/photo-1527960656306-ee376a72ab5d?auto=format&fit=crop&q=80&w=300' }
    ];
    await db.collection('categories').insertMany(categories);

    await db.collection('products').deleteMany({});
    const products = [
      {
        name: 'Organic Red Apples',
        description: 'Fresh and crispy organic red apples. Perfect for a healthy snack or making delicious apple pies.',
        price: 4.99,
        discountPrice: 3.99,
        stockQuantity: 120,
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=500'],
        category: 'fruits',
        rating: 4.8,
        reviewsCount: 24,
        availabilityStatus: 'in_stock'
      },
      {
        name: 'Fresh Cavendish Bananas',
        description: 'Rich in potassium and perfect for smoothies, baking, or on-the-go snacking.',
        price: 1.99,
        discountPrice: null,
        stockQuantity: 250,
        images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=500'],
        category: 'fruits',
        rating: 4.6,
        reviewsCount: 18,
        availabilityStatus: 'in_stock'
      },
      {
        name: 'Organic Broccoli Florets',
        description: 'Pre-washed and cut organic broccoli. Ready to steam, roast, or stir fry.',
        price: 3.49,
        discountPrice: 2.99,
        stockQuantity: 80,
        images: ['https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&q=80&w=500'],
        category: 'vegetables',
        rating: 4.7,
        reviewsCount: 15,
        availabilityStatus: 'in_stock'
      },
      {
        name: 'Fresh Roma Tomatoes',
        description: 'Plump and juicy Roma tomatoes. Ideal for homemade pasta sauces, salads, and slicing.',
        price: 2.49,
        discountPrice: 1.99,
        stockQuantity: 150,
        images: ['https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=500'],
        category: 'vegetables',
        rating: 4.5,
        reviewsCount: 22,
        availabilityStatus: 'in_stock'
      },
      {
        name: 'Organic Whole Milk 1 Gallon',
        description: 'Certified organic whole milk. Rich in calcium and Vitamin D, pasteurized and homogenized.',
        price: 6.49,
        discountPrice: null,
        stockQuantity: 60,
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=500'],
        category: 'dairy-eggs',
        rating: 4.9,
        reviewsCount: 30,
        availabilityStatus: 'in_stock'
      },
      {
        name: 'Free Range Large Brown Eggs (12ct)',
        description: 'Fresh free-range brown eggs from pasture-raised chickens. Certified organic.',
        price: 4.99,
        discountPrice: 4.49,
        stockQuantity: 100,
        images: ['https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=500'],
        category: 'dairy-eggs',
        rating: 4.8,
        reviewsCount: 45,
        availabilityStatus: 'in_stock'
      },
      {
        name: 'Sourdough Bread Loaf',
        description: 'Artisanal freshly-baked sourdough bread. Crispy crust with a soft, tangy interior.',
        price: 5.99,
        discountPrice: null,
        stockQuantity: 40,
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500'],
        category: 'bakery',
        rating: 4.7,
        reviewsCount: 19,
        availabilityStatus: 'in_stock'
      },
      {
        name: 'Fresh Atlantic Salmon Fillet',
        description: 'Rich in Omega-3 fatty acids, skin-on Atlantic salmon fillet. Wild-caught and fresh.',
        price: 18.99,
        discountPrice: 15.99,
        stockQuantity: 30,
        images: ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=500'],
        category: 'meat-seafood',
        rating: 4.9,
        reviewsCount: 32,
        availabilityStatus: 'in_stock'
      },
      {
        name: '100% Pure Coconut Water 1L',
        description: 'Hydrating, single-ingredient coconut water with no added sugar or preservatives.',
        price: 3.99,
        discountPrice: 3.29,
        stockQuantity: 200,
        images: ['https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&q=80&w=500'],
        category: 'beverages',
        rating: 4.5,
        reviewsCount: 12,
        availabilityStatus: 'in_stock'
      }
    ];
    await db.collection('products').insertMany(products);

    await db.collection('coupons').deleteMany({});
    const coupons = [
      { code: 'GREEN20', discountType: 'percentage', discountValue: 20, expiryDate: new Date('2027-12-31'), active: true },
      { code: 'FRESH10', discountType: 'fixed', discountValue: 10.00, expiryDate: new Date('2027-12-31'), active: true }
    ];
    await db.collection('coupons').insertMany(coupons);

    await db.collection('users').deleteMany({ email: 'admin@greenhub.com' });
    const adminUser = {
      name: process.env.ADMIN_NAME || 'GreenHub Admin',
      email: process.env.ADMIN_EMAIL || 'admin@greenhub.com',
      passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2y$10$IEzbCMzGTBat8DDqpRzrweRT4k0fR07BsO2srmCnsECtkGyzx1J5G', // admin123
      role: 'admin',
      phone: '1234567890',
      address: 'GreenHub Headquarters, Garden City',
      createdAt: new Date()
    };
    await db.collection('users').insertOne(adminUser);

    return { message: 'Seeding completed successfully!' };
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Database bridge server running at http://127.0.0.1:${PORT}`);
  console.log('Bridge API Key:', API_KEY);
});
