import { startScene, transformModel } from "./scene.js";

var modelUrlList = [
    "/dist/models/heracles.txt",
    "/dist/models/gaul.txt",
    "/dist/models/baronesse.txt"
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

function windowWheel(val) {
    var step = val.deltaY > 0 ? 1 : -1;
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