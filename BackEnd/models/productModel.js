const mongoose = require('mongoose');
const User = require('./userModel');
const AppError = require('../utils/appError');
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
    const harmfulMaterials = [
      'polyster',
      'nylon',
      'acrylic',
      'synthetic fabrics',
    ];
    //depends if it is organic/recycled or industrial/faux
    const semiHarmMaterials = ['cotton', 'fur', 'leather', 'wool'];
    const industrial = ['industrial', 'faux'];
    const nonIndustrial = ['organic', 'recycle', 'recycled'];

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
      //if it is harmful material like polyster
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
    const harmfulFood = [
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
    const organicRecycled = ['organic', 'recycle', 'recycled'];

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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
