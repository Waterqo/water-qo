const mongoose = require("mongoose");

const ComplaintCategorySchema = new mongoose.Schema(
  {
    complaintCategory: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const ComplaintCategory = mongoose.model(
  "ComplaintCategory",
  ComplaintCategorySchema
);

module.exports = ComplaintCategory;
