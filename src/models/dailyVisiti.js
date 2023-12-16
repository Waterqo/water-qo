const mongoose = require("mongoose");

const DailyVisitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Staff",
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
    },
    Complain_Cell_Sticker: {
      type: Array,
    },
    Internal_Panel: {
      type: Array,
    },
    MPVs_Meters: {
      type: Array,
    },
    Water_Meter: {
      type: Array,
    },
    Dispensing_Area_Cleaning: {
      type: Array,
    },
    Internal_Plant_Cleaning: {
      type: Array,
    },
    meterReading: {
      type: Number,
      default: 0,
    },
    Log_Book: {
      type: Array,
    },
    uploaded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DailyVisit = mongoose.model("DailyVisit", DailyVisitSchema);

module.exports = DailyVisit;
