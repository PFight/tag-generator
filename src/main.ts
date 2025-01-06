import { generateReport } from "analyze";
import { getAuthentication, login, logout, User } from "auth";
import { getGifts, getLastGeneration, saveLastGeneration } from "firebase";
import { onGiftsOpen } from "gifts";
import { AGE_PARAM, CATEGORY_PARAM, COUNT_PARAM, GENDER_PARAM, Generation, QUALITY_PARAM, SIZE_PARAM, START_PARAM, STYLE_PARAM, TEMPLATE_PARAM } from "interfaces";
import { protectGeneration } from "protection";
import { onVisitorOpen } from "visitor";
import { generate } from "./generate";
import "./main.css";



async function generateClick() {
    let template = "#visitor-card";
    let count = parseInt(document.querySelector<HTMLInputElement>("#count")?.value || "10");

    document.querySelector<HTMLButtonElement>("#generate")!.disabled = true;
   
    try {        
        let openedWindow = window.open(location.pathname + `?${COUNT_PARAM}=${count}` +
            `&${TEMPLATE_PARAM}=${encodeURIComponent(template)}`,
            '_blank',
            'width=1000,height=800,left=300,top=200');
    } catch (err: any) {
        alert(err.message);0
    }
    document.querySelector<HTMLButtonElement>("#generate")!.disabled = false;
}

function getRadio(name: string) {
    var radio = document.getElementsByName(name);
    for (var i=0; i < radio.length; i++) {
        let item = radio[i] as HTMLInputElement;
        if (item.checked) {
            return item.value;
        }
    }
}

function initFormHandlers() {
    document.querySelector("#generate")?.addEventListener("click", generateClick);
}


function processQueryParametes() {
    const urlParams = new URLSearchParams(window.location.search);
    const count = urlParams.get(COUNT_PARAM);
    const template = urlParams.get(TEMPLATE_PARAM);
    
    if (count && template) {
        generate(template, parseInt(count));
        return true;
    } else {
        return false;
    }
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



async function onOpen() {
    let pageType = document.getElementById("pageType")?.getAttribute("data-value");
    if (pageType == "generation") {   
        let parametersExists = processQueryParametes();
        if (!parametersExists) {
            showLoader(true);
            try {
                showLoader(false);
                initFormHandlers();
            } catch (err: any) {
                alert(err.message);
                return;
            }
        }
    } else if (pageType == "gift") {
        onGiftsOpen();
    } else if (pageType =="report") {
        generateReport();
    } else if (pageType == "visitor") {
        onVisitorOpen();
    }
}

onOpen();