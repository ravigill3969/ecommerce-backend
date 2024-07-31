import mongoose from 'mongoose';
import nlp from 'compromise';

// Define the Review schema
const reviewSchema = mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Function to extract a good title from a comment
function extractTitle(comment) {
  // Process the comment with compromise
  let doc = nlp(comment);
  
  // Extract key phrases (nouns and adjectives)
  let nouns = doc.nouns().out('array');
  let adjectives = doc.adjectives().out('array');
  
  // Combine keywords to form a title
  let keywords = [...new Set([...adjectives, ...nouns])];
  let title = keywords.slice(0, 10).join(' '); // Limit to 10 keywords

  return title;
}

// Pre-save middleware to extract title from comment
reviewSchema.pre('save', function (next) {
  if (this.isModified('comment') || this.isNew) {
    this.name = extractTitle(this.comment);
  }
  next();
});

// Create the Review model
const Review = mongoose.model('Review', reviewSchema);

export default Review;
