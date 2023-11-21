const mongoose = require("mongoose");

const InventoryRecord = mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  complaintResolvedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ComplaintResolved",
  },
  inventoryRecord: [
    {
      Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
      },
      Stock: {
        type: Number,
      },
    },
  ],
});
