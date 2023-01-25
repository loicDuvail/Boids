const minSpeedInput = document.getElementById("min-speed");
const maxSpeedInput = document.getElementById("max-speed");
const aligmenentInput = document.getElementById("alignement");
const alignementViewRangeInput = document.getElementById(
    "alignement-view-range"
);
const avoidBoidsInput = document.getElementById("avoid-boids");
const boidsViewRangeInput = document.getElementById("boids-view-range");
const avoidWallsInput = document.getElementById("avoid-walls");
const wallsViewRangeInput = document.getElementById("walls-view-range");

const boidsVisibilityCheckbox = document.getElementById(
    "boid-visibility-checkbox"
);
const trailsVisibilityCheckbox = document.getElementById(
    "trail-visibility-checkbox"
);

const settingsBtn = document.getElementById("settings-button");
const settingsContainer = document.getElementById("settings");

const settingsSvg = document.getElementById("settings-svg");
const closeSvg = document.getElementById("close-svg");

setInterval(() => {
    SETTINGS.minSpeed = minSpeedInput.value;
    SETTINGS.maxSpeed = maxSpeedInput.value;
    SETTINGS.alignement = aligmenentInput.value;
    SETTINGS.alignementViewRange = alignementViewRangeInput.value;
    SETTINGS.avoidOtherBoids = avoidBoidsInput.value;
    SETTINGS.boidsViewRange = boidsViewRangeInput.value;
    SETTINGS.avoidWalls = avoidWallsInput.value;
    SETTINGS.wallsViewRange = wallsViewRangeInput.value;
    SETTINGS.DRAW_BOID = boidsVisibilityCheckbox.checked;
    SETTINGS.DRAW_TRAIL = trailsVisibilityCheckbox.checked;
}, 13);

//show and hide settings on button click

let visibility = true;

settingsBtn.onclick = () => {
    visibility = !visibility;
    if (visibility) {
        settingsContainer.style.display = "flex";
        closeSvg.style.display = "block";
        settingsSvg.style.display = "none";
    } else {
        settingsContainer.style.display = "none";
        closeSvg.style.display = "none";
        settingsSvg.style.display = "block";
    }
};

//toggle on keyDown

let keysToCheckbox = {
    b: boidsVisibilityCheckbox,
    t: trailsVisibilityCheckbox,
};

document.onkeydown = (e) => {
    let checkbox = keysToCheckbox[e.code.replace("Key", "").toLowerCase()];
    if (checkbox) checkbox.checked = !checkbox.checked;
    if (e.code == "KeyS") settingsBtn.click();
};

// dynamic resize
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
