const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Joi = require('joi');
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

  const buildSessionRecord = (id, timestamps, payload) => {
    const base = {
      id,
      ...timestamps,
      sessionName: payload.sessionName,
      description: payload.description,
      price: payload.price,
    };

    return {
      ...base,
      // Backward-compatible keys for existing UI consumers.
      sectionTitle: payload.sessionName,
      sectionType: "offer",
      introText: payload.description,
      ctaLabel: payload.price,
      ctaUrl: "",
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

let customSections = [];

app.get("/api/custom-sections", (req, res) => {
  return res.status(200).json(customSections);
});

app.get("/api/packages", (req, res) => {
    res.send(packages);
});

app.get("/api/packages/:id", (req, res) => {
    const requestedId = parseInt(req.params.id, 10);
    const foundPackage = packages.find((p) => p.id === requestedId);

    if (!foundPackage) {
      return res.status(404).json({ message: "Package not found." });
    }

    return res.send(foundPackage);
});

app.post("/api/custom-sections", upload.none(), (req, res) => {
  const { errors, sanitizedPayload } = validateCustomSessionPayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed.",
      errors,
    });
  }

  const createdSection = buildSessionRecord(
    customSections.length + 1,
    { createdAt: new Date().toISOString() },
    sanitizedPayload
  );

  customSections = [createdSection, ...customSections];

  return res.status(200).json(createdSection);
});

app.put("/api/custom-sections/:id", upload.none(), (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const sectionIndex = customSections.findIndex((s) => s.id === requestedId);

  if (sectionIndex === -1) {
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
    customSections[sectionIndex].id,
    {
      createdAt: customSections[sectionIndex].createdAt,
      updatedAt: new Date().toISOString(),
    },
    sanitizedPayload
  );

  customSections[sectionIndex] = updatedSection;

  return res.status(200).json(updatedSection);
});

app.delete("/api/custom-sections/:id", (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const sectionIndex = customSections.findIndex((s) => s.id === requestedId);

  if (sectionIndex === -1) {
    return res.status(404).json({ message: "Custom section not found." });
  }

  const [deletedSection] = customSections.splice(sectionIndex, 1);
  return res.status(200).json({
    message: "Custom section deleted.",
    deletedSection,
    customSections,
  });
});

let bookings = [];

let nextBookingId = 1;

const bookingSchema = Joi.object({
  sessionType: Joi.string().trim().required().messages({
    "string.empty": "Please select a session type.",
    "any.required": "Please select a session type.",
  }),
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
  const validationResult = bookingSchema.validate(body || {}, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: validationResult.error ? formatJoiErrors(validationResult.error.details) : {},
    sanitizedPayload: validationResult.value || {},
  };
};

app.get("/api/bookings", (req, res) => {
  return res.status(200).json({ bookings });
});

app.post("/api/bookings", (req, res) => {
  const { errors, sanitizedPayload } = validateBookingPayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const booking = {
    id: nextBookingId,
    ...sanitizedPayload,
    createdAt: new Date().toISOString(),
  };

  nextBookingId += 1;

  bookings.push(booking);

  return res.status(201).json({ message: "Booking request received.", booking });
});

app.put("/api/bookings/:id", (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const bookingIndex = bookings.findIndex((booking) => booking.id === requestedId);

  if (bookingIndex === -1) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const { errors, sanitizedPayload } = validateBookingPayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const updatedBooking = {
    ...bookings[bookingIndex],
    ...sanitizedPayload,
    id: bookings[bookingIndex].id,
    updatedAt: new Date().toISOString(),
  };

  bookings[bookingIndex] = updatedBooking;

  return res.status(200).json({ message: "Booking updated successfully.", booking: updatedBooking });
});

app.delete("/api/bookings/:id", (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const bookingIndex = bookings.findIndex((booking) => booking.id === requestedId);

  if (bookingIndex === -1) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const [deletedBooking] = bookings.splice(bookingIndex, 1);

  return res.status(200).json({
    message: "Booking deleted successfully.",
    booking: deletedBooking,
  });
});

//listen for incoming requests
app.listen(3001, () => {
    //console.log('Server is running on port 3001');
});