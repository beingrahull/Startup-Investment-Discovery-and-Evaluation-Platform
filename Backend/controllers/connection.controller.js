const Connection = require("../models/connection.model");
const Ask = require("../models/ask.model");

module.exports.createConnection = async function (req, res, next) {
  try {
    const { ask: askId, message } = req.body;

    const ask = await Ask.findById(askId);
    if (!ask) {
      return res.status(404).json({ success: false, message: "Ask not found" });
    }

    if (ask.founder.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect to your own ask",
      });
    }

    const connection = await Connection.create({
      investor: req.user.id,
      ask: ask._id,
      founder: ask.founder,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Connection request sent",
      connection,
    });
  } catch (err) {
    next(err);
  }
};


module.exports.listMyConnections = async function (req, res, next) {
  try {
    const query =
      req.user.role === "investor"
        ? { investor: req.user.id }
        : { founder: req.user.id };

    const connections = await Connection.find(query)
      .sort({ createdAt: -1 })
      .populate("ask", "startupName tagline industry stage fundingGoal")
      .populate("investor", "name email profile.investorType profile.investmentRange")
      .populate("founder", "name email profile.companyName");

    return res.status(200).json({
      success: true,
      count: connections.length,
      connections,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.updateConnectionStatus = async function (req, res, next) {
  try {
    const { status } = req.body;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(422).json({
        success: false,
        message: "Status must be accepted or declined",
      });
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection not found" });
    }

    // ownership check — only the founder of this ask can respond
    if (connection.founder.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    connection.status = status;
    await connection.save();

    return res.status(200).json({
      success: true,
      message: `Connection ${status}`,
      connection,
    });
  } catch (err) {
    next(err);
  }
};