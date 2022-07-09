import { getLastGeneration, saveLastGeneration } from "firebase";
import { Generation } from "interfaces";
import { protectGeneration } from "protection";
import { generate } from "./generate";
import "./main.css";

const START_PARAM = "start";
const COUNT_PARAM = "count";
const TEMPLATE_PARAM = "template";
const MAX_COUNT = 48;

async function generateClick() {
    //if (CurrentUser) {
        let template = document.querySelector<HTMLInputElement>("#template")?.value || "#female-male";
        let start = parseInt(document.querySelector<HTMLInputElement>("#start")?.value  || "0");
        let count = parseInt(document.querySelector<HTMLInputElement>("#count")?.value || "12");
        /*if (count > MAX_COUNT) {
            alert("Вы пытаетесь создать слишком много бирок. Обратитесь к администраторам.");
            return;
        }*/
        document.querySelector<HTMLButtonElement>("#generate")!.disabled = true;
        let generation = {
            start,
            end: start + count - 1,
            template,
            userId:'x',
            userName: 'x'
        };
        try {
            // protectGeneration(count);        
            await saveLastGeneration(generation);
            window.open(location.pathname + `?${START_PARAM}=${start}&${COUNT_PARAM}=${count}&${TEMPLATE_PARAM}=${encodeURIComponent(template)}`);
        } catch (err) {
            alert(err.message);
        }
        document.querySelector<HTMLInputElement>("#start")!.value = (generation.end + 1).toString();
        document.querySelector<HTMLButtonElement>("#generate")!.disabled = false;
    //}
}

function initFormHandlers() {
    document.querySelector("#generate")?.addEventListener("click", generateClick);
    document.querySelector("#login")?.addEventListener("click", login);
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
    let lastGeneration = await getLastGeneration();    
    document.querySelector<HTMLInputElement>("#start")!.value = (lastGeneration.end + 1).toString();
}

function showLoader(show: boolean) {
    if (show) {
        document.querySelector<HTMLElement>("#settings")!.style.display = "none";
        document.querySelector<HTMLElement>("#loading")!.style.display = "";
    } else {
        document.querySelector<HTMLElement>("#settings")!.style.display = "";
        document.querySelector<HTMLElement>("#loading")!.style.display = "none";
    }
}

function showLogin(user: User | null) {
    if (user) {
        document.querySelector<HTMLElement>("#generation-block")!.style.display = "";
        
        document.querySelector<HTMLElement>("#login-block")!.style.display = "none";
        document.querySelector<HTMLElement>("#login-info")!.innerHTML = "Вы вошли как " + user.name;
        let logoutLink = document.createElement("a");
        logoutLink.innerText = "выйти";
        logoutLink.addEventListener("click", logout);
        document.querySelector<HTMLElement>("#login-info")!.appendChild(logoutLink);
    } else {
        document.querySelector<HTMLElement>("#generation-block")!.style.display = "none";
        document.querySelector<HTMLElement>("#login-block")!.style.display = "";
    }
}

var CurrentUser: User | null = null;

async function onOpen() {
    let parametersExists = processQueryParametes();
    if (!parametersExists) {
        showLoader(true);
        try {
            await loadLatestGeneration();
            // CurrentUser = await getAuthentication();
            showLoader(false);
            initFormHandlers();
            // showLogin(CurrentUser);        
        } catch (err) {
            alert(err.message);
            return;
        }
    }
}

onOpen();