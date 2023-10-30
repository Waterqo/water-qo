const mongoose = require("mongoose");

const ComplaintSchme = new mongoose.Schema(
  {
    nameOfComplainter: {
      type: String,
      required: true,
    },
    waterPlant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
    },
    complaintCategory: {
      type: String,
      required: true,
      enum: [
        "Storage & RAW Tank Level Fault",
        "Flow Valve Fault",
        "MPV Kit Fault",
        "Gear Fault (Large & Small)",
        "MPV Supply Fault",
        "Distributor Vessel",
        "Varm Com Varm Damage",
        "Controller Kit Fault",
        "Taps Change Fault",
        "Taps Fittings Fault",
        "Feed Pump Winding Fault",
        "Feed Pump Impeller Fault",
        "Feed Pump Controller Fault",
        "Staner Fault",
        "Roter Meter Fault",
        "SP Coil",
        "SP Valve",
        "MC Fault",
        "MC Fault",
        "Circuit Breaker Fault",
        "Over Load",
        "Power Supply 24v",
        "PLC Fault",
        "Relay Fault",
        "Change Over Breaker",
        "Flow Meter Fault",
        "Tank Damage",
        "Internal Plant Cleaning",
        "External Plant Cleaning",
        "Lamp & Lamp Holder Damage",
        "Plant External Civil Work Required ",
        "Plant Internal Civil Work Required",
        "Door Work Required",
        "Windows Work Required",
        "Drain Faults",
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
      emnum: ["Pending", "Assigned", "Resolved"],
      default: "Pending",
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
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
      ref: "Client",
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
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", ComplaintSchme);
module.exports = Complaint;
