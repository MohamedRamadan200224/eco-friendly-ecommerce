const mongoose = require('mongoose');

// Keyword lists for calculateEnvironmentalScore. They used to be
// re-declared inline inside the method (and 'polyester' was misspelled
// 'polyster', so correctly-spelled specs never matched the harmful list).
// The scoring logic below is unchanged; only the lists moved here.
const HARMFUL_CLOTHING_MATERIALS = [
  'polyester',
  'nylon',
  'acrylic',
  'synthetic fabrics',
];
// Depends if it is organic/recycled or industrial/faux.
const SEMI_HARMFUL_CLOTHING_MATERIALS = ['cotton', 'fur', 'leather', 'wool'];
const INDUSTRIAL_KEYWORDS = ['industrial', 'faux'];
const ORGANIC_OR_RECYCLED_KEYWORDS = ['organic', 'recycle', 'recycled'];
const HARMFUL_FOOD_KEYWORDS = [
  'dairy',
  'milk',
  'cream',
  'cheese',
  'yoghurt',
  'butter',
  'beef',
  'lamb',
  'salmon',
];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter the name of the product'],
    },
    category: {
      type: String,
      enum: {
        values: ['Cars', 'Food', 'Electronics', 'Clothes'],
        message: 'Category is either: Cars, Food, Electronics, Clothes',
      },
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    specifications: {
      type: String,
      required: [true, 'Please enter the specifications of the product!'],
      minlength: [
        10,
        'A product specifications must have at least 10 characters ',
      ],
    },
    environmentalScore: {
      type: Number,
      default: 0,
    },
    environmentalImpactAssessed: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
    },
    ratingsAverage: {
      type: Number,
      default: 1,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    reportsNumber: {
      type: Number,
      default: 0,
    },
    noReportsNumber: {
      type: Number,
      default: 0,
    },
    soldNum: {
      type: Number,
      default: 0,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    onsaleDuration: {
      type: Number,
      default: undefined,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    // NOTE: `harmfultoenv` is misspelled, but the spelling is kept
    // deliberately — it is the field name in stored documents and in
    // queries across the codebase (routes, controllers, the worker).
    // Renaming it would need a data migration; do not rename here.
    harmfultoenv: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: null,
    },
    imageCover: {
      type: String,
      default: null,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
productSchema.virtual('discount').get(function () {
  if (this.onSale === true) {
    return (this.price * 100) / this.originalPrice;
  }
  // Not on sale: the old code fell off the end and returned undefined.
  return 0;
});

productSchema.methods.calculateEnvironmentalScore = function () {
  let score = 0;

  if (this.category === 'Cars') {
    //switch case if it is electric or fuel
    switch (true) {
      //if electric
      case this.specifications.toLowerCase().includes('electric'):
        score += 10;
        break;
      //if fuel
      case this.specifications.toLowerCase().includes('fuel'):
        score = 0;
        break;
      // else if not specified
      default:
        this.harmfultoenv = true;
    }
  } else if (this.category === 'Electronics') {
    score = 0;
  } else if (this.category === 'Clothes') {
    //100% harmful
    const harmfulMaterials = HARMFUL_CLOTHING_MATERIALS;
    //depends if it is organic/recycled or industrial/faux
    const semiHarmMaterials = SEMI_HARMFUL_CLOTHING_MATERIALS;
    const industrial = INDUSTRIAL_KEYWORDS;
    const nonIndustrial = ORGANIC_OR_RECYCLED_KEYWORDS;

    switch (true) {
      //if it is semiharm like cotton then...
      case semiHarmMaterials.some((keyword) =>
        this.specifications.includes(keyword)
      ): {
        switch (true) {
          //check if industrial
          case industrial.some((keyword) =>
            this.specifications.includes(keyword)
          ):
            score = 0;
            break;
          //check if organic
          case nonIndustrial.some((keyword) =>
            this.specifications.includes(keyword)
          ):
            score += 10;
            break;
          // else if not specified if organic or industrial
          default:
            score += 10;
        }

        break;
      }
      //if it is harmful material like polyester
      case harmfulMaterials.some((keyword) =>
        this.specifications.includes(keyword)
      ): {
        if (
          nonIndustrial.some((keyword) => this.specifications.includes(keyword))
        ) {
          //if harmful material but it is recycled

          score += 10;
        } else {
          //if harmful material
          score = 0;
        }

        break;
      }

      // else if not specified if harmful or semiharmful material
      default:
        this.harmfultoenv = true;
    }
  } else {
    //category is food
    const harmfulFood = HARMFUL_FOOD_KEYWORDS;
    const organicRecycled = ORGANIC_OR_RECYCLED_KEYWORDS;

    switch (true) {
      //if harmful
      case harmfulFood.some((keyword) =>
        this.specifications.includes(keyword)
      ): {
        //if harmful but organic or recycled
        if (
          organicRecycled.some((keyword) =>
            this.specifications.includes(keyword)
          )
        ) {
          score += 10;
        } else {
          score = 0;
        }
        break;
      }

      //if organic but not in the list
      case organicRecycled.some((keyword) =>
        this.specifications.includes(keyword)
      ): {
        if (
          !harmfulFood.some((keyword) => this.specifications.includes(keyword))
        ) {
          score += 10;
        } else {
          score = 0;
        }

        break;
      }

      // else if not specified
      default:
        this.harmfultoenv = false;
    }
  }

  // Example criteria for scoring
  // if (this.specifications.includes('100% recycled materials')) {
  //   score += 10;
  // }
  // if (this.specifications.includes('energy efficient')) {
  //   score += 5;
  // }
  // if (this.specifications.includes('water saving')) {
  //   score += 5;
  // }
  // if (this.specifications.includes('sustainably sourced')) {
  //   score += 10;
  // }
  // if (this.specifications.includes('low waste production')) {
  //   score += 5;
  // }
  // if (this.specifications.includes('low carbon footprint')) {
  //   score += 10;
  // }
  // if (this.specifications.includes('long-lasting')) {
  //   score += 5;
  // }
  // if (this.specifications.includes('biodegradable')) {
  //   score += 10;
  // }
  // if (this.specifications.includes('non-toxic')) {
  //   score += 5;
  // }
  // if (this.specifications.includes('eco-friendly packaging')) {
  //   score += 5;
  // }

  // Set the calculated score and mark the assessment as completed
  this.environmentalScore = score;
  this.environmentalImpactAssessed = true;
};

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: 'id name photo isCertified',
  });
  next();
});

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.virtual('votes', {
  ref: 'Vote',
  foreignField: 'product',
  localField: '_id',
});

// Indexes for the queries this app actually runs: listing a seller's
// products, and filtering products by category + price.
productSchema.index({ owner: 1 });
productSchema.index({ category: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
