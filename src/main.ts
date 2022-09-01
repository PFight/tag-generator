import { getAuthentication, login, logout, User } from "auth";
import { findGeneration, getLastGeneration, saveLastGeneration } from "firebase";
import { onGiftsOpen } from "gifts";
import { AGE_PARAM, CATEGORY_PARAM, COUNT_PARAM, GENDER_PARAM, Generation, QUALITY_PARAM, SIZE_PARAM, START_PARAM, STYLE_PARAM, TEMPLATE_PARAM } from "interfaces";
import { protectGeneration } from "protection";
import { generate } from "./generate";
import "./main.css";



async function generateClick() {
    let template = document.querySelector<HTMLInputElement>("#template")?.value || "#female-male";
    let start = parseInt(document.querySelector<HTMLInputElement>("#start")?.value  || "0");
    let count = parseInt(document.querySelector<HTMLInputElement>("#count")?.value || "12");
    let gender = getRadio(GENDER_PARAM);
    let category = getRadio(CATEGORY_PARAM);
    let size = getRadio(SIZE_PARAM) || '';
    let quality = getRadio(QUALITY_PARAM) || '';
    let style = getRadio(STYLE_PARAM) || '';
    let age = getRadio(AGE_PARAM);

    if (!gender || !category || !age) {
        alert("Не все обязательные поля заполнены (пол, категория, возраст)!")
        return;
    }

    document.querySelector<HTMLButtonElement>("#generate")!.disabled = true;
    let generation = {
        start,
        end: start + count - 1,
        template,
        userId: 'x',
        userName: 'x',
        gender,
        category,
        size,
        quality,
        style,
        age
    };
    try {        
        await saveLastGeneration(generation);
        let openedWindow = window.open(location.pathname + `?${START_PARAM}=${start}&${COUNT_PARAM}=${count}` +
            `&${TEMPLATE_PARAM}=${encodeURIComponent(template)}` +
            `&${GENDER_PARAM}=${gender}` +
            `&${CATEGORY_PARAM}=${category}` +
            `&${SIZE_PARAM}=${size}`+
            `&${STYLE_PARAM}=${style}` +
            `&${AGE_PARAM}=${age}` +
            `&${QUALITY_PARAM}=${quality}`,
            'Print',
            'width=1000,height=800,left=300,top=200');
    } catch (err: any) {
        alert(err.message);0
    }
    document.querySelector<HTMLInputElement>("#start")!.value = (generation.end + 1).toString();
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
    const start = urlParams.get(START_PARAM);
    const count = urlParams.get(COUNT_PARAM);
    const template = urlParams.get(TEMPLATE_PARAM);
    const age = urlParams.get(AGE_PARAM);
    const gender = urlParams.get(GENDER_PARAM);
    const category = urlParams.get(CATEGORY_PARAM);
    const size = urlParams.get(SIZE_PARAM);
    const style = urlParams.get(STYLE_PARAM);
    const quality = urlParams.get(QUALITY_PARAM);
    if (start && count && template) {
        generate(template, parseInt(start), parseInt(count), {
            age, gender, category, size, style, quality
        });
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

function onInputChange() {
    let gender = getRadio(GENDER_PARAM);
    let age = getRadio(AGE_PARAM);
    let male = document.getElementById("maleCategories");
    let female = document.getElementById("femaleCategories");
    let baby = document.getElementById("babyСategories");
    let categories = [male, female, baby ];

    let selectedCategory = null;
    
    if (age == "adult" || age == "kid") {
        if (gender === "male") {
            selectedCategory = male;
        } else if (gender === "female") {
            selectedCategory = female;
        } else {
            selectedCategory = male;
        }
    } else if (age === "baby") {
        selectedCategory = baby;
    }
    else {
        selectedCategory = female;
    }
    for (let category of categories) {
        if (category == selectedCategory) {
            category!.style.display = '';
        } else {
            category!.style.display = 'none';
        }
    }

    let genderKid = document.getElementById("genderKidLabel");
    genderKid!.style.display = age === "baby" ? "" : "none";

    let category = getRadio(CATEGORY_PARAM);
    let size = document.getElementById("size");
    size!.style.display = (category == "G" || age === "baby") ? "none" : "";
}

(window as any)["onGenderChange"] = onInputChange;

async function onOpen() {
    let pageType = document.getElementById("pageType")?.getAttribute("data-value");
    if (pageType == "generation") {   
        let parametersExists = processQueryParametes();
        if (!parametersExists) {
            showLoader(true);
            try {
                await loadLatestGeneration();
                showLoader(false);
                initFormHandlers();
                [].forEach.call(document.querySelectorAll("input"), (input: HTMLElement) => {
                    input.addEventListener("change", onInputChange);
                });
                onInputChange();
            } catch (err: any) {
                alert(err.message);
                return;
            }
        }
    } else if (pageType == "gift") {
        onGiftsOpen();
    }
}

onOpen();