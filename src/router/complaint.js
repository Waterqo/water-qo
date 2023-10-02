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
          attachArtwork.push({ url: uploader.secure_url});
          fs.unlinkSync(path);
        } catch (err) {
          if (attachArtwork?.length) {
            const imgs = imgObjs.map((obj) => obj.public_id);
            cloudinary.api.delete_resources(imgs);
          }
          console.log(err);
        }
      }
      const { nameOfComplainter,complaintBy, waterPlant, complaintCategory, complaint } =
        req.body;
      if (
        !nameOfComplainter ||
        !complaintBy ||
        !waterPlant ||
        !complaintCategory ||
        !complaint
      ) {
        return res
          .status(400)
          .send({ success: false, message: "kindle provide all the details" });
      }

      const newComplaint = new Complaint({
        nameOfComplainter,
        complaintBy,
        waterPlant,
        complaintCategory,
        complaint,
        status: "Pending",
        pics: attachArtwork.map((x) => x.url),
      });
      await newComplaint.save();
      return res.status(200).send({
        success: true,
        message: "your complaint is send successfully",
        data: newComplaint,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error: " + error.message);
    }
  }
);

router.get("/complaints", async (req, res) => {
  try {
    const allComplain = await Complaint.find().populate("waterPlant")
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

router.get("/complaints/:Id", async (req, res) => {
  try {
    const Id = req.params.Id
    const allComplain = await Complaint.findById(Id).populate("waterPlant")
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

router.put("/assignstaff/:Id", async (req, res) => {
  try {
    const complaintId = req.params.Id;
    const staffId = req.body;
    const assignStaff = await Complaint.findByIdAndUpdate(
      complaintId,
      staffId,
      { new: true }
    );
    await assignStaff.save();
    res.status(200).send({ message: "Staff added successfully!", assignStaff });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.post("/complaint/resolved/:Id",
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
            folder: "24-Karat",
          });
          attachArtwork.push({ url: uploader.secure_url});
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

      const complaintReply = new ComplaintResolved({
        complaintId: req.params.Id,
        resolved: true,
        pics: attachArtwork.map((x) => x.url),
      });
      await complaintReply.save();
      res.status(200).send({
        message: "complaint is successsfully resolved",
        complaintReply,
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
