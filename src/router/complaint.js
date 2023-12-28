const router = require("express").Router();
const cloudinary = require("../helper/cloudinary");
const fs = require("fs");
const Staff = require("../models/staff");
const Client = require("../models/clientSchema");
const Admin = require("../models/admin");
const upload = require("../helper/multer");
const Complaint = require("../models/complaintSchme");
const ComplaintResolved = require("../models/complaintResolvedSchme");
const { ComplaintJoiSchema } = require("../helper/joi/joiSchema");
const Comment = require("../models/comments");
const Inventory = require("../models/inventery");
const { verifyInvManager } = require("../middlewares/verify");

var FCM = require("fcm-node");
const { filter } = require("compression");
const InvManager = require("../models/inventerymanage");
const { timeStamp } = require("console");
const { now } = require("mongoose");
const ComplaintCategory = require("../models/complainCategory");
const Plant = require("../models/plants");
var serverKey = process.env.SERVERKEY;
var fcm = new FCM(serverKey);

const sendNotification = async (title, body, deviceToken, ID) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    to: deviceToken,
    data: {
      my_key: ID,
    },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

router.post(
  "/create/complaint/:Id",
  upload.fields([
    { name: "attachArtwork", maxCount: 5 },
    { name: "voice", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const processFiles = async (files, folder) => {
        const result = [];
        for (const file of files) {
          const { path } = file;
          try {
            const uploader = await cloudinary.uploader.upload(
              path,
              { folder },
              {
                resource_type: "video",
                public_id: `VideoUploads/${
                  file.originalname + new Date().toString()
                }`,
                chunk_size: 6000000,
                eager: [
                  {
                    width: 300,
                    height: 300,
                    crop: "pad",
                    audio_codec: "none",
                  },
                  {
                    width: 160,
                    height: 100,
                    crop: "crop",
                    gravity: "south",
                    audio_codec: "none",
                  },
                ],
              }
            );
            result.push({ url: uploader.secure_url });
            fs.unlinkSync(path);
          } catch (err) {
            if (result.length) {
              const imgs = result.map((obj) => obj.public_id);
              cloudinary.api.delete_resources(imgs);
            }
            console.log(err);
            throw new Error(`Error uploading ${folder} file`);
          }
        }
        return result;
      };

      const attachArtwork = await processFiles(
        req.files.attachArtwork || [],
        "24-Karat"
      );
      const voiceUrls = await processFiles(
        req.files.voice || [],
        "24-Karat/voice"
      );

      const userId = req.params.Id;
      const { nameOfComplainter, waterPlant, complaintCategory, complaint } =
        req.body;

      if (!nameOfComplainter || !waterPlant || !complaintCategory) {
        return res
          .status(400)
          .send({ success: false, message: "Please provide all the details" });
      }

      const plant = await Plant.findById(waterPlant);
      const complaintCode = plant
        ? `${plant.short_id} - ${new Date().toLocaleDateString()}`
        : "Unknown";

      const user = (await Client.findById(userId)) || {};
      const userAdmin = (await Admin.findById(userId)) || {};
      const userStaff = (await Staff.findById(userId)) || {};

      const newComplaint = new Complaint({
        complaintCode,
        nameOfComplainter,
        waterPlant,
        complaintCategory,
        voice: voiceUrls.length > 0 ? voiceUrls[0].url : null,
        complaint,
        complaintType: userAdmin ? "Normal" : userStaff ? "Normal" : undefined,
        status: "Pending",
        pics: attachArtwork.length > 0 ? attachArtwork[0].url : null,
        clientID: user._id,
        adminID: userAdmin._id,
        staff: userStaff._id,
        role: userAdmin ? "Admin" : userStaff ? "Staff" : "Client",
      });

      const admin = await Admin.find();
      const deviceToken = [
        ...new Set(admin.map((element) => element.deviceToken || "")),
      ].filter(Boolean);

      const ID = newComplaint._id;
      const title = "A new complaint is added";
      const body = `Hello Admin, A new Complaint is added !`;

      deviceToken.forEach((eachToken) =>
        sendNotification(title, body, eachToken, ID)
      );

      await newComplaint.save();

      res.status(200).send({
        success: true,
        message: "Your complaint has been submitted successfully",
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

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    if (req.query.sortedData == "Urgent") {
      const total = await Complaint.countDocuments({ complaintType: "Urgent" });

      const allComplain = await Complaint.find({ complaintType: "Urgent" })
        .populate("waterPlant")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      if (!allComplain) {
        return res
          .status(400)
          .send({ success: false, message: "No Complaint found! mubarak ho" });
      }

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: allComplain,
        page,
        totalPages,
        limit,
        total,
      });
    } else if (req.query.sortedData == "VeryUrgent") {
      const total = await Complaint.countDocuments({
        complaintType: "VeryUrgent",
      });
      const allComplain = await Complaint.find({ complaintType: "VeryUrgent" })
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

      return res.status(200).send({
        success: true,
        data: allComplain,
        page,
        totalPages,
        limit,
        total,
      });
    }
    const total = await Complaint.countDocuments();
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
    const assignStaff = await Complaint.findById(complaintId);
    assignStaff.staffId = staffId || assignStaff.staffId;
    assignStaff.status = "Assigned";
    assignStaff.timeToStaffAssign = Date.apply();

    assignStaff.save();
    console.log(assignStaff);

    const staff = await Staff.findById(staffId);
    if (staff) {
      const name = staff.name;
      const deviceToken = staff.deviceToken;
      const ID = complaintId;
      const title = "A new complaint is assign to you";
      const body = `Hello ${name}, A new Complaint is asssign to you`;

      sendNotification(title, body, deviceToken, ID);
    }

    if (assignStaff.role == "Staff") {
      const user = await Staff.findById(assignStaff.staff.toString());

      const name = user.name;
      const deviceToken = user.deviceToken;
      const ID = complaintId;
      const title = "Admin just assign the Operator in your Complaint";
      const body = `Hello ${name}, Admin just assign the Operator in your Complaint`;

      sendNotification(title, body, deviceToken, ID);
    } else if (assignStaff.role == "Client") {
      const user = await Client.findById(assignStaff.clientID.toString());

      const name = user.name;
      const deviceToken = user.deviceToken;
      const ID = complaintId;
      const title = "Admin just assign the Operator in your Complaint";
      const body = `Hello ${name}, Admin just assign the Operator in your Complaint`;

      sendNotification(title, body, deviceToken, ID);
    }

    res.status(200).send({ message: "Staff added successfully!", assignStaff });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.post(
  "/complaint/resolved/:Id",
  upload.fields([
    { name: "attachArtwork", maxCount: 5 },
    { name: "voice", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const processFiles = async (files, folder) => {
        const result = [];
        for (const file of files) {
          const { path } = file;
          try {
            const uploader = await cloudinary.uploader.upload(path, {
              resource_type: "video",
              public_id: `VideoUploads/${
                file.originalname + new Date().toString()
              }`,
              chunk_size: 6000000,
              eager: [
                {
                  width: 300,
                  height: 300,
                  crop: "pad",
                  audio_codec: "none",
                },
                {
                  width: 160,
                  height: 100,
                  crop: "crop",
                  gravity: "south",
                  audio_codec: "none",
                },
              ],
            });
            result.push({ url: uploader.secure_url });
            fs.unlinkSync(path);
          } catch (err) {
            if (result.length) {
              const imgs = result.map((obj) => obj.public_id);
              cloudinary.api.delete_resources(imgs);
            }
            console.log(err);
            throw new Error(`Error uploading ${folder} file`);
          }
        }
        return result;
      };

      const attachArtwork = await processFiles(
        req.files.attachArtwork || [],
        "24-Karat"
      );
      const voiceUrls = await processFiles(
        req.files.voice || [],
        "24-Karat/voice"
      );

      const complaintId = req.params.Id;
      const { text, recommendation, inventoryItem } = req.body;
      let index = inventoryItem.indexOf("");
      if (index !== -1) {
        inventoryItem.splice(index, 1);
      }
      let inventoryArray = [];
      if (inventoryItem.length >= 1) {
        for (let i = 0; i < inventoryItem.length; i++) {
          const element = JSON.parse(inventoryItem[i]);
          inventoryArray.push(element);
        }
      }
      // console.log(inventoryItems);
      // let inventoryArray = [];
      // for (let i = 0; i < inventoryItems.length; i++) {
      //   const element = inventoryItems[i];
      //   console.log(element);
      //   const inventery = await Inventory.findById(element);
      //   if (inventery.Stock == 0) {
      //     return res.status(400).send({
      //       success: false,
      //       message: `The Item you choose "${inventery.MaterialInventory}" is already 0`,
      //     });
      //   }
      //   inventery.Stock = inventery.Stock - 1;
      //   await inventery.save();
      //   inventoryArray.push(inventery.MaterialInventory);
      // }
      const complaintReply = new ComplaintResolved({
        complaintId: req.params.Id,
        inventoryItem: inventoryArray,
        recommendation,
        text,
        voice: voiceUrls.length > 0 ? voiceUrls[0].url : null,
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

      const admin = await Admin.find();
      let tokendeviceArray = [];
      for (let index = 0; index < admin.length; index++) {
        const element = admin[index];
        element.deviceToken == undefined
          ? " "
          : tokendeviceArray.push(element.deviceToken);
      }
      const newdeviceToken = tokendeviceArray.filter(
        (item, index) => tokendeviceArray.indexOf(item) === index
      );
      const ID = complaintReply._id;
      const title = "The past complainted is solved";
      const body = `Hello Admin, your past complainted is solved!`;
      const deviceToken = newdeviceToken;

      deviceToken.length > 0 &&
        deviceToken.forEach((eachToken) => {
          sendNotification(title, body, eachToken, ID);
        });

      if (complaint.role == "Staff") {
        const user = await Staff.findById(complaint.staff.toString());

        const name = user.name;
        const deviceToken = user.deviceToken;
        const ID = complaintId;
        const title = "Your Complainted just Solved";
        const body = `Hello ${name}, Your Complainted just solved`;

        sendNotification(title, body, deviceToken, ID);
      } else if (complaint.role == "Client") {
        const user = await Client.findById(complaint.clientID.toString());

        const name = user.name;
        const deviceToken = user.deviceToken;
        const ID = complaintId;
        const title = "Your Complainted just Solved";
        const body = `Hello ${name}, Your Complainted just Solved`;

        sendNotification(title, body, deviceToken, ID);
      }

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
    const allComplain = await ComplaintResolved.findById(resolvedId)
      .populate({ path: "comment", select: "comment file userId" })
      .populate("complaintId")
      .populate({
        path: "inventoryItem",
        select: "Id",
        populate: { path: "Id", select: "Code MaterialInventory" },
      });

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
      .populate({ path: "complaintCategory", select: "complaintCategory" })
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

router.get("/complaintStatus/:status/:type", async (req, res) => {
  try {
    const statusFind = req.params.status;
    const typeFind = req.params.type;
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    let filterObj = { status: statusFind, complaintType: typeFind };

    if (statusFind === "All") {
      delete filterObj.status;
    }
    if (typeFind === "All") {
      delete filterObj.complaintType;
    }

    const total = await Complaint.countDocuments(filterObj);

    const allComplain = await Complaint.find(filterObj)
      .populate("waterPlant")
      .populate({ path: "complaintCategory", select: "complaintCategory" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    if (!allComplain) {
      return res
        .status(400)
        .send({ success: false, message: "No Complaint found! mubarak ho" });
    }

    const totalPages = Math.ceil(total / limit);

    return res.status(200).send({
      success: true,
      data: allComplain,
      page,
      totalPages,
      limit,
      total,
    });

    // if (typeFind === "Urgent") {

    // } else if (typeFind === "VeryUrgent") {
    //   const total = await Complaint.countDocuments({
    //     complaintType: "VeryUrgent",
    //   });
    //   const allComplain = await Complaint.find({ complaintType: "VeryUrgent" })
    //     .populate("waterPlant")
    //     .skip(skip)
    //     .limit(limit)
    //     .sort(sortBY);

    //   if (!allComplain) {
    //     return res
    //       .status(400)
    //       .send({ success: false, message: "No Complaint found! mubarak ho" });
    //   }

    //   const totalPages = Math.ceil(total / limit);

    //   return res.status(200).send({
    //     success: true,
    //     data: allComplain,
    //     page,
    //     totalPages,
    //     limit,
    //     total,
    //   });
    // }
    // if (statusFind === "All") {
    //   const total = await Complaint.countDocuments();
    //   const allComplaint = await Complaint.find()
    //     .populate("waterPlant")
    //     .skip(skip)
    //     .limit(limit)
    //     .sort(sortBY);

    //   const totalPages = Math.ceil(total / limit);
    //   return res.status(200).send({
    //     success: true,
    //     data: allComplaint,
    //     page,
    //     totalPages,
    //     limit,
    //     total,
    //   });
    // } else if (statusFind) {
    //   const total = await Complaint.countDocuments({ status: statusFind, complaintType: typeFind });
    //   const statusComplaint = await Complaint.find({ status: statusFind })
    //     .populate("waterPlant")
    //     .skip(skip)
    //     .limit(limit)
    //     .sort(sortBY);

    //   const totalPages = Math.ceil(total / limit);

    //   return res.status(200).send({
    //     success: true,
    //     data: statusComplaint,
    //     page,
    //     totalPages,
    //     limit,
    //     total,
    //   });
    // }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/complaintByPlant/:Id", async (req, res) => {
  try {
    const plantId = req.params.Id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments({ waterPlant: plantId });

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    const plantComplaint = await Complaint.find({ waterPlant: plantId })
      .populate("waterPlant")
      .populate({ path: "complaintCategory", select: "complaintCategory" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    if (!plantComplaint) {
      return res
        .status(400)
        .send({ message: "No complaint found on that plant" });
    }
    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      success: true,
      data: plantComplaint,
      page,
      totalPages,
      limit,
      total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.get("/complaintclient/:Id/:status", async (req, res) => {
  try {
    const plantId = req.params.Id;
    const statusFind = req.params.status;
    console.log(statusFind);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments({ clientID: plantId });

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    if (statusFind === "Urgent") {
      const total = await Complaint.countDocuments({
        complaintType: "Urgent",
        clientID: plantId,
      });

      const allComplain = await Complaint.find({
        complaintType: "Urgent",
        clientID: plantId,
      })
        .populate("waterPlant ")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      if (!allComplain) {
        return res
          .status(400)
          .send({ success: false, message: "No Complaint found! mubarak ho" });
      }

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: allComplain,
        page,
        totalPages,
        limit,
        total,
      });
    } else if (statusFind === "VeryUrgent") {
      const total = await Complaint.countDocuments({
        complaintType: "VeryUrgent",
        clientID: plantId,
      });
      const allComplain = await Complaint.find({
        complaintType: "VeryUrgent",
        clientID: plantId,
      })
        .populate("waterPlant")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      if (!allComplain) {
        return res
          .status(400)
          .send({ success: false, message: "No Complaint found! mubarak ho" });
      }

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: allComplain,
        page,
        totalPages,
        limit,
        total,
      });
    }
    if (statusFind != "All") {
      const total = await Complaint.countDocuments({
        status: statusFind,
        clientID: plantId,
      });
      const statusComplaint = await Complaint.find({
        status: statusFind,
        clientID: plantId,
      })
        .populate("waterPlant")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
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
    } else if (statusFind == "All") {
      const plantComplaint = await Complaint.find({ clientID: plantId })
        .populate("waterPlant")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      if (!plantComplaint) {
        return res
          .status(400)
          .send({ message: "No complaint found on that plant" });
      }
      const totalPages = Math.ceil(total / limit);

      res.status(200).send({
        success: true,
        data: plantComplaint,
        page,
        totalPages,
        limit,
        total,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.get("/complaintAdmin/:Id/:status", async (req, res) => {
  try {
    const plantId = req.params.Id;
    const statusFind = req.params.status;
    console.log(statusFind);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments({ adminID: plantId });

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    if (statusFind != "All") {
      const total = await Complaint.countDocuments({
        status: statusFind,
        adminID: plantId,
      });
      const statusComplaint = await Complaint.find({
        status: statusFind,
        adminID: plantId,
      })
        .populate("waterPlant")
        .populate("waterPlant")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
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

    const plantComplaint = await Complaint.find({ adminID: plantId })
      .populate("waterPlant")
      .populate({ path: "complaintCategory", select: "complaintCategory" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    if (!plantComplaint) {
      return res
        .status(400)
        .send({ message: "No complaint found on that plant" });
    }
    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      success: true,
      data: plantComplaint,
      page,
      totalPages,
      limit,
      total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.get("/complaintStaff/:Id/:status", async (req, res) => {
  try {
    const plantId = req.params.Id;
    const statusFind = req.params.status;
    console.log(plantId);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments({ staff: plantId });

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    if (statusFind === "Urgent") {
      const total = await Complaint.countDocuments({
        complaintType: "Urgent",
        staff: plantId,
      });

      const allComplain = await Complaint.find({
        complaintType: "Urgent",
        staff: plantId,
      })
        .populate("waterPlant ")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      if (!allComplain) {
        return res
          .status(400)
          .send({ success: false, message: "No Complaint found! mubarak ho" });
      }

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: allComplain,
        page,
        totalPages,
        limit,
        total,
      });
    } else if (statusFind === "VeryUrgent") {
      const total = await Complaint.countDocuments({
        complaintType: "VeryUrgent",
        staff: plantId,
      });
      const allComplain = await Complaint.find({
        complaintType: "VeryUrgent",
        staff: plantId,
      })
        .populate("waterPlant")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      if (!allComplain) {
        return res
          .status(400)
          .send({ success: false, message: "No Complaint found! mubarak ho" });
      }

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: allComplain,
        page,
        totalPages,
        limit,
        total,
      });
    }

    if (statusFind != "All") {
      const total = await Complaint.countDocuments({
        status: statusFind,
        staff: plantId,
      });
      const statusComplaint = await Complaint.find({
        status: statusFind,
        staff: plantId,
      })
        .populate("waterPlant")
        .populate({ path: "complaintCategory", select: "complaintCategory" })
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

    const plantComplaint = await Complaint.find({ staff: plantId })
      .populate("waterPlant")
      .populate({ path: "complaintCategory", select: "complaintCategory" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);
    if (!plantComplaint) {
      return res
        .status(400)
        .send({ message: "No complaint found on that plant" });
    }
    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      success: true,
      data: plantComplaint,
      page,
      totalPages,
      limit,
      total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.post(
  "/comment/:Id",
  upload.array("attachArtwork", 1),
  async (req, res) => {
    const files = req.files;
    console.log(files);
    try {
      // if (!files || files?.length < 1)
      //   return res.status(401).json({
      //     success: false,
      //     message: "You have to upload at least one image to the listing",
      //   });
      const attachArtwork = [];
      for (const file of files) {
        const { path } = file;
        try {
          const uploader = await cloudinary.uploader.upload(path, {
            resource_type: "video",
            public_id: `VideoUploads/${
              file.originalname + new Date().toString()
            }`,
            chunk_size: 6000000,
            eager: [
              {
                width: 300,
                height: 300,
                crop: "pad",
                audio_codec: "none",
              },
              {
                width: 160,
                height: 100,
                crop: "crop",
                gravity: "south",
                audio_codec: "none",
              },
            ],
          });
          console.log(uploader);
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
      console.log(attachArtwork);
      const resolvedId = req.params.Id;
      const comment = req.body.comment;

      const userId = req.body.userId;
      const newcomment = new Comment({
        userId,
        comment,
        resolvedId,
        file: attachArtwork.length > 0 ? attachArtwork[0].url : null,
      });
      await newcomment.save();
      console.log(newcomment);
      const complaint = await ComplaintResolved.findById(resolvedId);
      complaint.comment.push(newcomment._id);
      await complaint.save();
      return res.status(200).send({ success: true, data: complaint });
    } catch (error) {
      console.error(error);
      return res.status(500).send("internal server error");
    }
  }
);

// router.post(
//   "/comment/:Id",
//   upload.array("attachArtwork", 1),
//   async (req, res) => {
//     const files = req.files;
//     console.log(files);
//     try {
//       const attachArtwork = [];
//       for (const file of files) {
//         const { path } = file;
//         try {
//           const uploader = await cloudinary.uploader.upload(path, {
//             resource_type: "video",
//             public_id: `VideoUploads/${file.originalname}`,
//             chunk_size: 6000000,
//             eager: [
//               {
//                 width: 300,
//                 height: 300,
//                 crop: "pad",
//                 audio_codec: "none",
//               },
//               {
//                 width: 160,
//                 height: 100,
//                 crop: "crop",
//                 gravity: "south",
//                 audio_codec: "none",
//               },
//             ],
//           });
//           console.log(uploader);
//           attachArtwork.push({ url: uploader.secure_url });
//           fs.unlinkSync(path);
//         } catch (err) {
//           console.error(err);
//           return res
//             .status(400)
//             .send({ success: false, message: "Invalid video format or file" });
//         }
//       }
//       console.log(attachArtwork);
//       const resolvedId = req.params.Id;
//       const comment = req.body.comment;
//       const userId = req.body.userId;

//       const newcomment = new Comment({
//         userId,
//         comment,
//         resolvedId,
//         file: attachArtwork.length > 0 ? attachArtwork[0].url : null,
//       });
//       await newcomment.save();
//       const complaint = await ComplaintResolved.findById(resolvedId);
//       complaint.comment.push(newcomment._id);
//       await complaint.save();
//       return res.status(200).send({ success: true, data: complaint });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).send("Internal server error");
//     }
//   }
// );

router.get("/assignStaff/:Id", async (req, res) => {
  try {
    const staffId = req.params.Id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    const total = await Complaint.countDocuments({ staffId: staffId });
    const finding = await Complaint.find({ staffId: staffId })
      .populate("waterPlant")
      .populate({ path: "complaintCategory", select: "complaintCategory" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    const totalPages = Math.ceil(total / limit);
    res
      .status(200)
      .send({ success: true, data: finding, page, totalPages, limit, total });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/inventry", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Inventory.countDocuments();

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    const allComplain = await Inventory.find()
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    if (!allComplain) {
      return res
        .status(400)
        .send({ success: false, message: "No Inventory found! mubarak ho" });
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

router.get("/search/inv/:searchfield", async (req, res) => {
  try {
    const searchfield = req.params.searchfield;
    let sortBY = { createdAt: -1 };

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Inventory.countDocuments({
      MaterialInventory: { $regex: searchfield, $options: "i" },
    });

    const plant = await Inventory.find({
      MaterialInventory: { $regex: searchfield, $options: "i" },
    })
      .sort(sortBY)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res
      .status(200)
      .send({ success: true, data: plant, limit, total, page, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.put("/updateinv/:Id", verifyInvManager, async (req, res) => {
  try {
    const invId = req.params.Id;
    const { Stock, Code, MaterialInventory, Items_Quantity_Full } = req.body;
    const inv = await Inventory.findById(invId);
    inv.Stock = Stock || inv.Stock;
    inv.Code = Code || inv.Code;
    inv.MaterialInventory = MaterialInventory || inv.MaterialInventory;
    inv.Items_Quantity_Full = MaterialInventory || inv.Items_Quantity_Full;

    await inv.save();
    res.status(200).send({ success: true, data: inv });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/createInv", async (req, res) => {
  try {
    const { Stock, Code, MaterialInventory, Items_Quantity_Full } = req.body;
    const newInv = new Inventory({
      Stock,
      Code,
      MaterialInventory,
      Items_Quantity_Full,
    });
    await newInv.save();
    res.status(200).send({ success: true, data: newInv });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error!");
  }
});

router.get("/Oneinv/:Id", async (req, res) => {
  try {
    const Id = req.params.Id;
    const inv = await Inventory.findById(Id);
    if (inv == null) {
      return res.status(400).send({ success: false, data: [] });
    }
    return res.status(200).send({ success: true, data: inv });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.delete("/OneinvDelete/:Id", verifyInvManager, async (req, res) => {
  try {
    const Id = req.params.Id;
    const inv = await Inventory.findByIdAndDelete(Id);
    if (inv == null) {
      return res.status(400).send({ success: false, data: [] });
    }
    return res
      .status(200)
      .send({ success: true, message: "product deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.get("/invCut/:complaintId", async (req, res) => {
  try {
    const comaplaintResID = req.params.complaintId;

    const complaintRes = await ComplaintResolved.findById(comaplaintResID);
    const inventoryItem = complaintRes.inventoryItem;
    for (let i = 0; i < inventoryItem.length; i++) {
      const element = inventoryItem[i];
      const inventoryID = element.Id.toString();
      const inventory = await Inventory.findById(inventoryID);
      if (inventory.Stock < element.Stock) {
        return res.status(400).send({
          success: false,
          message: "Your inventory stock is lower then you used",
        });
      }
      inventory.Stock -= element.Stock;
      await inventory.save();
    }
    complaintRes.inventoryManagerApproved = "true";
    await complaintRes.save();
    console.log(complaintRes);
    res
      .status(200)
      .send({ success: true, message: "Stock deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.get("/invReport/:complaintId", async (req, res) => {
  try {
    const complaintResId = req.params.complaintId;
    const complaintRes = await ComplaintResolved.findById(complaintResId)
      .select("complaintId inventoryItem")
      .populate({
        path: "complaintId",
        select: "waterPlant staffId complaintCategory complaint",
        populate: {
          path: "waterPlant",
          select: "short_id plants_id",
        },
      })
      .populate({
        path: "complaintId",
        select: "waterPlant staffId complaintCategory complaint",
        populate: { path: "staffId", select: "name contact_number role" },
      })
      .populate({
        path: "inventoryItem",
        select: "Id",
        populate: { path: "Id", select: "Code MaterialInventory" },
      });
    res.status(200).send({
      success: true,
      data: complaintRes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.post("/category", async (req, res) => {
  try {
    const complaintCategory = req.body.complaintCategory;
    const category = new ComplaintCategory({
      complaintCategory,
    });
    await category.save();
    return res.status(200).send({ success: true, data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error!");
  }
});

router.get("/categoryAll", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    const total = await ComplaintCategory.countDocuments();
    const all = await ComplaintCategory.find()
      .skip(skip)
      .limit(limit)
      .sort(sortBY);
    const totalPages = Math.ceil(total / limit);

    res
      .status(200)
      .send({ success: true, data: all, page, totalPages, limit, total });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/categoryOne/:Id", async (req, res) => {
  try {
    const id = req.params.Id;
    const all = await ComplaintCategory.findById(id);
    res.status(200).send({ success: true, data: all });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.put("/category/:Id", async (req, res) => {
  try {
    const id = req.params.Id;
    const complaintCategory = req.body.complaintCategory;
    const category = await ComplaintCategory.findById(id);
    category.complaintCategory =
      complaintCategory || category.complaintCategory;

    await category.save();
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.delete("/categoryDelete/:Id", async (req, res) => {
  try {
    const id = req.params.Id;
    const all = await ComplaintCategory.findByIdAndDelete(id);
    res
      .status(200)
      .send({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
