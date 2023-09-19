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
        const allPlant = await Plant.find()
        res.status(200).send({success: true, data: allPlant})
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

module.exports = router
