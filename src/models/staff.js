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
