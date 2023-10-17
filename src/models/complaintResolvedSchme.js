const mongoose = require("mongoose");

const ComplaintResolvedSchme = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "Complaint",
    },
    recommendation: {
      type: String,
      enum: ["Repair", "Replace", "Others"],
      require: true,
    },
    text: {
      type: String,
    },
    inventoryItem: [{ type: String }],
    pics: {
      type: Array,
      require: true,
    },
    comment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const ComplaintResolved = mongoose.model(
  "ComplaintResolved",
  ComplaintResolvedSchme
);
module.exports = ComplaintResolved;
