const DailyVisit = require("../models/dailyVisiti");
const router = require("express").Router();
const cloudinary = require("../helper/cloudinary");
const Plant = require("../models/plants");
const fs = require("fs");
const upload = require("../helper/multer");

// router.post("/visits", upload.array("attachArtwork", 10), async (req, res) => {
//   const files = req.files;
//   const attachArtwork = [];
//   try {
//     if (!files || files?.length < 1)
//       return res.status(401).json({
//         success: false,
//         message: "You have to upload at least one image to the listing",
//       });
//     for (const file of files) {
//       const { path } = file;
//       try {
//         const uploader = await cloudinary.uploader.upload(path, {
//           folder: "24-Karat",
//         });
//         attachArtwork.push({ url: uploader.secure_url });
//         fs.unlinkSync(path);
//       } catch (err) {
//         if (attachArtwork?.length) {
//           const imgs = imgObjs.map((obj) => obj.public_id);
//           cloudinary.api.delete_resources(imgs);
//         }
//         console.log(err);
//       }
//     }
//     const { userId, location } = req.body;

//     const visitDaily = new DailyVisit({
//       userId: req.body.userId,
//       location: req.body.location,
//       pics: attachArtwork.map((x) => x.url),
//     });
//     await visitDaily.save();
//     res.status(200).send({
//       message: "complaint is successsfully resolved",
//       visitDaily,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error: " + error.message);
//   }
// });

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
      if (!files || files?.length < 1)
        return res.status(401).json({
          success: false,
          message: "You have to upload at least one image to the listing",
        });
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

      const visitDaily = new DailyVisit({
        userId: req.body.userId,
        location: req.body.location,
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
      });
      const pumb = await Plant.findById(req.body.location);
      console.log(pumb);
      await visitDaily.save();
      res.status(200).send({
        message: "complaint is successsfully resolved",
        visitDaily,
        latitude: pumb.latitude,
        longitude: pumb.longitude,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error: " + error.message);
    }
  }
);

router.get("/all/visits/:Id", async (req, res) => {
  try {
    const staffID = req.params.Id;
    console.log(staffID);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await DailyVisit.countDocuments({ userId: staffID });

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    const allVisits = await DailyVisit.find({ userId: staffID })
      .populate({ path: "location", select: "address latitude longitude" })
      .populate({ path: "userId", select: "name contact_number" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);
    if (!allVisits.length > 0) {
      return res.status(400).send({ message: "no Visits found" });
    }
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
    const total = await DailyVisit.countDocuments();

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }

    const allVisits = await DailyVisit.find()
      .populate({ path: "location", select: "address latitude longitude" })
      .populate({ path: "userId", select: "name contact_number" })
      .skip(skip)
      .limit(limit)
      .sort(sortBY);
    if (!allVisits.length > 0) {
      return res.status(400).send({ message: "no Visits found" });
    }
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
