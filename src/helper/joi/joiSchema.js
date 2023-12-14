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

const StaffSchema = Joi.object({
  name: Joi.string().required(),
  contact_number: Joi.number().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
}).unknown();

const StaffJoiSchema = (req, res, next) => {
  const { error } = StaffSchema.validate(req.body, { abortEarly: false });
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

module.exports = {
  AdminJoiSchema,
  StaffJoiSchema,
  ClientJoiSchme,
  ComplaintJoiSchema,
};
