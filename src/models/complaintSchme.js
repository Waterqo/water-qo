  const mongoose = require("mongoose");

const ComplaintSchme = new mongoose.Schema(
  {
    nameOfComplainter: {
      type: String,
      required: true,
    },
    complaintBy: {
      type: String,
      require: true,
      enum: ["Visitor", "Coustomer", "Staff"]
    },
    waterPlant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
    },
    complaintCategory: {
      type: String,
      required: true,
      enum: [
        "Water Quality and Taste",
        "Service and Billing",
        "Water leaking",
        "Safety Concerns",
        "Customer Service",
        "Availability and Stock",
        "Delivery Issues",
        "Communication and Transparency",
        "Environmental Concerns",
        "Technical Problems",
        "General Hygiene and Cleanliness",
        "Accessibility Issues",
        "Other",
      ],
    },
    complaint: {
      type: String,
      required: true,
    },
    pics: {
      type: Array,
    },
    status: {
      type: String,
      emnum: ["Pending", "Assign To Staff", "Resolved"],
      default: "Pending"
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", ComplaintSchme);
module.exports = Complaint;
