const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
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
    username: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    complaintAssign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
    plant: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plant",
      },
    ],
    role: String,
    deviceToken: String,
    lat: Number,
    long: Number,
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", StaffSchema);
module.exports = Staff;
