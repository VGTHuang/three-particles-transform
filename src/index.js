import { startScene, transformModel } from "./scene.js";

var modelUrlList = [
    "/models/heracles.txt",
    "/models/gaul.txt",
    "/models/baronesse.txt",
];

var modelInfo = [
    {
        name: "Herakles",
        museum: "Nye Carlsberg Glyptotek",
    },
    {
        name: "Dying Gaul",
        museum: "Musei Capitolini",
    },
    {
        name: "Baronesse Sipiere",
        museum: "Ny Carlsberg Glyptotek",
    },
];

var selectedModelIndex = 0;

var modelInfoEls = [];

var plaqueContainerEl = document.getElementById("plaque-container");

modelInfo.forEach((model) => {
    var el = document.createElement("div");
    el.setAttribute("class", "model-info");

    var nameEl = document.createElement("div");
    nameEl.setAttribute("class", "model-name");
    nameEl.innerHTML = model.name;

    var museumEl = document.createElement("div");
    museumEl.setAttribute("class", "model-museum");
    museumEl.innerHTML = model.museum;

    el.appendChild(nameEl);
    el.appendChild(museumEl);
    modelInfoEls.push(el);
    plaqueContainerEl.appendChild(el);
});

modelInfoEls[0].classList.add("model-info-open");

window.addEventListener("wheel", windowWheel);
window.addEventListener("touchstart", windowTouchStart);
window.addEventListener("touchmove", windowTouchMove);
window.addEventListener("touchend", windowTouchEnd);

var lastScrollTimestamp = 0;

function windowWheel(event) {
    var time = new Date().getTime();
    if (time - lastScrollTimestamp < 500) {
        return;
    }
    lastScrollTimestamp = time;
    var step = event.deltaY > 0 ? 1 : -1;
    transformByStep(step);
}

var touchStartX, touchStartY;
var touchEndX, touchEndY;

function windowTouchStart(event) {
    touchStartX = event.targetTouches[0].pageX;
    touchStartY = event.targetTouches[0].pageY;
}

function windowTouchMove(event) {
    if (event.targetTouches.length > 1 || (event.scale && event.scale !== 1)) {
        return;
    }
    var touch = event.targetTouches[0];
    touchEndX = touch.pageX - touchStartX;
    touchEndY = touch.pageY - touchStartY;
    var isScrolling = Math.abs(touchEndX) < Math.abs(touchEndY) ? 1 : 0;
    if (isScrolling === 0) {
        event.preventDefault();
    }
}

function windowTouchEnd(val) {
    var time = new Date().getTime();
    if (time - lastScrollTimestamp < 500) {
        return;
    }
    lastScrollTimestamp = time;
    if (Math.abs(touchEndY) > Math.abs(touchEndX)) {
        if (Math.abs(touchEndY) > 50) {
            var step = touchEndY > 0 ? 1 : -1;
            transformByStep(step);
        }
    }
}

function transformByStep(step) {
    transformModel(step);
    selectedModelIndex =
        (selectedModelIndex + step + modelUrlList.length) % modelUrlList.length;

    // selectedModelIndex: index of new displayed model

    modelInfoEls.forEach((el) => {
        el.classList.remove("model-info-open");
    });
    modelInfoEls[selectedModelIndex].classList.add("model-info-open");
}

startScene(modelUrlList);
