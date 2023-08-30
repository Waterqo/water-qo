const router = require("express").Router();

const Complaint = require("../models/complaintSchme");

router.post("/create/complaint", async (req, res) => {
  try {
    const {
      nameOfComplainter,
      water_Station,
      complaintCategory,
      city,
      complaint,
    } = req.body;
    if (
      !nameOfComplainter ||
      !water_Station ||
      !complaintCategory ||
      !city ||
      !complaint
    ) {
      return res
        .status(400)
        .send({ success: false, message: "kindle provide all the details" });
    }
    console.log(req.body);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

module.exports = router;
