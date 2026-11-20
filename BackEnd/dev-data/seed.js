/**
 * Seed script — demo data for GreenGray (eco-friendly-ecommerce).
 *
 * The frontend used to ship hardcoded mock products (FrontEnd/src/mockData/).
 * That mock data is gone: the demo catalogue now lives in MongoDB, and this
 * script is how it gets there. Run it once after setting up the backend:
 *
 *   cd BackEnd
 *   npm run seed           # --import: wipe any previous seed, then insert
 *   npm run seed:destroy   # --delete: remove the seeded data again
 *
 * Flags:
 *   --import   Insert the demo users, products, reviews and votes below.
 *              It first removes any previous seed run, so it is safe to
 *              re-run (the demo users' emails are unique, re-importing
 *              without the wipe would fail on the unique index).
 *   --delete   Remove the seeded data again (see deleteSeedData()).
 *
 * Demo users (DEMO-ONLY credentials — never use these anywhere real):
 *   admin@greengray.demo   / password123   (role: admin)
 *   seller@greengray.demo  / password123   (role: company, certified seller)
 *   demo@greengray.demo    / password123   (role: user, regular buyer)
 * The password can be overridden with SEED_PASSWORD in config.env; it is
 * stored hashed with bcryptjs by the User model's pre-save hook, exactly
 * like a real signup. "password123" satisfies the model's password rule
 * (8+ chars, at least one letter and one number).
 *
 * Products come from ./data/seed-products.json, transcribed from the old
 * frontend mock catalogue (same names, categories, prices, descriptions
 * and image references). Two mock fields could not be carried over:
 *   - `id` ("prod001", ...) — the schema has no such field; MongoDB
 *     generates _id, and seed.js links reviews/votes by the real _id.
 *   - `owner` ("user123", ...) — mock placeholder strings, not real
 *     users; every seeded product is owned by the seeded company user.
 * The `imageCover` values ("/ElectricCar.png", "/Tshirt.jpg", ...) are
 * frontend public-asset paths kept as-is; the backend does not serve
 * them. `onsaleDuration` is omitted for products that are not on sale
 * (the mock had `undefined` there, which JSON cannot represent).
 *
 * Notes on schema behaviour the seed relies on:
 *   - Users are created with User.create() (not insertMany) so the
 *     pre-save hook hashes the passwords and drops passwordConfirm.
 *   - Products are inserted with insertMany(); the product model's
 *     calculateEnvironmentalScore() is a plain method, not a save hook,
 *     so the environmentalScore values from the JSON are stored as-is.
 *   - Reviews and votes are inserted with insertMany() deliberately:
 *     Review has a post-save hook that recomputes a product's
 *     ratingsAverage / ratingsQuantity from its reviews. insertMany
 *     skips save hooks, so the ratings from the JSON (the old mock's
 *     display values, e.g. 124 ratings) survive the seed. The seeded
 *     reviews are real documents linked to the products; if a user
 *     later adds a review through the API, the hook will recompute
 *     the aggregates from the actual reviews at that point.
 *   - The Review and Vote models enforce one review / vote per user
 *     per product (unique product+user index); the seeded data below
 *     respects that.
 *
 * --delete behaviour (read before running against a shared database):
 *   - Deletes ALL documents in the Product, Review and Vote
 *     collections. In a development database those collections only
 *     hold demo data, but if real products exist there, they will be
 *     wiped too — back them up first.
 *   - Deletes ONLY the three demo users above (matched by email);
 *     any other users are left untouched.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Same config file as server.js (BackEnd/config.env). Resolved relative
// to this file so the script works no matter which directory it is run
// from; server.js loads it as './config.env' from the BackEnd folder.
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Vote = require('../models/voteModel');

// Demo seed password: override with SEED_PASSWORD in config.env.
// Demo-only default — see the header comment. Never use it in production.
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'password123';

const DEMO_USERS = [
  {
    name: 'Demo Admin',
    email: 'admin@greengray.demo',
    role: 'admin',
    password: SEED_PASSWORD,
    passwordConfirm: SEED_PASSWORD,
  },
  {
    name: 'GreenGray Demo Store',
    email: 'seller@greengray.demo',
    role: 'company',
    isCertified: true,
    password: SEED_PASSWORD,
    passwordConfirm: SEED_PASSWORD,
  },
  {
    name: 'Demo Buyer',
    email: 'demo@greengray.demo',
    role: 'user',
    password: SEED_PASSWORD,
    passwordConfirm: SEED_PASSWORD,
  },
];

// Sample reviews/votes, keyed by product name so they survive re-seeding.
// Ratings here are illustrative demo text; the products' displayed
// ratingsAverage / ratingsQuantity come from seed-products.json (see the
// header note about insertMany skipping the recalculation hook).
const REVIEWS_BY_PRODUCT = {
  'Eco-Friendly Electric Car': [
    {
      userEmail: 'demo@greengray.demo',
      rating: 5,
      review:
        'Excellent range for daily driving and genuinely zero-emission. The solar roof is a nice touch.',
    },
    {
      userEmail: 'admin@greengray.demo',
      rating: 4,
      review:
        'Great car overall. Charging infrastructure is still catching up in some areas, but the car itself is solid.',
    },
  ],
  'Organic Cotton T-Shirt': [
    {
      userEmail: 'demo@greengray.demo',
      rating: 5,
      review:
        'Soft, well made, and the organic cotton certification checks out. My go-to t-shirt now.',
    },
  ],
  'Energy-Efficient Smart Refrigerator': [
    {
      userEmail: 'demo@greengray.demo',
      rating: 4,
      review:
        'Noticeably lower on the electricity bill and the smart temperature control works well.',
    },
  ],
  'Organic Quinoa Pack': [
    {
      userEmail: 'admin@greengray.demo',
      rating: 5,
      review:
        'Good quality quinoa, cooks evenly, and the biodegradable packaging is a real plus.',
    },
  ],
  'Recycled Plastic Sunglasses': [
    {
      userEmail: 'demo@greengray.demo',
      rating: 5,
      review:
        'Comfortable frames, good UV protection, and the bamboo case is a lovely detail.',
    },
  ],
};

const VOTES_BY_PRODUCT = {
  'Eco-Friendly Electric Car': [
    {
      userEmail: 'demo@greengray.demo',
      report: false,
      comment: 'Verified: zero-emission drivetrain, solar roof and recycled interior as described.',
    },
  ],
  'Organic Cotton T-Shirt': [
    {
      userEmail: 'admin@greengray.demo',
      report: false,
      comment: 'Fair trade certification confirmed for this seller.',
    },
  ],
  'Energy-Efficient Smart Refrigerator': [
    {
      userEmail: 'demo@greengray.demo',
      report: true,
      comment: 'The A++ rating claim should be double-checked against the manufacturer datasheet.',
    },
  ],
};

const DEMO_USER_EMAILS = DEMO_USERS.map((user) => user.email);

async function connectDB() {
  const DB = process.env.DATABASE;
  if (!DB) {
    throw new Error(
      'Missing DATABASE in config.env. Copy BackEnd/.env.example to config.env and fill in the values.'
    );
  }
  // Same connection options as server.js.
  await mongoose.connect(DB, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });
  console.log('DB connection successful!');
}

async function deleteSeedData() {
  // Products, reviews and votes: the whole collections (see header).
  const deletedVotes = await Vote.deleteMany();
  const deletedReviews = await Review.deleteMany();
  const deletedProducts = await Product.deleteMany();
  // Users: only the three demo accounts, matched by email.
  const deletedUsers = await User.deleteMany({
    email: { $in: DEMO_USER_EMAILS },
  });

  console.log(
    `Deleted ${deletedProducts.deletedCount} products, ` +
      `${deletedReviews.deletedCount} reviews, ` +
      `${deletedVotes.deletedCount} votes, ` +
      `${deletedUsers.deletedCount} demo users.`
  );
}

async function importSeedData() {
  // Start clean so re-running the seed never hits the unique email or
  // the one-review / one-vote-per-user indexes.
  await deleteSeedData();

  // User.create() runs the pre-save hook: passwords are hashed with
  // bcryptjs (cost 12) and passwordConfirm is discarded.
  const users = await User.create(DEMO_USERS);
  const usersByEmail = Object.fromEntries(
    users.map((user) => [user.email, user])
  );
  const companyUser = usersByEmail['seller@greengray.demo'];
  console.log(`Created ${users.length} demo users.`);

  const productsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'seed-products.json'), 'utf-8')
  );
  // Every seeded product belongs to the demo company (seller) user.
  // The mock's owner strings ("user123", ...) were placeholders.
  const products = await Product.insertMany(
    productsData.map((product) => ({ ...product, owner: companyUser._id }))
  );
  const productsByName = Object.fromEntries(
    products.map((product) => [product.name, product])
  );
  console.log(`Created ${products.length} demo products.`);

  const reviews = [];
  for (const [productName, productReviews] of Object.entries(
    REVIEWS_BY_PRODUCT
  )) {
    for (const review of productReviews) {
      reviews.push({
        review: review.review,
        rating: review.rating,
        product: productsByName[productName]._id,
        user: usersByEmail[review.userEmail]._id,
      });
    }
  }
  await Review.insertMany(reviews);
  console.log(`Created ${reviews.length} demo reviews.`);

  const votes = [];
  for (const [productName, productVotes] of Object.entries(VOTES_BY_PRODUCT)) {
    for (const vote of productVotes) {
      votes.push({
        comment: vote.comment,
        report: vote.report,
        product: productsByName[productName]._id,
        user: usersByEmail[vote.userEmail]._id,
      });
    }
  }
  await Vote.insertMany(votes);
  console.log(`Created ${votes.length} demo votes.`);

  console.log('\nDemo accounts (password: the SEED_PASSWORD value, default "password123"):');
  console.log('  admin@greengray.demo   (admin)');
  console.log('  seller@greengray.demo  (company, certified)');
  console.log('  demo@greengray.demo    (user)');
}

async function main() {
  const flag = process.argv[2];

  try {
    await connectDB();

    if (flag === '--import') {
      await importSeedData();
    } else if (flag === '--delete') {
      await deleteSeedData();
    } else {
      console.error('Usage: node dev-data/seed.js --import | --delete');
      process.exitCode = 1;
      return;
    }
  } catch (err) {
    console.error('Seed script failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
