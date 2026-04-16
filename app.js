const express = require('express');
const cors = require('cors');
const multer = require('multer');
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

  const ALLOWED_SECTION_TYPES = ["info", "feature", "testimonial", "offer"];

  const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

  const validateCustomSectionPayload = (payload) => {
    const errors = {};

    const sectionTitle = normalizeString(payload.sectionTitle);
    const sectionType = normalizeString(payload.sectionType).toLowerCase();
    const introText = normalizeString(payload.introText);
    const ctaLabel = normalizeString(payload.ctaLabel);
    const ctaUrl = normalizeString(payload.ctaUrl);

    if (!sectionTitle) {
      errors.sectionTitle = "Section title is required.";
    } else if (sectionTitle.length < 3 || sectionTitle.length > 60) {
      errors.sectionTitle = "Title must be between 3 and 60 characters.";
    }

    if (!sectionType) {
      errors.sectionType = "Section type is required.";
    } else if (!ALLOWED_SECTION_TYPES.includes(sectionType)) {
      errors.sectionType = `Section type must be one of: ${ALLOWED_SECTION_TYPES.join(", ")}.`;
    }

    if (!introText) {
      errors.introText = "Intro text is required.";
    } else if (introText.length < 20 || introText.length > 260) {
      errors.introText = "Intro text must be between 20 and 260 characters.";
    }

    if (ctaLabel.length > 30) {
      errors.ctaLabel = "CTA label must be 30 characters or less.";
    }

    if (ctaUrl) {
      const allowedProtocols = /^https?:\/\//i;
      if (!allowedProtocols.test(ctaUrl)) {
        errors.ctaUrl = "CTA URL must start with http:// or https://.";
      }
    }

    const sanitizedPayload = {
      sectionTitle,
      sectionType,
      introText,
      ctaLabel,
      ctaUrl,
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
  const { errors, sanitizedPayload } = validateCustomSectionPayload(req.body || {});

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed.",
      errors,
    });
  }

  const createdSection = {
    id: customSections.length + 1,
    createdAt: new Date().toISOString(),
    ...sanitizedPayload,
  };

  customSections = [createdSection, ...customSections];

  return res.status(200).json(createdSection);
});

//listen for incoming requests
app.listen(3001, () => {
    //console.log('Server is running on port 3001');
});