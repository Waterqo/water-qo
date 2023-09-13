const mongoose = require("mongoose");

const DB_URL = process.env.MongodbUrl || "mongodb://127.0.0.1:27017/water";
async function connectToMongoDB() {
  try {
    await mongoose.connect(DB_URL);
    console.log("mongoose connected! ");
  } catch (error) {
    console.error(error);
  }
}
// const complaint = await Complaint.findById(complaintId);

// if (!complaint) {
//   return res
//     .status(404)
//     .json({ success: false, message: "Complaint not found" });
// }

// console.log(complaint.status);
// const status = "Solved";
// complaint.status = status;

module.exports = connectToMongoDB;
