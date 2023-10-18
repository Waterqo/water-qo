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
    require: true,
    default: 0,
  },
  Items_Quantity_Full: {
    type: Number,
    require: true,
  },
});

const Inventory = mongoose.model("Inventory", InventorySchema);

module.exports = Inventory;
