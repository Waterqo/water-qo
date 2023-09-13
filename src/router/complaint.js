const router = require("express").Router();
const cloudinary = require("../helper/cloudinary");
const fs = require("fs");
const upload = require("../helper/multer");
const Complaint = require("../models/complaintSchme");
const ComplaintResolved = require("../models/complaintResolvedSchme");
const { ComplaintJoiSchema } = require("../helper/joi/joiSchema");

router.post(
  "/create/complaint",
  upload.array("attachArtwork", 5),
  ComplaintJoiSchema,
  async (req, res) => {
    const files = req.files;
    const attachArtwork = [];
    try {
      if (!files || files?.length < 1)
        return res.status(401).json({
          success: false,
          message: "You have to upload at least one image to the listing",
        });
      for (const file of files) {
        const { path } = file;
        try {
          const uploader = await cloudinary.uploader.upload(path, {
            folder: "24-Karat",
          });
          attachArtwork.push({ url: uploader.url });
          fs.unlinkSync(path);
        } catch (err) {
          if (attachArtwork?.length) {
            const imgs = imgObjs.map((obj) => obj.public_id);
            cloudinary.api.delete_resources(imgs);
          }
          console.log(err);
        }
      }
      const {
        nameOfComplainter,
        water_Station,
        complaintCategory,
        complaint,
        status,
      } = req.body;
      if (
        !nameOfComplainter ||
        !water_Station ||
        !complaintCategory ||
        !complaint
      ) {
        return res
          .status(400)
          .send({ success: false, message: "kindle provide all the details" });
      }
      console.log(attachArtwork.map((x) => x.url));
      const newComplaint = new Complaint({
        nameOfComplainter,
        water_Station,
        complaintCategory,
        complaint,
        status: "Pending",
        pics: attachArtwork.map((x) => x.url),
      });
      console.log(newComplaint);
      await newComplaint.save();
      return res.status(200).send({
        success: true,
        message: "your complaint is send successfully",
        newComplaint,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error: " + error.message);
    }
  }
);

router.get("/complaints", async (req, res) => {
  try {
    const allComplain = await Complaint.find();
    if (!allComplain.length > 0) {
      return res
        .status(400)
        .send({ success: false, message: "No Complaint found! mubarak ho" });
    }
    res.status(200).send({ success: true, allComplain });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.put("/assignstaff/:Id", async (req, res) => {
  try {
    const complaintId = req.params.Id;
    const { staffId } = req.body;
    const status = "AssignToStaff";
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $set: { staffId, status } },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).send({ message: "Complaint not found" });
    }

    res.status(200).send({
      message: "Staff and status updated successfully!",
      updatedComplaint,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.post(
  "/complaint/resolved/:Id",
  upload.array("attachArtwork", 5),
  async (req, res) => {
    const files = req.files;
    const attachArtwork = [];
    try {
      if (!files || files?.length < 1)
        return res.status(401).json({
          success: false,
          message: "You have to upload at least one image to the listing",
        });
      for (const file of files) {
        const { path } = file;
        try {
          const uploader = await cloudinary.uploader.upload(path, {
            folder: "water_complaint",
          });
          attachArtwork.push({ url: uploader.url });
          fs.unlinkSync(path);
        } catch (err) {
          if (attachArtwork?.length) {
            const imgs = imgObjs.map((obj) => obj.public_id);
            cloudinary.api.delete_resources(imgs);
          }
          console.log(err);
        }
      }
      const complaintId = req.params.Id;
      const complaint = await Complaint.findById(complaintId);
      const status = "Solved";
      complaint.status = status;

      console.log(complaint);
      complaint.save();
      const text = req.body.text;

      const complaintReply = new ComplaintResolved({
        complaintId: req.params.Id,
        text,
        pics: attachArtwork.map((x) => x.url),
      });
      await complaintReply.save();
      res.status(200).send({
        message: "Complaint is successfully resolved",
        data: complaintReply,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error: " + error.message);
    }
  }
);

router.get("/complaint/resolve", async (req, res) => {
  try {
    const allComplain = await ComplaintResolved.find();
    if (!allComplain) {
      return res
        .status(400)
        .send({ success: false, message: "No Complaint found! mubarak ho" });
    }
    res.status(200).send({ success: true, allComplain });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

module.exports = router;
