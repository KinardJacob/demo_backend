require("dotenv").config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Joi = require('joi');
const { default: mongoose } = require('mongoose');
const app = express();
app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

  mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

  const customSectionSchema = new mongoose.Schema({
    sessionName: String,
    description: String,
    price: String,
    image: String,
    sectionTitle: String,
    sectionType: String,
    introText: String,
    ctaLabel: String,
    ctaUrl: String,
    createdAt: Date,
    updatedAt: Date,
  });

  const bookingDataSchema = new mongoose.Schema({
    sessionType: String,
    sessionImage: String,
    sessionSource: String,
    preferredDate: String,
    name: String,
    email: String,
    phone: String,
    details: String,
    createdAt: Date,
    updatedAt: Date,
  });

  const packageSchema = new mongoose.Schema({
    id: Number,
    image: String,
    title: String,
    type: String,
    duration: String,
    location: String,
    price: String,
    description: String,
    createdAt: Date,
    updatedAt: Date,
  });

  const CustomSection = mongoose.model("CustomSection", customSectionSchema);
  const Booking = mongoose.model("Booking", bookingDataSchema);
  const Package = mongoose.model("Package", packageSchema);

  const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

  const normalizePrice = (value) => {
    const rawPrice = normalizeString(value);
    const numericCandidate = rawPrice.replace("$", "");
    const numericValue = Number(numericCandidate);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return { isValid: false, normalized: rawPrice };
    }

    return {
      isValid: true,
      normalized: rawPrice.startsWith("$") ? rawPrice : `$${numericValue}`,
    };
  };

  const buildImagePath = (filename) => {
    if (!filename) {
      return "";
    }

    return `images/${encodeURIComponent(filename)}`;
  };

  const buildSessionRecord = (id, timestamps, payload) => {
    const base = {
      id,
      ...timestamps,
      sessionName: payload.sessionName,
      description: payload.description,
      price: payload.price,
      image: payload.image || "",
    };

    return {
      ...base,
      // Backward-compatible keys for existing UI consumers.
      sectionTitle: payload.sessionName,
      sectionType: "offer",
      introText: payload.description,
      ctaLabel: payload.price,
      ctaUrl: payload.image || "",
    };
  };

  const validateCustomSessionPayload = (payload) => {
    const errors = {};

    const sessionName = normalizeString(payload.sessionName || payload.sectionTitle);
    const description = normalizeString(payload.description || payload.introText);
    const submittedPrice = normalizeString(payload.price || payload.ctaLabel);
    const normalizedPrice = normalizePrice(submittedPrice);

    if (!sessionName) {
      errors.sessionName = "Session name is required.";
      errors.sectionTitle = "Session name is required.";
    } else if (sessionName.length < 3 || sessionName.length > 60) {
      errors.sessionName = "Name must be between 3 and 60 characters.";
      errors.sectionTitle = "Name must be between 3 and 60 characters.";
    }

    if (!description) {
      errors.description = "Session description is required.";
      errors.introText = "Session description is required.";
    } else if (description.length < 20 || description.length > 260) {
      errors.description = "Description must be between 20 and 260 characters.";
      errors.introText = "Description must be between 20 and 260 characters.";
    }

    if (!submittedPrice) {
      errors.price = "Price is required.";
      errors.ctaLabel = "Price is required.";
    } else if (!normalizedPrice.isValid) {
      errors.price = "Price must be a positive number.";
      errors.ctaLabel = "Price must be a positive number.";
    }

    const sanitizedPayload = {
      sessionName,
      description,
      price: normalizedPrice.normalized,
    };

    return {
      errors,
      sanitizedPayload,
    };
  };

let packages = [
  {
    "id": 1,
    "image": "images/family%20of%20four%20laugh.png",
    "title": "Classic Family Session",
    "type": "Family",
    "duration": "60 minutes",
    "location": "Local Park or Home",
    "price": "$180",
    "description": "Perfect for updated portraits with natural posing guidance and a warm editing style."
  },
  {
    "id": 2,
    "image": "images/a%20cheerful%20family%20ph.png",
    "title": "Golden Hour Family",
    "type": "Family",
    "duration": "75 minutes",
    "location": "Outdoor Sunset Location",
    "price": "$240",
    "description": "A sunset-focused session designed for soft light, candid moments, and vibrant scenery."
  },
  {
    "id": 3,
    "image": "images/a%20graduation%20portrai.png",
    "title": "Graduation Portraits",
    "type": "Graduation",
    "duration": "45 minutes",
    "location": "Campus Area",
    "price": "$160",
    "description": "Celebrate your milestone with polished portraits around your favorite campus spots."
  },
  {
    "id": 4,
    "image": "images/a%20professional%20portr.png",
    "title": "Professional Headshots",
    "type": "Branding",
    "duration": "40 minutes",
    "location": "Studio or Office",
    "price": "$150",
    "description": "Clean and confident headshots ideal for LinkedIn, resumes, and personal branding."
  },
  {
    "id": 5,
    "image": "images/portrait-oriented%20im2.png",
    "title": "Engagement Mini Session",
    "type": "Couples",
    "duration": "50 minutes",
    "location": "City or Nature Spot",
    "price": "$190",
    "description": "A romantic short session with guided poses and detail shots for announcements."
  },
  {
    "id": 6,
    "image": "images/portrait-oriented%20im.png",
    "title": "Lifestyle Story Session",
    "type": "Lifestyle",
    "duration": "90 minutes",
    "location": "In-Home",
    "price": "$280",
    "description": "Document your real moments at home with a relaxed, story-driven approach."
  },
  {
    "id": 7,
    "image": "images/portrait-oriented%20im3.png",
    "title": "Senior Portrait Premium",
    "type": "Seniors",
    "duration": "90 minutes",
    "location": "Two Locations",
    "price": "$320",
    "description": "A full senior package with multiple looks, locations, and image variety."
  },
  {
    "id": 8,
    "image": "images/landscape-oriented%203i.png",
    "title": "Adventure Portrait Session",
    "type": "Creative",
    "duration": "120 minutes",
    "location": "Travel Destination",
    "price": "$400",
    "description": "For clients wanting dramatic landscapes and adventurous portrait storytelling."
  }
]

const packageValidationSchema = Joi.object({
  title: Joi.string().trim().min(2).max(80).required(),
  type: Joi.string().trim().min(2).max(40).required(),
  duration: Joi.string().trim().min(2).max(40).required(),
  location: Joi.string().trim().min(2).max(80).required(),
  price: Joi.string().trim().min(1).max(20).required(),
  description: Joi.string().trim().min(10).max(320).required(),
  image: Joi.string().trim().allow(""),
});

const ensureSeedPackages = async () => {
  const count = await Package.countDocuments();

  if (count === 0) {
    await Package.insertMany(
      packages.map((pkg) => ({
        ...pkg,
        createdAt: new Date().toISOString(),
      }))
    );
  }
};

const validatePackagePayload = (payload) => {
  const validationResult = packageValidationSchema.validate(payload || {}, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: validationResult.error ? formatJoiErrors(validationResult.error.details) : {},
    sanitizedPayload: validationResult.value || {},
  };
};

app.get("/api/custom-sections", async (req, res) => {
  const customSections = await CustomSection.find().sort({ createdAt: -1 });
  return res.status(200).json(customSections);
});

app.get("/api/packages", async (req, res) => {
    await ensureSeedPackages();
    const persistedPackages = await Package.find().sort({ id: 1 });
    return res.send(persistedPackages);
});

app.get("/api/packages/:id", async (req, res) => {
    const requestedId = parseInt(req.params.id, 10);
    const foundPackage = await Package.findOne({ id: requestedId });

    if (!foundPackage) {
      return res.status(404).json({ message: "Package not found." });
    }

    return res.send(foundPackage);
});

app.post("/api/packages", upload.none(), async (req, res) => {
  await ensureSeedPackages();

  const { errors, sanitizedPayload } = validatePackagePayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const currentMax = await Package.findOne().sort({ id: -1 }).select("id");
  const nextId = currentMax && Number.isFinite(currentMax.id) ? currentMax.id + 1 : 1;

  const createdPackage = new Package({
    id: nextId,
    ...sanitizedPayload,
    createdAt: new Date().toISOString(),
  });

  await createdPackage.save();

  return res.status(201).json(createdPackage);
});

app.get("/api/session-options", async (req, res) => {
  await ensureSeedPackages();
  const persistedPackages = await Package.find().sort({ id: 1 });
  const customSections = await CustomSection.find().sort({ createdAt: -1 });

  const packageOptions = persistedPackages.map((pkg) => ({
    id: `package-${pkg.id}`,
    source: "package",
    name: pkg.title,
    description: pkg.description,
    price: pkg.price,
    image: pkg.image || "",
  }));

  const customOptions = customSections.map((section) => ({
    id: `custom-${section._id}`,
    source: "custom",
    name: section.sessionName,
    description: section.description,
    price: section.price,
    image: section.image || section.ctaUrl || "",
  }));

  return res.status(200).json([...packageOptions, ...customOptions]);
});

app.post("/api/custom-sections", upload.single("img"), async (req, res) => {
  const { errors, sanitizedPayload } = validateCustomSessionPayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed.",
      errors,
    });
  }

  const createdSection = new CustomSection(
    buildSessionRecord(
      null,
      { createdAt: new Date().toISOString() },
      {
        ...sanitizedPayload,
        image: req.file ? buildImagePath(req.file.filename) : "",
      }
    )
  );

  await createdSection.save();

  return res.status(200).json(createdSection);
});

app.put("/api/custom-sections/:id", upload.single("img"), async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Custom section not found." });
  }

  const existingSection = await CustomSection.findById(req.params.id);

  if (!existingSection) {
    return res.status(404).json({ message: "Custom section not found." });
  }

  const { errors, sanitizedPayload } = validateCustomSessionPayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed.",
      errors,
    });
  }

  const updatedSection = buildSessionRecord(
    existingSection._id,
    {
      createdAt: existingSection.createdAt,
      updatedAt: new Date().toISOString(),
    },
    {
      ...sanitizedPayload,
      image: req.file ? buildImagePath(req.file.filename) : (existingSection.image || ""),
    }
  );

  const savedSection = await CustomSection.findByIdAndUpdate(req.params.id, updatedSection, {
    new: true,
  });

  return res.status(200).json(savedSection);
});

app.delete("/api/custom-sections/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Custom section not found." });
  }

  const deletedSection = await CustomSection.findByIdAndDelete(req.params.id);

  if (!deletedSection) {
    return res.status(404).json({ message: "Custom section not found." });
  }

  return res.status(200).json({
    message: "Custom section deleted.",
    deletedSection,
  });
});

const bookingValidationSchema = Joi.object({
  sessionType: Joi.string().trim().required().messages({
    "string.empty": "Please select a session type.",
    "any.required": "Please select a session type.",
  }),
  sessionImage: Joi.string().trim().allow(""),
  sessionSource: Joi.string().trim().valid("package", "custom").allow(""),
  preferredDate: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const selectedDate = new Date(value);
      if (Number.isNaN(selectedDate.getTime())) {
        return helpers.error("date.invalid");
      }

      selectedDate.setHours(0, 0, 0, 0);

      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const maxDate = new Date(tomorrow);
      maxDate.setFullYear(maxDate.getFullYear() + 1);

      if (selectedDate < tomorrow || selectedDate > maxDate) {
        return helpers.error("date.range");
      }

      return value;
    })
    .messages({
      "string.empty": "Please select a preferred date.",
      "any.required": "Please select a preferred date.",
      "date.invalid": "Please choose a valid date.",
      "date.range": "Date must be within the next year.",
    }),
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required.",
    "any.required": "Name is required.",
    "string.min": "Name must be between 2 and 50 characters.",
    "string.max": "Name must be between 2 and 50 characters.",
  }),
  email: Joi.string()
    .trim()
    .required()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .messages({
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
      "string.pattern.base": "Please enter a valid email address.",
    }),
  phone: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      if (!/^\+?[\d\s\-()]+$/.test(value) || value.replace(/\D/g, "").length < 10) {
        return helpers.error("phone.invalid");
      }

      return value;
    })
    .messages({
      "string.empty": "Phone number is required.",
      "any.required": "Phone number is required.",
      "phone.invalid": "Please enter a valid phone number.",
    }),
  details: Joi.string().trim().allow("").max(500).messages({
    "string.max": "Details must be 500 characters or less.",
  }),
});

const formatJoiErrors = (details = []) => {
  const errors = {};

  details.forEach((issue) => {
    const key = issue.path && issue.path.length > 0 ? issue.path[0] : "form";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  });

  return errors;
};

const validateBookingPayload = (body) => {
  const validationResult = bookingValidationSchema.validate(body || {}, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: validationResult.error ? formatJoiErrors(validationResult.error.details) : {},
    sanitizedPayload: validationResult.value || {},
  };
};

app.get("/api/bookings", async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  return res.status(200).json({ bookings });
});

app.post("/api/bookings", async (req, res) => {
  const { errors, sanitizedPayload } = validateBookingPayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const booking = new Booking({
    ...sanitizedPayload,
    createdAt: new Date().toISOString(),
  });

  await booking.save();

  return res.status(201).json({ message: "Booking request received.", booking });
});

app.put("/api/bookings/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const existingBooking = await Booking.findById(req.params.id);

  if (!existingBooking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const { errors, sanitizedPayload } = validateBookingPayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, {
    ...existingBooking.toObject(),
    ...sanitizedPayload,
    updatedAt: new Date().toISOString(),
  }, { new: true });

  return res.status(200).json({ message: "Booking updated successfully.", booking: updatedBooking });
});

app.delete("/api/bookings/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

  if (!deletedBooking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  return res.status(200).json({
    message: "Booking deleted successfully.",
    booking: deletedBooking,
  });
});

//listen for incoming requests
const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is up and running on ${port}`);
});