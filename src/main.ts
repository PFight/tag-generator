import { getLastGeneration, saveLastGeneration } from "firebase";
import { Generation } from "interfaces";
import { protectGeneration } from "protection";
import { generate } from "./generate";
import "./main.css";

const START_PARAM = "start";
const COUNT_PARAM = "count";
const TEMPLATE_PARAM = "template";

async function generateClick() {
    document.querySelector<HTMLButtonElement>("#generate")!.disabled = true;
    let template = document.querySelector<HTMLInputElement>("#template")?.value || "#female-male";
    let start = parseInt(document.querySelector<HTMLInputElement>("#start")?.value  || "0");
    let count = parseInt(document.querySelector<HTMLInputElement>("#count")?.value || "12");
    let generation = {
        start,
        end: start + count - 1,
        template
    };
    try {
        protectGeneration(count);        
        await saveLastGeneration(generation);
        window.open(location.pathname + `?${START_PARAM}=${start}&${COUNT_PARAM}=${count}&${TEMPLATE_PARAM}=${encodeURIComponent(template)}`);
    } catch (err) {
        alert(err.message);
    }
    document.querySelector<HTMLInputElement>("#start")!.value = (generation.end + 1).toString();
    document.querySelector<HTMLButtonElement>("#generate")!.disabled = false;
}

function initFormHandlers() {
    document.querySelector("#generate")?.addEventListener("click", generateClick);
}

function processQueryParametes() {
    const urlParams = new URLSearchParams(window.location.search);
    const start = urlParams.get(START_PARAM);
    const count = urlParams.get(COUNT_PARAM);
    const template = urlParams.get(TEMPLATE_PARAM);
    if (start && count && template) {
        generate(template, parseInt(start), parseInt(count));
        return true;
    } else {
        return false;
    }
}


async function loadLatestGeneration() {
    document.querySelector<HTMLElement>("#settings")!.style.display = "none";
    let lastGeneration: Generation;
    try {
        lastGeneration = await getLastGeneration();
    } catch (err) {
        alert(err.message);
        return;
    }
    document.querySelector<HTMLInputElement>("#start")!.value = (lastGeneration.end + 1).toString();
    document.querySelector<HTMLElement>("#settings")!.style.display = "";
    document.querySelector<HTMLElement>("#loading")!.style.display = "none";
}

async function onOpen() {
    let parametersExists = processQueryParametes();
    if (!parametersExists) {
        await loadLatestGeneration();
        initFormHandlers();
    }
}

onOpen();