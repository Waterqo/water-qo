const Plant = require("../models/plants")
const router = require("express").Router();

router.post("/plants/added", async (req, res)=>{
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

module.exports = router