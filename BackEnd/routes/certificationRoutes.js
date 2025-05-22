const express = require('express');
const authController = require('./../controller/authController');
const certificationController = require('./../controller/certificationController');
const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('company'),
    certificationController.applyCertification,
    certificationController.sendCertification
  );

module.exports = router;
