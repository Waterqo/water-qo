const router = require("express").Router();

const {
  verifyAdmin,
  verifyClient,
  verifyStaff,
} = require("../middlewares/verify");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const Admin = require("../models/admin");
const InvManager = require("../models/inventerymanage");
const Staff = require("../models/staff");
const Client = require("../models/clientSchema");
const {
  AdminJoiSchema,
  StaffJoiSchema,
  ClientJoiSchme,
} = require("../helper/joi/joiSchema");

router.post("/register/client", ClientJoiSchme, async (req, res) => {
  try {
    const { name, contact_number, email, password, waterPlant } = req.body;
    if (!name || !contact_number || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Kindly provide complete information.",
      });
    }

    const existingUser = await Client.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered go to login!",
      });
    }
    const existingUserAdmin = await Admin.findOne({ email: req.body.email });
    if (existingUserAdmin) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered as Admin!",
      });
    }
    const existingUserStaff = await Staff.findOne({ email: req.body.email });
    if (existingUserStaff) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered as Staff!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new Client({
      name,
      contact_number,
      email,
      password: hashedPassword,
      waterPlant,
      role: "Client",
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
      return res.status(400).send({
        success: false,
        message: "Kindly provide complete information.",
      });
    }

    const existingUser = await Client.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered Client!",
      });
    }
    const existingUserAdmin = await Admin.findOne({ email: req.body.email });
    if (existingUserAdmin) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered as Admin!",
      });
    }
    const existingUserStaff = await Staff.findOne({ email: req.body.email });
    if (existingUserStaff) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered as Staff!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new Admin({
      name,
      contact_number,
      email,
      password: hashedPassword,
      role: "Admin",
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

router.post("/register/Invmanager", AdminJoiSchema, async (req, res) => {
  try {
    const { name, contact_number, email, password } = req.body;
    if (!name || !contact_number || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Kindly provide complete information.",
      });
    }

    const existingUser = await Client.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered Client!",
      });
    }
    const existingUserAdmin = await Admin.findOne({ email: req.body.email });
    if (existingUserAdmin) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered as Admin!",
      });
    }
    const existingUserStaff = await Staff.findOne({ email: req.body.email });
    if (existingUserStaff) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered as Staff!",
      });
    }
    const existingUserManager = await InvManager.findOne({
      email: req.body.email,
    });
    if (existingUserStaff) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered as Staff!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new InvManager({
      name,
      contact_number,
      email,
      password: hashedPassword,
      role: "Inventory Manager",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Inventory Manager is Register Successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.post("/register/Staff", StaffJoiSchema, async (req, res) => {
  try {
    const { name, contact_number, username, password } = req.body;
    if (!name || !contact_number || !username || !password) {
      return res.status(400).send({
        success: false,
        message: "Kindly provide complete information.",
      });
    }

    const existingUserStaff = await Staff.findOne({
      username: req.body.username,
    });
    if (existingUserStaff) {
      return res.status(400).send({
        success: false,
        message: "The email is already registered as Staff!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new Staff({
      name,
      contact_number,
      username: username.toLowerCase(),
      password: hashedPassword,
      role: "Staff",
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
        data: user,
      });
    }
    const Invmanager = await InvManager.findOne({ email: req.body.email });
    if (Invmanager) {
      const validPassword = await bcrypt.compare(
        req.body.password,
        Invmanager.password
      );
      if (!validPassword) {
        return res.status(400).send({
          success: false,
          message: "Maybe your Email or Password is not correct!",
        });
      }

      const token = JWT.sign(
        { userId: Invmanager._id },
        process.env.JWT_SEC_INVMANAGER
      );

      return res.status(200).send({
        success: true,
        message: "Inventery Manager login successfully",
        token,
        data: Invmanager,
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

      const token = JWT.sign(
        { userId: anotherUser._id },
        process.env.JWT_SEC_CLIENT
      );

      return res.status(200).send({
        success: true,
        message: "Client login successfully",
        token,
        data: anotherUser,
      });
    }
    const lastuser = await Staff.findOne({
      username: req.body.email.toLowerCase(),
    });
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

      const token = JWT.sign(
        { userId: lastuser._id },
        process.env.JWT_SEC_STAFF
      );

      return res.status(200).send({
        success: true,
        message: "Staff login successfully",
        token,
        data: lastuser,
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    const total = await Client.countDocuments();

    const allUser = await Client.find().skip(skip).limit(limit).sort(sortBY);
    if (!allUser.length > 0) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Client Found" });
    }
    const totalPages = Math.ceil(total / limit);
    res
      .status(200)
      .send({ success: true, data: allUser, page, totalPages, limit, total });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/find/client/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Client.findById(userId);
    if (!user) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Client Found" });
    }
    res.status(200).send({ success: true, data: user });
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
    res.status(200).send({ success: true, data: allUser });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/find/manager", async (req, res) => {
  try {
    const allUser = await InvManager.find();
    if (!allUser.length > 0) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Admin Found" });
    }
    res.status(200).send({ success: true, data: allUser });
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
    res.status(200).send({ success: true, data: allUser });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.get("/find/staff/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Staff.findById(userId);
    if (!user) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Staff Found" });
    }
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.delete("/delete/staff/:Id", async (req, res) => {
  try {
    const userId = req.params.Id;
    const user = await Staff.findByIdAndDelete(userId);
    if (!user) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Staff Found" });
    }
    res
      .status(200)
      .send({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.delete("/delete/client/:Id", async (req, res) => {
  try {
    const userId = req.params.Id;
    const user = await Client.findByIdAndDelete(userId);
    if (!user) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Staff Found" });
    }
    res
      .status(200)
      .send({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.delete("/delete/Invmanager/:Id", async (req, res) => {
  try {
    const userId = req.params.Id;
    const user = await InvManager.findByIdAndDelete(userId);
    if (!user) {
      return res
        .status(400)
        .send({ seccess: false, message: "No Staff Found" });
    }
    res
      .status(200)
      .send({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.put("/update/client/:clientId", async (req, res) => {
  try {
    const userId = req.params.clientId;
    const { name, contact_number, email, waterPlant, password, deviceToken } =
      req.body;
    const user = await Client.findById(userId);

    user.name = name || user.name;
    user.contact_number = contact_number || user.contact_number;
    user.email = email || user.email;
    user.waterPlant = waterPlant || user.waterPlant;
    user.deviceToken = deviceToken || user.deviceToken;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).send({
      success: true,
      message: "Client Updated Successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.put("/update/admin/:adminId", async (req, res) => {
  try {
    const userId = req.params.adminId;
    const { name, contact_number, email, password, deviceToken } = req.body;
    const user = await Admin.findById(userId);

    user.name = name || user.name;
    user.contact_number = contact_number || user.contact_number;
    user.email = email || user.email;
    user.deviceToken = deviceToken || user.deviceToken;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).send({
      success: true,
      message: "Admin Updated Successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.put("/update/manager/:userId", async (req, res) => {
  try {
    const { name, contact_number, email, password, deviceToken } = req.body;
    const userId = req.params.userId;
    const user = await InvManager.findById(userId);

    user.name = name || user.name;
    user.contact_number = contact_number || user.contact_number;
    user.email = email || user.email;
    user.deviceToken = deviceToken || user.deviceToken;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).send({
      success: true,
      message: "Admin Updated Successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

router.put("/update/staff/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      contact_number,
      email,
      password,
      deviceToken,
      plant,
      lat,
      long,
    } = req.body;
    const user = await Staff.findById(userId);

    user.plant = plant || user.plant;
    user.name = name || user.name;
    user.contact_number = contact_number || user.contact_number;
    user.email = email || user.email;
    user.deviceToken = deviceToken || user.deviceToken;
    user.lat = lat || user.lat;
    user.long = long || user.long;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).send({
      success: true,
      message: "Staff Updated Successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

module.exports = router;
