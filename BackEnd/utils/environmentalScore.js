// One place for the "is this product harmful to the environment?" decision.
//
// The same threshold-10 block was copy-pasted in four places in
// handlerFactory.js (createMyProduct, createOne, updateMyProduct, plus a
// near-copy in voteController.js). They have all drifted before; this
// helper is the single source of truth for the factory paths.
//
// A product with an environmental score of 10 or more is not harmful.
// Anything below that is harmful. The assessment flag is always set:
// calling this means the score was (re)computed just now.
const ENVIRONMENTAL_SCORE_THRESHOLD = 10;

const applyEnvironmentalScore = (doc) => {
  doc.calculateEnvironmentalScore();
  doc.harmfultoenv =
    doc.environmentalScore < ENVIRONMENTAL_SCORE_THRESHOLD;
  doc.environmentalImpactAssessed = true;
  return doc;
};

module.exports = { applyEnvironmentalScore, ENVIRONMENTAL_SCORE_THRESHOLD };
