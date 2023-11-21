const mongoose = require("mongoose");

const InventoryRecord = mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  complaintresolved: {},
});
