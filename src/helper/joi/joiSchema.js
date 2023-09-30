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
      "Water Quality and Taste",
      "Service and Billing",
      "Safety Concerns",
      "Customer Service",
      "Availability and Stock",
      "Delivery Issues",
      "Communication and Transparency",
      "Environmental Concerns",
      "Technical Problems",
      "General Hygiene and Cleanliness",
      "Accessibility Issues"
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
