import { getAuthentication, login, logout, User } from "auth";
import { getLastGeneration, saveLastGeneration } from "firebase";
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
    let size = getRadio(SIZE_PARAM);
    let quality = getRadio(QUALITY_PARAM);
    let style = getRadio(STYLE_PARAM);
    let age = getRadio(AGE_PARAM);

    if (!gender || !category || !size || !quality || !style || !age) {
        alert("Не все поля заполнены!")
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
            'width=200,height=100');
    } catch (err: any) {
        alert(err.message);
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

function onGenderChange() {
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
}

(window as any)["onGenderChange"] = onGenderChange;

async function onOpen() {
    let parametersExists = processQueryParametes();
    if (!parametersExists) {
        showLoader(true);
        try {
            await loadLatestGeneration();
            showLoader(false);
            initFormHandlers();      
            onGenderChange();
        } catch (err: any) {
            alert(err.message);
            return;
        }
    }
}

onOpen();