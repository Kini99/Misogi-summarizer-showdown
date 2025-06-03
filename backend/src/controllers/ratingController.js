const Rating = require('../models/Rating');

const submitRating = async (req, res) => {
  try {
    const { model1Rating, model2Rating } = req.body;

    if (!model1Rating || !model2Rating) {
      return res.status(400).json({ error: 'Missing rating data' });
    }

    // Save ratings for both models
    const [rating1, rating2] = await Promise.all([
      Rating.create(model1Rating),
      Rating.create(model2Rating)
    ]);

    res.status(201).json({
      message: 'Ratings submitted successfully',
      ratings: [rating1, rating2]
    });
  } catch (error) {
    console.error('Error submitting ratings:', error);
    res.status(500).json({ error: 'Failed to submit ratings' });
  }
};

const getRatingStats = async (req, res) => {
  try {
    const stats = await Rating.aggregate([
      {
        $group: {
          _id: {
            modelName: '$modelName',
            modelType: '$modelType'
          },
          avgClarity: { $avg: '$clarity' },
          avgAccuracy: { $avg: '$accuracy' },
          avgConciseness: { $avg: '$conciseness' },
          totalRatings: { $sum: 1 },
          preferredCount: {
            $sum: { $cond: ['$preferred', 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          modelName: '$_id.modelName',
          modelType: '$_id.modelType',
          avgClarity: { $round: ['$avgClarity', 2] },
          avgAccuracy: { $round: ['$avgAccuracy', 2] },
          avgConciseness: { $round: ['$avgConciseness', 2] },
          totalRatings: 1,
          preferredCount: 1,
          preferredPercentage: {
            $round: [
              { $multiply: [{ $divide: ['$preferredCount', '$totalRatings'] }, 100] },
              2
            ]
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error getting rating stats:', error);
    res.status(500).json({ error: 'Failed to get rating statistics' });
  }
};

module.exports = {
  submitRating,
  getRatingStats
}; 