const mongoose = require("mongoose");

const DailyVisitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "Staff",
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      require: true,
    },
    pics: {
      type: Array,
      require: true,
    },
  },
  { timestamps: true }
);

const DailyVisit = mongoose.model("DailyVisit", DailyVisitSchema);

module.exports = DailyVisit;
