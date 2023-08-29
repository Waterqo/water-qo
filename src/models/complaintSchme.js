const mongoose = require("mongoose");

const ComplaintSchme = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    nameOfComplainter: {
      type: String,
      required: true,
    },
    water_Station: {
      type: String,
      require: true,
    },
    complaintCategory: {
      type: String,
      required: true,
      enum: [
        "Water Quality and Taste",
        "Service and Billing",
        "Safety Concerns",
        "Customer Service",
        "Availability and Stock",
        "Delivery Issues",
        "Communication and Transparency",
        "Environmental Concerns",
        "Technical Problems",
        "General Hygiene and Cleanliness",
        "Accessibility Issues",
      ],
    },
    city: {
      type: String,
      required: true,
    },
    complaint: {
      type: String,
      require: true,
    },
    pics: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", ComplaintSchme);
module.exports = Complaint;
