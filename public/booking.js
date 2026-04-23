const form = document.getElementById("booking-form");
const optionSelect = document.getElementById("sessionType");
const previewImage = document.getElementById("preview-image");
const previewName = document.getElementById("preview-name");
const previewPrice = document.getElementById("preview-price");
const previewDescription = document.getElementById("preview-description");
const sessionImageInput = document.getElementById("sessionImage");
const sessionSourceInput = document.getElementById("sessionSource");
const formMessage = document.getElementById("form-message");

let sessionOptions = [];

const setMessage = (message, type) => {
  formMessage.textContent = message;
  formMessage.className = "form-message";

  if (type) {
    formMessage.classList.add(type);
  }
};

const normalizeImagePath = (path) => {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
};

const renderPreview = (optionId) => {
  const selected = sessionOptions.find((item) => item.id === optionId);

  if (!selected) {
    previewName.textContent = "No option selected";
    previewPrice.textContent = "";
    previewDescription.textContent = "";
    previewImage.hidden = true;
    previewImage.src = "";
    sessionImageInput.value = "";
    sessionSourceInput.value = "";
    return;
  }

  previewName.textContent = selected.name;
  previewPrice.textContent = selected.price || "";
  previewDescription.textContent = selected.description || "";

  const normalizedImage = normalizeImagePath(selected.image);
  sessionImageInput.value = selected.image || "";
  sessionSourceInput.value = selected.source || "";

  if (normalizedImage) {
    previewImage.src = normalizedImage;
    previewImage.hidden = false;
  } else {
    previewImage.hidden = true;
    previewImage.src = "";
  }
};

const buildOptionLabel = (item) => {
  const pricePart = item.price ? ` - ${item.price}` : "";
  const sourcePart = item.source === "custom" ? " (Custom)" : "";
  return `${item.name}${pricePart}${sourcePart}`;
};

const loadOptions = async () => {
  const response = await fetch("/api/session-options");

  if (!response.ok) {
    throw new Error("Unable to load session options.");
  }

  sessionOptions = await response.json();

  optionSelect.innerHTML = '<option value="">Select a session option</option>';

  sessionOptions.forEach((item) => {
    const optionElement = document.createElement("option");
    optionElement.value = item.id;
    optionElement.textContent = buildOptionLabel(item);
    optionSelect.appendChild(optionElement);
  });
};

optionSelect.addEventListener("change", (event) => {
  renderPreview(event.target.value);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("", null);

  const selectedId = optionSelect.value;
  const selected = sessionOptions.find((item) => item.id === selectedId);

  const payload = {
    sessionType: selected ? selected.name : "",
    sessionImage: sessionImageInput.value,
    sessionSource: sessionSourceInput.value,
    preferredDate: document.getElementById("preferredDate").value,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    details: document.getElementById("details").value,
  };

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Booking failed.", "error");
      return;
    }

    setMessage("Booking saved successfully.", "success");
    form.reset();
    renderPreview("");
  } catch (error) {
    setMessage("Unable to submit booking right now.", "error");
  }
});

(async () => {
  try {
    await loadOptions();
    renderPreview("");
  } catch (error) {
    setMessage("Could not load session options.", "error");
  }
})();
