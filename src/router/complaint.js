const router = require("express").Router();
const cloudinary = require("../helper/cloudinary");
const fs = require("fs");
const Staff = require("../models/staff");
const Admin = require("../models/admin");
const upload = require("../helper/multer");
const Complaint = require("../models/complaintSchme");
const ComplaintResolved = require("../models/complaintResolvedSchme");
const { ComplaintJoiSchema } = require("../helper/joi/joiSchema");
// var FCM = require("fcm-node");
// var fcm = new FCM(serverKey);
// var serverKey = process.env.SERVERKEY;

// const sendNotification = async (title, body, deviceToken, ID) => {
//   const message = {
//     notification: {
//       title: title,
//       body: body,
//     },
//     to: deviceToken,
//     data: {
//       my_key: ID,
//     },
//   };

//   fcm.send(message, function (err, response) {
//     if (err) {
//       console.log("Something has gone wrong!");
//     } else {
//       console.log("Successfully sent with response: ", response);
//     }
//   });
// };

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
          attachArtwork.push({ url: uploader.secure_url });
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
        complaintBy,
        waterPlant,
        complaintCategory,
        complaint,
      } = req.body;
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

      const admin = await Admin.find();
      let tokendeviceArray = [];
      for (let index = 0; index < admin.length; index++) {
        const element = admin[index];
        element.devicetoken == undefined
          ? " "
          : tokendeviceArray.push(element.devicetoken);
      }
      const newdeviceToken = tokendeviceArray.filter(
        (item, index) => tokendeviceArray.indexOf(item) === index
      );
      const ID = newComplaint._id;
      const title = "A new complaint is added";
      const body = `Hello Admin, A new Complaint is added !`;
      const deviceToken = newdeviceToken;

      deviceToken.length > 0 &&
        deviceToken.forEach((eachToken) => {
          sendNotification(title, body, eachToken, ID);
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments();

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    const allComplain = await Complaint.find()
      .populate("waterPlant")
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    if (!allComplain) {
      return res
        .status(400)
        .send({ success: false, message: "No Complaint found! mubarak ho" });
    }

    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      success: true,
      data: allComplain,
      page,
      totalPages,
      limit,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/complaints/:Id", async (req, res) => {
  try {
    const Id = req.params.Id;
    const allComplain = await Complaint.findById(Id).populate("waterPlant");
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
    const staffId = req.body.staffId;
    const updated = {
      staffId,
      status: "Assigned",
    };
    const assignStaff = await Complaint.findByIdAndUpdate(
      complaintId,
      updated,
      { new: true }
    );

    const staff = await Staff.findById(staffId);

    const name = staff.name;
    const deviceToken = staff.deviceToken;
    const ID = complaintId;
    const title = "A new complaint is assign to you";
    const body = `Hello ${name}, A new Complaint is asssign to you`;

    sendNotification(title, body, deviceToken, ID);

    res.status(200).send({ message: "Staff added successfully!", assignStaff });
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
            folder: "24-Karat",
          });
          attachArtwork.push({ url: uploader.secure_url });
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
      const text = req.body.text;
      const complaintReply = new ComplaintResolved({
        complaintId: req.params.Id,
        text,
        resolved: true,
        pics: attachArtwork.map((x) => x.url),
      });
      const resolvedComplaint = complaintReply._id.toString();
      const updated = {
        resolvedComplaint,
        status: "Resolved",
      };
      const complaint = await Complaint.findByIdAndUpdate(
        complaintId,
        updated,
        { new: true }
      );

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

router.get("/complaint/resolve/one/:id", async (req, res) => {
  try {
    const resolvedId = req.params.id;
    const allComplain = await ComplaintResolved.findById(resolvedId).populate(
      "complaintId"
    );

    if (!allComplain) {
      return res
        .status(400)
        .send({ success: false, message: "No Complaint found!" });
    }

    res.status(200).send({
      success: true,
      data: allComplain,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/complaint/resolve", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await ComplaintResolved.countDocuments();

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    const allComplain = await ComplaintResolved.find()
      .populate("complaintId")
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    if (!allComplain) {
      return res
        .status(400)
        .send({ success: false, message: "No Complaint found! mubarak ho" });
    }
    const totalPages = Math.ceil(total / limit);
    res.status(200).send({
      success: true,
      data: allComplain,
      page,
      totalPages,
      limit,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/complaintStatus/:status", async (req, res) => {
  try {
    const statusFind = req.params.status;
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    if (statusFind === "All") {
      const total = await Complaint.countDocuments();
      const allComplaint = await Complaint.find()
        .populate("waterPlant")
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      const totalPages = Math.ceil(total / limit);
      return res.status(200).send({
        success: true,
        data: allComplaint,
        page,
        totalPages,
        limit,
        total,
      });
    } else if (statusFind) {
      const total = await Complaint.countDocuments({ status: statusFind });
      const statusComplaint = await Complaint.find({ status: statusFind })
        .populate("waterPlant")
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: statusComplaint,
        page,
        totalPages,
        limit,
        total,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

module.exports = router;
