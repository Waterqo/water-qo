const mongoose = require("mongoose")

const PlantsSchema = new mongoose.Schema({
    plants_id:{
        type: String,
    },
    short_id:{
        type:String,
    },
    address:{
        type: String,
    },
    latitude:{
       type: Number, 
    },
    longitude:{
        type: Number,
    },
    zone:{
        type: String,
    },
    project:{
        type: String,
    },
})

const Plant = mongoose.model("Plant", PlantsSchema)
module.exports = Plant  