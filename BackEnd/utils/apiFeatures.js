// Fields a client is allowed to sort by. Anything else is dropped, so a
// caller cannot probe / sort on internal fields (e.g. passwordResetExpires)
// or on fields that have no index.
const ALLOWED_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'price',
  'ratingsAverage',
  'ratingsQuantity',
  'name',
  'soldNum',
  'stockQuantity',
  'reportsNumber',
];

// Fields a client must never be able to select, even if they ask for them
// via ?fields=...
const FORBIDDEN_FIELDS = [
  'password',
  'passwordResetToken',
  'passwordResetExpires',
  'passwordChangedAt',
];

// Only these query operators are allowed. Anything else starting with `$`
// (e.g. $ne, $where, $regex with options) is stripped before the query
// reaches Mongoose. express-mongo-sanitize is a second layer, not the only one.
const ALLOWED_OPERATORS = ['gte', 'gt', 'lte', 'lt'];

const stripDisallowedOperators = (value) => {
  if (Array.isArray(value)) {
    return value.map(stripDisallowedOperators);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    Object.entries(value).forEach(([key, val]) => {
      if (key.startsWith('$')) {
        const operator = key.slice(1);
        if (!ALLOWED_OPERATORS.includes(operator)) return;
      }
      clean[key] = stripDisallowedOperators(val);
    });
    return clean;
  }
  return value;
};

class APIFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    const queryObj = { ...this.reqQuery };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(
      stripDisallowedOperators(JSON.parse(queryStr))
    );

    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort
        .split(',')
        .map((field) => field.trim())
        .filter((field) => {
          const name = field.startsWith('-') ? field.slice(1) : field;
          return ALLOWED_SORT_FIELDS.includes(name);
        })
        .join(' ');
      if (sortBy) {
        this.query = this.query.sort(sortBy);
        return this;
      }
    }
    this.query = this.query.sort('-createdAt');

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields
        .split(',')
        .map((field) => field.trim())
        .filter((field) => {
          const name = field.startsWith('-') ? field.slice(1) : field;
          return !FORBIDDEN_FIELDS.includes(name);
        })
        .join(' ');
      if (fields) {
        this.query = this.query.select(fields);
        return this;
      }
    }
    this.query = this.query.select('-__v');
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.reqQuery.page, 10) || 1, 1);
    // Cap the page size at 50 (was: uncapped, default 100). A caller
    // asking for limit=100000 could force a full collection scan + load.
    const limit = Math.min(
      Math.max(parseInt(this.reqQuery.limit, 10) || 20, 1),
      50
    );
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
