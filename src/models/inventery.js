const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  Code: {
    type: String,
    requier: true,
  },
  MaterialInventory: {
    type: String,
    require: true,
  },
  Stock: {
    type: Number,
  },
});

const Inventory = mongoose.model("Inventory", InventorySchema);

module.exports = Inventory;
