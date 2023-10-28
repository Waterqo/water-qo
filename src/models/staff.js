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
    },
    password: {
      type: String,
      required: true,
    },
    complaintAssign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
    role: String,
    deviceToken: String,
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", StaffSchema);
module.exports = Staff;
