const Plant = require("../models/plants")
const router = require("express").Router();

router.post("/added", async (req, res)=>{
    try {
        const { plants_id, short_id,  address, latitude, longitude, zone, project} = req.body
        const newPlant = await new Plant({
            ...req.body
        })
        await newPlant.save()
        res.status(200).send({success: true, data: newPlant})
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});

router.get("/all", async (req, res)=>{
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      const total = await Plant.countDocuments();
  
      let sortBY = { createdAt: -1 };
      if(req.query.sort){
        sortBY = JSON.parse(req.query.sort) 
  
      }
        const allPlant = await Plant.find()
          .select("short_id address")
          .skip(skip)
          .limit(limit)
          .sort(sortBY)
        
        const totalPages = Math.ceil(total   / limit);
        res.status(200).send({
          success: true, 
          data: allPlant,
          page, 
          totalPages, 
          limit, 
          total
        })
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});

router.get("/one/:address", async (req, res)=>{
    try {
        const address = req.params.address
        const plant = await Plant.find({address});
        if(plant.length <= 0){
            return res.status(400).send({success: false, message: "No Plant found on that location"})
        }
        res.status(200).send({success:true, data: plant})
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});

router.get("/search/:address", async (req, res, next) => {
  try {
    const searchfield = req.params.address;
    let sortBY = { createdAt: -1 };

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Plant.countDocuments({
      address: { $regex: searchfield, $options: "i" },
    });

    const plant = await Plant.find({
      address: { $regex: searchfield, $options: "i" },
    })
      .sort(sortBY)
      .skip(skip)
      .limit(limit)
      .select("short_id address")
    
    const totalPages = Math.ceil(total / limit);

    res
      .status(200)
      .send({ success: true, data: plant, limit, total, totalPages });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});
module.exports = router
