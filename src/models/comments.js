const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      require: true,
    },
    userId: {
      type: String,
      require: true,
      enum: ["Client", "Admin", "Strff"],
    },
    resolvedId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "ComplaintResolved",
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
