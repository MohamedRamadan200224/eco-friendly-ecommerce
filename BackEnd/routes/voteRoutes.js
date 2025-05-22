const express = require('express');
const voteController = require('../controller/voteController');
const authController = require('../controller/authController');
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(voteController.getAllVotes)
  .post(
    authController.protect,
    authController.restrictTo('expert'),
    voteController.checkVote,
    voteController.createVote
  );

router
  .route('/:id')
  .get(voteController.getVote)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    voteController.deleteVote
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    voteController.updateVote
  );

router
  .route('/myVote/:id')
  .delete(
    authController.protect,
    authController.restrictTo('expert'),
    voteController.getVoteUserIds,
    voteController.deleteMyVote
  )
  .patch(
    authController.protect,
    authController.restrictTo('expert'),
    voteController.getVoteUserIds,
    voteController.updateMyVote
  );

module.exports = router;
