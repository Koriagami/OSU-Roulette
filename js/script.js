const wheel = document.getElementById("wheel");
const segments = 8;
let options = ["Car", "Bike", "TV", "Phone", "Watch", "Trip", "Voucher", "Laptop"];
const availableMods = ["EZ", "NF", "HT", "HR", "SD", "PF", "DT", "NC", "HD"];

let currentOptions = [...options];
let drawnSegments = new Set();
let selectedMods = new Map(); // Track selected mods for each option

const removeDrawnCheckbox = document.getElementById("removeDrawnCheckbox");
const configBtn = document.getElementById("configBtn");
const configPopup = document.getElementById("configPopup");
const closeBtn = document.querySelector(".close-btn");
const optionsContainer = document.getElementById("optionsContainer");
const addOptionBtn = document.getElementById("addOptionBtn");

// Initialize options list
function initializeOptionsList() {
  optionsContainer.innerHTML = "";
  options.forEach((option, index) => {
    createOptionInput(option, index);
  });
}

function createModDropdowns(optionIndex) {
  const modsContainer = document.createElement("div");
  modsContainer.className = "mods-container";

  // Initialize selected mods for this option if not exists
  if (!selectedMods.has(optionIndex)) {
    selectedMods.set(optionIndex, new Set());
  }

  const selectedModsForOption = selectedMods.get(optionIndex);
  let visibleDropdowns = 0;

  // Create all mod dropdowns but only show the first one
  availableMods.forEach((mod, i) => {
    const select = document.createElement("select");
    select.className = "mod-select";
    select.required = true;

    // Add placeholder option
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Mod";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.hidden = true;
    select.appendChild(placeholderOption);

    // Add available mods
    availableMods.forEach((m) => {
      const option = document.createElement("option");
      option.value = m;
      option.textContent = m;
      option.disabled = selectedModsForOption.has(m) && !select.value;
      select.appendChild(option);
    });

    // Add Remove option to all dropdowns
    const removeOption = document.createElement("option");
    removeOption.value = "Remove";
    removeOption.textContent = "Remove";
    select.appendChild(removeOption);

    // If this mod was previously selected, show and set the value
    if (selectedModsForOption.has(mod)) {
      select.value = mod;
      select.style.display = "block";
      visibleDropdowns++;
    } else if (visibleDropdowns === selectedModsForOption.size && visibleDropdowns === i) {
      // Show only the first available dropdown
      select.style.display = "block";
    } else {
      select.style.display = "none";
    }

    // Handle mod selection
    select.addEventListener("change", () => {
      if (!select.value) return;

      const visibleSelects = Array.from(modsContainer.querySelectorAll("select")).filter((s) => s.style.display !== "none");
      const isLastVisibleDropdown = visibleSelects.length === 1 && visibleSelects[0] === select;

      // Handle mod removal
      if (select.value === "Remove") {
        // Remove the previously selected mod
        if (select.dataset.previousValue) {
          selectedModsForOption.delete(select.dataset.previousValue);
        }

        if (isLastVisibleDropdown) {
          // For the last visible dropdown, reset to default state
          select.value = "";
          select.dataset.previousValue = "";
          // Keep the dropdown visible but in default state
          select.style.display = "block";
        } else {
          // For other dropdowns, hide them
          select.style.display = "none";
          select.value = "";
          select.dataset.previousValue = "";
        }
      }
      // Handle mod selection
      else {
        // Remove the previously selected mod if it exists
        if (select.dataset.previousValue) {
          selectedModsForOption.delete(select.dataset.previousValue);
        }

        // Add the new selected mod
        selectedModsForOption.add(select.value);
        select.dataset.previousValue = select.value;

        // Show the next dropdown if there is one
        const nextSelect = select.nextElementSibling;
        if (nextSelect) {
          nextSelect.style.display = "block";
        }
      }

      // Update the selected mods map
      selectedMods.set(optionIndex, selectedModsForOption);

      // Update disabled states in all dropdowns
      updateDropdownStates(modsContainer, selectedModsForOption);

      // Update the wheel to show the selected mods
      createWheel();
    });

    modsContainer.appendChild(select);
  });

  // Initial update of dropdown states
  updateDropdownStates(modsContainer, selectedModsForOption);

  return modsContainer;
}

// Helper function to update dropdown states
function updateDropdownStates(modsContainer, selectedModsForOption) {
  const allSelects = modsContainer.querySelectorAll("select");
  const visibleSelects = Array.from(allSelects).filter((s) => s.style.display !== "none");

  // Get all currently selected mods
  const currentlySelectedMods = new Set();
  visibleSelects.forEach((s) => {
    if (s.value && s.value !== "Remove") {
      currentlySelectedMods.add(s.value);
    }
  });

  allSelects.forEach((s) => {
    Array.from(s.options).forEach((opt) => {
      if (opt.value === "Remove") {
        // Never disable the Remove option
        opt.disabled = false;
      } else if (opt.value) {
        // Only disable mods that are currently selected in other visible dropdowns
        opt.disabled = currentlySelectedMods.has(opt.value) && s.value !== opt.value;
      }
    });
  });
}

function createOptionInput(value, index) {
  const optionDiv = document.createElement("div");
  optionDiv.className = "option-input";

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';

  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.placeholder = "Enter option text";

  const modsContainer = createModDropdowns(index);

  optionDiv.appendChild(deleteBtn);
  optionDiv.appendChild(input);
  optionDiv.appendChild(modsContainer);
  optionsContainer.appendChild(optionDiv);

  // Update option text when input changes
  input.addEventListener("input", () => {
    options[index] = input.value;
    currentOptions = [...options];
    createWheel();
  });

  // Delete option when delete button is clicked
  deleteBtn.addEventListener("click", () => {
    if (options.length > 1) {
      // Remove the option and its mods
      options.splice(index, 1);
      selectedMods.delete(index);

      // Reindex the remaining mods
      const newSelectedMods = new Map();
      selectedMods.forEach((mods, oldIndex) => {
        if (oldIndex > index) {
          newSelectedMods.set(oldIndex - 1, mods);
        } else if (oldIndex < index) {
          newSelectedMods.set(oldIndex, mods);
        }
      });
      selectedMods = newSelectedMods;

      currentOptions = [...options];
      initializeOptionsList();
      createWheel();
    }
  });
}

// Add new option
addOptionBtn.addEventListener("click", () => {
  options.push("New Option");
  currentOptions = [...options];
  initializeOptionsList();
  createWheel();
});

// Configuration pop-up handlers
configBtn.addEventListener("click", () => {
  configPopup.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
  configPopup.style.display = "none";
});

configPopup.addEventListener("click", (e) => {
  if (e.target === configPopup) {
    configPopup.style.display = "none";
  }
});

// Function to reset the wheel
function resetWheel() {
  currentOptions = [...options];
  drawnSegments.clear();
  createWheel();
}

// Function to remove a drawn segment
function removeDrawnSegment(segmentIndex) {
  if (currentOptions.length <= 1) return; // Don't remove if only one segment left

  drawnSegments.add(segmentIndex);
  currentOptions = options.filter((_, index) => !drawnSegments.has(index));
  createWheel();
}

// Function to create the wheel
function createWheel() {
  // Clear existing wheel
  while (wheel.firstChild) {
    wheel.removeChild(wheel.firstChild);
  }

  const size = 960;
  const radius = size / 2;
  const currentSegments = currentOptions.length;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.style.borderRadius = "50%";
  svg.style.overflow = "visible";
  svg.style.position = "absolute";

  // Create pizza-style segments
  for (let i = 0; i < currentSegments; i++) {
    const startAngle = (360 / currentSegments) * i;
    const endAngle = startAngle + 360 / currentSegments;

    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * endAngle;

    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);

    const path = document.createElementNS(svgNS, "path");
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const d = [`M ${radius} ${radius}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, "Z"].join(" ");

    path.setAttribute("d", d);
    path.setAttribute("fill", "transparent");
    path.setAttribute("stroke", "#411c2b");
    path.setAttribute("stroke-width", "6");

    svg.appendChild(path);

    // Add text to each segment
    const text = document.createElementNS(svgNS, "text");
    const textAngle = startAngle + 360 / (2 * currentSegments);
    const textRad = (Math.PI / 180) * textAngle;
    const textX = radius + radius * 0.6 * Math.cos(textRad);
    const textY = radius + radius * 0.6 * Math.sin(textRad);
    text.setAttribute("x", textX);
    text.setAttribute("y", textY);
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "28");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
    text.setAttribute("transform", `rotate(${textAngle}, ${textX}, ${textY})`);

    // Get the option text and its mods
    const optionText = currentOptions[i];
    const selectedModsForOption = selectedMods.get(i) || new Set();
    const modsText = selectedModsForOption.size > 0 ? ` [${Array.from(selectedModsForOption).join(", ")}]` : "";
    text.textContent = optionText + modsText;

    svg.appendChild(text);

    // Add white dot at the middle of each segment's border
    const whiteDotAngle = startAngle + 360 / (2 * currentSegments);
    const whiteDotRad = (Math.PI / 180) * whiteDotAngle;
    const whiteDotX = radius + radius * Math.cos(whiteDotRad);
    const whiteDotY = radius + radius * Math.sin(whiteDotRad);

    const whiteDot = document.createElementNS(svgNS, "circle");
    whiteDot.setAttribute("cx", whiteDotX);
    whiteDot.setAttribute("cy", whiteDotY);
    whiteDot.setAttribute("r", "2");
    whiteDot.setAttribute("fill", "white");
    whiteDot.setAttribute("class", "white-dot");
    whiteDot.setAttribute("data-segment", i);

    svg.appendChild(whiteDot);
  }

  // Add a full circle for the single segment case
  if (currentSegments === 1) {
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", radius);
    circle.setAttribute("cy", radius);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke", "#411c2b");
    circle.setAttribute("stroke-width", "6");
    svg.insertBefore(circle, svg.firstChild);
  }

  wheel.appendChild(svg);
}

// Initialize the wheel
createWheel();

// Initialize the options list
initializeOptionsList();

// Reset state to default (no mods selected)
selectedMods = new Map();
options.forEach((_, index) => {
  selectedMods.set(index, new Set());
});

// Handle checkbox changes
removeDrawnCheckbox.addEventListener("change", (e) => {
  if (e.target.checked) {
    // Keep current state
  } else {
    resetWheel();
  }
});

// Spin logic
let isSpinning = false;
let currentRotation = 0;

document.getElementById("drawBtn").addEventListener("click", async () => {
  if (isSpinning) return;
  isSpinning = true;

  // Calculate random spin amount (6-7 full rotations plus random angle)
  const fullRotations = 6 + Math.random();
  const randomAngle = Math.random() * 360;
  const spinRotation = 360 * fullRotations + randomAngle;
  currentRotation += spinRotation;

  wheel.style.transition = "transform 4s cubic-bezier(0.33, 1, 0.68, 1)";
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(async () => {
    // Get the marker's position
    const marker = document.querySelector(".marker");
    const markerRect = marker.getBoundingClientRect();
    const markerX = markerRect.left + markerRect.width / 2;
    const markerY = markerRect.top + markerRect.height / 2;

    // Find the white dot closest to the marker
    const whiteDots = document.querySelectorAll(".white-dot");
    let closestDot = null;
    let minDistance = Infinity;
    let selectedIndex = -1;

    whiteDots.forEach((dot, index) => {
      const dotRect = dot.getBoundingClientRect();
      const dotX = dotRect.left + dotRect.width / 2;
      const dotY = dotRect.top + dotRect.height / 2;

      const dx = dotX - markerX;
      const dy = dotY - markerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        closestDot = dot;
        selectedIndex = index;
      }
    });

    // Get the prize for the closest dot
    const prize = currentOptions[selectedIndex];
    const imageUrl = await fetchPrizeImage(prize);

    // Highlight the closest white dot
    if (closestDot) {
      closestDot.setAttribute("r", "20");
      closestDot.style.transition = "r 0.3s ease-out";

      // Reset the dot size after 2 seconds
      setTimeout(() => {
        closestDot.setAttribute("r", "2");
      }, 2000);
    }

    // Remove the drawn segment if the checkbox is checked
    if (removeDrawnCheckbox.checked) {
      const originalIndex = options.indexOf(prize);
      removeDrawnSegment(originalIndex);
    }

    showConfetti();
    document.getElementById("popup").innerHTML = `
      <h2>🎉 You won: ${prize} 🎉</h2>
      <img src="${imageUrl}" alt="${prize}" />
    `;
    document.getElementById("popup").style.display = "flex";

    isSpinning = false;
  }, 4000);
});

// Simulated API call
async function fetchPrizeImage(prizeName) {
  const prizeImages = {
    Car: "https://via.placeholder.com/300x200?text=Car",
    Bike: "https://via.placeholder.com/300x200?text=Bike",
    TV: "https://via.placeholder.com/300x200?text=TV",
    Phone: "https://via.placeholder.com/300x200?text=Phone",
    Watch: "https://via.placeholder.com/300x200?text=Watch",
    Trip: "https://via.placeholder.com/300x200?text=Trip",
    Voucher: "https://via.placeholder.com/300x200?text=Voucher",
    Laptop: "https://via.placeholder.com/300x200?text=Laptop",
  };
  return new Promise((resolve) => {
    setTimeout(() => resolve(prizeImages[prizeName]), 500);
  });
}

// Close popup on click
document.getElementById("popup").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none";
});

// Confetti animation
function showConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Create confetti from the center
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.5, y: 0.5 },
    });

    // Create confetti from the left
    confetti({
      ...defaults,
      particleCount: particleCount / 2,
      origin: { x: 0.2, y: 0.5 },
      angle: randomInRange(45, 135),
    });

    // Create confetti from the right
    confetti({
      ...defaults,
      particleCount: particleCount / 2,
      origin: { x: 0.8, y: 0.5 },
      angle: randomInRange(225, 315),
    });
  }, 250);
}

// Load state when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeOptionsList();
  createWheel();
});
