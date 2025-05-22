const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Car = require('./../../models/carModel');
const Food = require('./../../models/foodModel');
const Clothe = require('./../../models/clotheModel');
const User = require('./../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

// READ JSON FILE
const cars = JSON.parse(
  fs.readFileSync(`${__dirname}/cars-simple.json`, 'utf-8')
);

const food = JSON.parse(
  fs.readFileSync(`${__dirname}/food-simple.json`, 'utf-8')
);

const clothes = JSON.parse(
  fs.readFileSync(`${__dirname}/clothes-simple.json`, 'utf-8')
);

// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Car.create(cars, { validateBeforeSave: false });
    await Food.create(food, { validateBeforeSave: false });
    await Clothe.create(clothes, { validateBeforeSave: false });
    // await User.create(users, { validateBeforeSave: false });
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Car.deleteMany();
    await Food.deleteMany();
    await Clothe.deleteMany();
    // await User.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
