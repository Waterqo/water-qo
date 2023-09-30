const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    contact_number: {
      type: Number,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    waterPlant: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plant",
      },
    ],
    role: String,
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", ClientSchema);
module.exports = Client;
