const Ask = require("../models/ask.model");

module.exports.createAsk = async function (req, res, next) {
  try {
    const payload = { ...req.body, founder: req.user.id };

    const ask = await Ask.create(payload);

    return res.status(201).json({
      success: true,
      message: "Ask created successfully",
      ask,
    });
  } catch (err) {
    next(err);
  }
};


module.exports.listAsks = async function (req, res, next) {
  try {
    const {
      industry,
      stage,
      q,
      minGoal,
      maxGoal,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { status: "published" };

    if (industry) filter.industry = industry;
    if (stage) filter.stage = stage;
    if (minGoal || maxGoal) {
      filter.fundingGoal = {};
      if (minGoal) filter.fundingGoal.$gte = Number(minGoal);
      if (maxGoal) filter.fundingGoal.$lte = Number(maxGoal);
    }
    if (q) {
      filter.$or = [
        { startupName: { $regex: q, $options: "i" } },
        { tagline: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [asks, total] = await Promise.all([
      Ask.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("founder", "name email profile.companyName profile.location"),
      Ask.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: asks.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      asks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getAsk = async function (req, res, next) {
  try {
    const ask = await Ask.findById(req.params.id).populate(
      "founder",
      "name email profile.companyName profile.location"
    );

    if (!ask) {
      return res.status(404).json({ success: false, message: "Ask not found" });
    }

    return res.status(200).json({ success: true, ask });
  } catch (err) {
    next(err);
  }
};

module.exports.listMyAsks = async function (req, res, next) {
  try {
    const asks = await Ask.find({ founder: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: asks.length,
      asks,
    });
  } catch (err) {
    next(err);
  }
};