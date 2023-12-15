const mongoose = require("mongoose");

const ComplaintSchme = new mongoose.Schema(
  {
    complaintCode: {
      type: String,
      require: true,
    },
    nameOfComplainter: {
      type: String,
      required: true,
    },
    waterPlant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
    },
    complaintCategory: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "ComplaintCategory",
    },
    complaint: {
      type: String,
    },
    voice: {
      type: String,
    },
    pics: {
      type: Array,
    },
    status: {
      type: String,
      emnum: ["Pending", "Assigned", "Resolved"],
      default: "Pending",
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    resolvedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplaintResolved",
    },
    clientID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    adminID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    complaintType: {
      type: String,
      enum: ["Normal", "Urgent", "VeryUrgent"],
      default: "Normal",
    },
    role: {
      type: String,
      enum: ["Client", "Admin", "Staff"],
      require: true,
    },
    timeToStaffAssign: {
      type: String,
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", ComplaintSchme);
module.exports = Complaint;
