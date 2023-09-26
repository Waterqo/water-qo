const router = require("express").Router();

const Admin = require("../models/admin");
const Client = require("../models/clientSchema");
const Staff = require("../models/staff")
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { AdminJoiSchema, ClientJoiSchme } = require("../helper/joi/joiSchema");

router.post("/register/client", ClientJoiSchme, async (req, res) => {
  try {
    const { name, contact_number, email, password, address, city } = req.body;
    if (!name || !contact_number || !email || !password || !address || !city) {
      return res.status(400).send("Kindly provide complete information.");
    }

    const existingUser = await Client.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: "The email is already registered go to login!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new Client({
      name,
      contact_number,
      email,
      password: hashedPassword,
      address,
      city,
      role: "Client"
    });
    await user.save();
    res
      .status(200)
      .send({ success: true, message: "Client Register Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.post("/register/admin", AdminJoiSchema, async (req, res) => {
  try {
    const { name, contact_number, email, password } = req.body;
    if (!name || !contact_number || !email || !password) {
      return res.status(400).send("Kindly provide complete information.");
    }

    const existingUser = await Admin.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: "The email is already registered go to login!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new Admin({
      name,
      contact_number,
      email,
      password: hashedPassword,
      role: "Admin"
    });
    await user.save();
    res
      .status(200)
      .send({ success: true, message: "Admin Register Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.post("/register/Staff", AdminJoiSchema, async (req, res) => {
  try {
    const { name, contact_number, email, password } = req.body;
    if (!name || !contact_number || !email || !password) {
      return res.status(400).send("Kindly provide complete information.");
    }

    const existingUser = await Staff.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: "The email is already registered go to login!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new Staff({
      name,
      contact_number,
      email,
      password: hashedPassword,
      role: "Staff"
    });
    await user.save();
    res
      .status(200)
      .send({ success: true, message: "Admin Register Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res
        .status(400)
        .send({ success: false, message: "Kindly provide an Email" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ success: false, message: "Kindly provide a Password" });
    }

    const user = await Admin.findOne({ email: req.body.email });
    if (user) {
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(400).send({
          success: false,
          message: "Maybe your Email or Password is not correct!",
        });
      }
  
      const token = JWT.sign({ userId: user._id }, process.env.JWT_SEC_ADMIN);
  
      return res.status(200).send({
        success: true,
        message: "Admin login successfully",
        token,
        user,
      });
    }
    const anotherUser = await Client.findOne({ email: req.body.email });
    if (anotherUser) {
      const validPassword = await bcrypt.compare(
        req.body.password,
        anotherUser.password
        );
        if (!validPassword) {
          return res.status(400).send({
            success: false,
            message: "Maybe your Email or Password is not correct!",
        });
      }
  
      const token = JWT.sign({ userId: anotherUser._id }, process.env.JWT_SEC_CLIENT);
  
      return res.status(200).send({
        success: true,
        message: "Client login successfully",
        token,
        anotherUser,
      });   
    }
    const lastuser = await Staff.findOne({ email: req.body.email });
    if (lastuser) {
      const validPassword = await bcrypt.compare(
        req.body.password,
        lastuser.password
        );
        if (!validPassword) {
          return res.status(400).send({
            success: false,
            message: "Maybe your Email or Password is not correct!",
        });
      }
  
      const token = JWT.sign({ userId: lastuser._id }, process.env.JWT_SEC_STAFF);
  
      return res.status(200).send({
        success: true,
        message: "Staff login successfully",
        token,
        lastuser,
      });   
    }
    res
      .status(400)
      .send({ success: false, message: "You Are Not Registered !" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/find/client", async (req, res) => {
  try {
    const allUser = await Client.find();
      if (!allUser.length > 0) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Client Found" });
    }
    res.status(200).send({ success: true, allUser });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/find/admin", async (req, res) => {
  try {
    const allUser = await Admin.find();
    if (!allUser.length > 0) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Admin Found" });
    }
    res.status(200).send({ success: true, allUser });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/find/staff", async (req, res) => {
  try {
    const allUser = await Staff.find();
    if (!allUser.length > 0) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Staff Found" });
    }
    res.status(200).send({ success: true, allUser });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});



module.exports = router;
