const mongoose = require("mongoose");

const ComplaintSchme = new mongoose.Schema(
  {
    nameOfComplainter: {
      type: String,
      required: true,
    },
    water_Station: {
      type: String,
      required: true,
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
      required: true,
    },
    pics: {
      type: String,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", ComplaintSchme);
module.exports = Complaint;
