const Joi = require("joi");

const AdminSchema = Joi.object({
  name: Joi.string().required(),
  contact_number: Joi.number().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
}).unknown();

const AdminJoiSchema = (req, res, next) => {
  const { error } = AdminSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error });
  } else {
    next();
  }
};

const ClientSchme = Joi.object({
  name: Joi.string().required(),
  contact_number: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
}).unknown();

const ClientJoiSchme = (req, res, next) => {
  const { error } = ClientSchme.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error });
  } else {
    next();
  }
};

const ComplaintSchme = Joi.object({
  nameOfComplainter: Joi.string().required(),
  complaintCategory: Joi.string()
    .required()
    .valid(
      "Storage & RAW Tank Level Fault",
      "Flow Valve Fault",
      "MPV Kit Fault",
      "Gear Fault (Large & Small)",
      "MPV Supply Fault",
      "Distributor Vessel",
      "Varm Com Varm Damage",
      "Controller Kit Fault",
      "Taps Change Fault",
      "Taps Fittings Fault",
      "Feed Pump Winding Fault",
      "Feed Pump Impeller Fault",
      "Feed Pump Controller Fault",
      "Staner Fault",
      "Roter Meter Fault",
      "SP Coil",
      "SP Valve",
      "MC Fault",
      "MC Fault",
      "Circuit Breaker Fault",
      "Over Load",
      "Power Supply 24v",
      "PLC Fault",
      "Relay Fault",
      "Change Over Breaker",
      "Flow Meter Fault",
      "Tank Damage",
      "Internal Plant Cleaning",
      "External Plant Cleaning",
      "Lamp & Lamp Holder Damage",
      "Plant External Civil Work Required ",
      "Plant Internal Civil Work Required",
      "Door Work Required",
      "Windows Work Required",
      "Drain Faults"
    ),
  complaint: Joi.string().required(),
}).unknown();

const ComplaintJoiSchema = (req, res, next) => {
  const { error } = ComplaintSchme.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error });
  } else {
    next();
  }
};

module.exports = { AdminJoiSchema, ClientJoiSchme, ComplaintJoiSchema };
