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
    Complain_Cell_Sticker: {
      type: Array,
      require: true,
    },
    Internal_Panel: {
      type: Array,
      require: true,
    },
    MPVs_Meters: {
      type: Array,
      require: true,
    },
    Water_Meter: {
      type: Array,
      require: true,
    },
    Dispensing_Area_Cleaning: {
      type: Array,
      require: true,
    },
    Internal_Plant_Cleaning: {
      type: Array,
      require: true,
    },
    Log_Book: {
      type: Array,
      require: true,
    },
  },
  { timestamps: true }
);

const DailyVisit = mongoose.model("DailyVisit", DailyVisitSchema);

module.exports = DailyVisit;
