const DailyVisit = require("../models/dailyVisiti");
const router = require("express").Router();
const cloudinary = require("../helper/cloudinary");
const fs = require("fs");
const upload = require("../helper/multer");

router.post("/visits", upload.array("attachArtwork", 5), async (req, res) => {
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
        attachArtwork.push({  url: uploader.secure_url });
        fs.unlinkSync(path);
      } catch (err) {
        if (attachArtwork?.length) {
          const imgs = imgObjs.map((obj) => obj.public_id);
          cloudinary.api.delete_resources(imgs);
        }
        console.log(err);
      }
    }
    const { userId, location } = req.body;

    const visitDaily = new DailyVisit({
      userId: req.body.userId,
      location: req.body.location,
      pics: attachArtwork.map((x) => x.url),
    });
    await visitDaily.save();
    res.status(200).send({
      message: "complaint is successsfully resolved",
      visitDaily,
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
    if(req.query.sort){
      sortBY = JSON.parse(req.query.sort) 
    }

    const allVisits = await DailyVisit.find()
      .skip(skip)
      .limit(limit)
      .sort(sortBY)

    if (!allVisits.length > 0) {
      return res.status(400).send({ message: "no Visits found" });
    }
    const totalPages = Math.ceil(total   / limit);
    res.status(200).send({ 
      success: true, 
      data: allVisits,
      page, 
      totalPages, 
      limit, 
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/one/visits/:visitId", async (req, res) => {
  try {
    const visitId = req.params.visitId

    const allVisits = await DailyVisit.findById(visitId);

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
