const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
    },
    userId: {
      type: String,
      require: true,
      enum: ["Client", "Admin", "Staff"],
    },
    resolvedId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "ComplaintResolved",
    },
    file: {
      type: String,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
