const geo = require("geo");
const DailyVisit = require("../models/dailyVisiti");
const router = require("express").Router();
const cloudinary = require("../helper/cloudinary");
const Plant = require("../models/plants");
const fs = require("fs");
const upload = require("../helper/multer");

var FCM = require("fcm-node");
const Staff = require("../models/staff");

var serverKey = process.env.SERVERKEY;
var fcm = new FCM(serverKey);

const sendNotification = async (title, body, deviceToken) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    to: deviceToken,
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
  "/visits",
  upload.fields([
    { name: "Complain_Cell_Sticker", maxCount: 5 },
    { name: "Internal_Panel", maxCount: 5 },
    { name: "MPVs_Meters", maxCount: 5 },
    { name: "Water_Meter", maxCount: 5 },
    { name: "Dispensing_Area_Cleaning", maxCount: 5 },
    { name: "Internal_Plant_Cleaning", maxCount: 5 },
    { name: "Log_Book", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      console.log(files);
      if (files) {
        const visitDaily = new DailyVisit({});
        await visitDaily.save();
        res.status(200).send({
          success: true,
          message:
            "You visit request is in process. You will be notified later !",
        });
      }

      // console.log(files);
      const attachArtwork = {
        Complain_Cell_Sticker: [],
        Internal_Panel: [],
        MPVs_Meters: [],
        Water_Meter: [],
        Dispensing_Area_Cleaning: [],
        Internal_Plant_Cleaning: [],
        Log_Book: [],
      };
      if (!files || files?.length < 1) {
        const title = "Visit request faild";
        const body = "You have to upload at least one image to the listing";
        const userId = req.body.userId;
        device = await Staff.findById(userId).select("deviceToken");
        deviceToken = device.deviceToken;
        console.log(deviceToken);
        sendNotification(title, body, deviceToken);
      }

      // return res.status(401).json({
      //   success: false,
      //   message: "You have to upload at least one image to the listing",
      // });
      for (const fileArray in files) {
        for (const file in files[fileArray]) {
          try {
            const uploader = await cloudinary.uploader.upload(
              files[fileArray][file].path,
              {
                folder: "Blogging",
              }
            );
            attachArtwork[fileArray].push({
              url: uploader.secure_url,
              type: fileArray,
            });
            fs.unlinkSync(files[fileArray][file].path);
          } catch (err) {
            if (attachArtwork[fileArray]?.length) {
              const imgs = attachArtwork[fileArray].map((obj) => obj.public_id);
              cloudinary.api.delete_resources(imgs);
            }
            console.log(err);
          }
        }
      }
      const meter = req.body.meterReading;
      const plant = await Plant.findById(req.body.location);
      const meterReading = meter - plant.meterCount;

      const visitDaily = {
        userId: req.body.userId,
        location: req.body.location,
        meterReading,
        Complain_Cell_Sticker: attachArtwork.Complain_Cell_Sticker.map(
          (x) => x.url
        ),
        Internal_Panel: attachArtwork.Internal_Panel.map((x) => x.url),
        MPVs_Meters: attachArtwork.MPVs_Meters.map((x) => x.url),
        Water_Meter: attachArtwork.Water_Meter.map((x) => x.url),
        Dispensing_Area_Cleaning: attachArtwork.Dispensing_Area_Cleaning.map(
          (x) => x.url
        ),
        Internal_Plant_Cleaning: attachArtwork.Internal_Plant_Cleaning.map(
          (x) => x.url
        ),
        Log_Book: attachArtwork.Log_Book.map((x) => x.url),
        uploaded: true,
      };
      const pumb = await Plant.findById(req.body.location);

      function calculateDistance(lat, lon, latitude, longitude) {
        const R = 6371; // Radius of the Earth in km
        const dLat = deg2rad(latitude - lat);
        const dLon = deg2rad(longitude - lon);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat)) *
            Math.cos(deg2rad(latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
      }
      function deg2rad(deg) {
        return deg * (Math.PI / 180);
      }
      const plantLat = pumb.latitude;
      const plantLon = pumb.longitude;

      const userLat = req.body.latitude;
      const userLon = req.body.longitude;
      const distance = calculateDistance(plantLat, plantLon, userLat, userLon);

      if (distance > 5) {
        const title = "Visit request faild";
        const body = "You are not in a 5-KM radius form the Plant location";
        const userId = req.body.userId;
        device = await Staff.findById(userId).select("deviceToken");
        deviceToken = device.deviceToken;
        console.log(deviceToken);
        sendNotification(title, body, deviceToken);
        // return res.status(400).send({
        //   success: false,
        //   message: "You are not in a 5-KM radius form the Plant location",
        // });
      }
      console.log(plant.meterCount);
      console.log(meter);
      plant.meterCount = meter;
      await plant.save();
      await visitDaily.save();

      const title = "Visit request has been added";
      const body =
        "Your visit request has been added to the server  ThankYou! ";
      const userId = req.body.userId;
      device = await Staff.findById(userId).select("deviceToken");
      deviceToken = device.deviceToken;
      console.log(deviceToken);
      sendNotification(title, body, deviceToken);
    } catch (error) {
      console.error(error);
      const title = "Visit request faild";
      const body = "SomeThing Went Wrong, Try again later, Maybe server Error";
      const userId = req.body.userId;
      device = await Staff.findById(userId).select("deviceToken");
      deviceToken = device.deviceToken;
      console.log(deviceToken);
      sendNotification(title, body, deviceToken);
      // res.status(500).send("Internal Server Error: " + error.message);
    }
  }
);

router.get("/all/visits/:Id", async (req, res) => {
  try {
    const staffID = req.params.Id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    let startDate = req.query.startDate;
    let endDate = req.query.endDate;

    if (startDate || endDate) {
      if (startDate && !endDate) {
        endDate = startDate;
      } else if (!startDate && endDate) {
        startDate = endDate;
      }

      startDate = new Date(startDate);
      endDate = new Date(endDate);
      startDate.setHours(0);
      endDate.setHours(24);

      console.log(
        startDate.toLocaleString(),
        "endDate",
        endDate.toLocaleString()
      );

      const total = await DailyVisit.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        userId: staffID,
      });

      const allVisits = await DailyVisit.find({
        createdAt: { $gte: startDate, $lte: endDate },
        userId: staffID,
      })
        .populate({
          path: "location",
          select: "address plants_id short_id latitude longitude",
        })
        .populate({ path: "userId", select: "name contact_number" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: allVisits,
        page,
        totalPages,
        limit,
        total,
      });
    }

    const total = await DailyVisit.countDocuments({ userId: staffID });
    const allVisits = await DailyVisit.find({ userId: staffID })
      .populate({
        path: "location",
        select: "address plants_id short_id latitude longitude",
      })
      .populate({ path: "userId", select: "name contact_number" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      success: true,
      data: allVisits,
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

router.get("/all/visit/:plantId", async (req, res) => {
  try {
    const plantId = req.params.plantId;
    console.log(plantId);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await DailyVisit.countDocuments({ location: plantId });

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    if (startDate || endDate) {
      if (startDate && !endDate) {
        endDate = startDate;
      } else if (!startDate && endDate) {
        startDate = endDate;
      }

      startDate = new Date(startDate);
      endDate = new Date(endDate);
      startDate.setHours(0);
      endDate.setHours(24);

      console.log(
        startDate.toLocaleString(),
        "endDate",
        endDate.toLocaleString()
      );

      const total = await DailyVisit.countDocuments({
        location: plantId,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      const allVisits = await DailyVisit.find({
        location: plantId,
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .populate({
          path: "location",
          select: "address plants_id short_id latitude longitude",
        })
        .populate({ path: "userId", select: "name contact_number" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: allVisits,
        page,
        totalPages,
        limit,
        total,
      });
    }

    const allVisits = await DailyVisit.find({ location: plantId })
      .populate({
        path: "location",
        select: "address plants_id short_id latitude longitude",
      })
      .populate({ path: "userId", select: "name contact_number" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    const totalPages = Math.ceil(total / limit);
    res.status(200).send({
      success: true,
      data: allVisits,
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

router.get("/all/visits", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    if (startDate || endDate) {
      if (startDate && !endDate) {
        endDate = startDate;
      } else if (!startDate && endDate) {
        startDate = endDate;
      }

      startDate = new Date(startDate);
      endDate = new Date(endDate);
      startDate.setHours(0);
      endDate.setHours(24);

      console.log(
        startDate.toLocaleString(),
        "endDate",
        endDate.toLocaleString()
      );

      const total = await DailyVisit.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      });

      const allVisits = await DailyVisit.find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .populate({
          path: "location",
          select: "address plants_id short_id latitude longitude",
        })
        .populate({ path: "userId", select: "name contact_number" })
        .skip(skip)
        .limit(limit)
        .sort(sortBY);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).send({
        success: true,
        data: allVisits,
        page,
        totalPages,
        limit,
        total,
      });
    }

    const total = await DailyVisit.countDocuments();
    const allVisits = await DailyVisit.find()
      .populate({
        path: "location",
        select: "address plants_id short_id latitude longitude",
      })
      .populate({ path: "userId", select: "name contact_number" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);

    const totalPages = Math.ceil(total / limit);
    res.status(200).send({
      success: true,
      data: allVisits,
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

router.get("/one/visits/:visitId", async (req, res) => {
  try {
    const visitId = req.params.visitId;

    const allVisits = await DailyVisit.findById(visitId)
      .populate("userId")
      .populate("location");

    if (!allVisits) {
      return res.status(400).send({ message: "no Visits found" });
    }
    res.status(200).send({ success: true, allVisits });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

module.exports = router;
