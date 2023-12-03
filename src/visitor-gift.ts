import { fillItemsFromGenerations, getGift, getItem, saveGift } from "firebase";
import { Gift, GiftItem } from "interfaces";
import { itemNames } from "items";
import { ageLocalization, categoryLocalization, genderLocalization } from "localization";
import "./gifts.css";
import { initPersonSelect } from "person-select";

export let onVisitorGiftAddedCallback: (gift: Gift) => void;

export function setOnVisitorGiftAddedCallback(callback: typeof onVisitorGiftAddedCallback) {
    onVisitorGiftAddedCallback = callback;
}

export function onVisitorGiftOpen() {
    let addItemInput = document.getElementById("addItemName")! as HTMLInputElement;
    let addItemButton = document.getElementById("addItemButton")!;
    let addItemButton2 = document.getElementById("addItemButton2")!;
    let addItemButton3 = document.getElementById("addItemButton3")!;
    let clearItemButton = document.getElementById("clearItemButton")!;
    let autoClearInput = document.getElementById("autoClearInput")! as HTMLInputElement;
    
    let addItemPersonInput = document.getElementById("addItemPerson")! as HTMLInputElement;
    
    let items = document.getElementById("giftItems")!;
    let itemTemplate = document.getElementById("giftItemTemplate")! as HTMLTemplateElement;
    let fioInput = document.getElementById("fioInput")! as HTMLInputElement;
    let phoneInput = document.getElementById("phoneInput")! as HTMLInputElement;
    let passportInput = document.getElementById("passportInput")! as HTMLInputElement;
    let dateInput = document.getElementById("dateInput")! as HTMLInputElement;
    dateInput.value = getDateTimeInputValue(new Date());
    let offenderInput = document.getElementById("offenderInput")! as HTMLInputElement;
    let saveButton = document.getElementById("save")!;
    let giftNumber = document.getElementById("giftNumber")! as HTMLInputElement;
    let loadGiftButton = document.getElementById("loadGift")! as HTMLButtonElement;

    let addItem = async (id: string, person: string, count: number = 1) => {
        let code: number | null = null;
        try {
            code = parseInt(id)
        } catch {
        }
        let deleteItem = (ev: Event) => {
            (ev.target as HTMLElement).parentElement!.remove();
        }
        for (let i = 0; i < count; i++) {
            if (code) {
                let name = itemNames[code];
                let itemElement = document.importNode(itemTemplate.content, true);
                itemElement.querySelector(".gift-item__name")!.textContent = name;
                itemElement.querySelector(".gift-item__person")!.textContent = person;
                itemElement.querySelector(".gift-item__id")!.textContent = id;
                itemElement.querySelector(".gift-item__delete")?.addEventListener("click", deleteItem)
                items!.prepend(itemElement);
            } else {
                let itemElement = document.importNode(itemTemplate.content, true);
                itemElement.querySelector(".gift-item__id")!.textContent = id;
                itemElement.querySelector(".gift-item__person")!.textContent = person;
                itemElement.querySelector(".gift-item__delete")?.addEventListener("click", deleteItem)
                items!.prepend(itemElement);
            }
        }
    }
    let onAddItem = (count: number = 1) => {
        addItem(addItemInput.value, addItemPersonInput.value, count);
        if (autoClearInput.checked) {
            addItemInput.value = "";
            addItemInput.focus();
        }
        if (onVisitorGiftAddedCallback) {
            let gift = getCurrentGift();
            onVisitorGiftAddedCallback(gift);
        }
    }
    addItemInput.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
            ev?.preventDefault();
            onAddItem();
        }
    });
    addItemButton.addEventListener("click", () => onAddItem(1));
    addItemButton2.addEventListener("click", () => onAddItem(2));
    addItemButton3.addEventListener("click", () => onAddItem(3));

    clearItemButton.addEventListener("click", () => {
        addItemInput.value = "";
        addItemInput.focus();
    });

    const disableAutoClearInputKey = "disableAutoClearInput";
    autoClearInput.addEventListener("change", () => {
        if (!autoClearInput.checked) {
            localStorage[disableAutoClearInputKey] = "true";
        } else {
            delete localStorage[disableAutoClearInputKey];
        }
    });
    autoClearInput.checked = !localStorage[disableAutoClearInputKey];

    let saving = false;

    let save = async () => {
        if (!phoneInput.value && !passportInput.value && !fioInput.value) {
            alert("Укажите либо номер телефона, либо номер паспорта, либо фамилию и инициалы");
            return;
        }

        if (saving) {
            console.info("Already saving...");
            return;
        }
        saving = true;
        try {
            let gift = getCurrentGift();
            gift.items = gift.items.map(x => JSON.stringify(x));
            let id = await saveGift(gift as any);
            giftNumber.value = id;
        } finally {
            saving = false;
        }
    }

    let getCurrentGift = () => {
        let itemsElements = document.querySelectorAll(".gift-item");
        let items = [].map.call(itemsElements, (element: HTMLElement) => {
            let id = element.querySelector(".gift-item__id")!.textContent as any;
            let person = element.querySelector(".gift-item__person")!.textContent;
            let name = element.querySelector(".gift-item__name")!.textContent;
            return { id: id || name, person } as GiftItem;
        });

        return {
            id: giftNumber.value,
            fio: fioInput.value?.toLowerCase(),
            phone: phoneInput.value,
            passport: passportInput.value,
            date: new Date(dateInput.value),
            offender: offenderInput.checked,
            items
        } as Gift;
    }
    saveButton.addEventListener("click", save);

    let load = async () => {
        items.innerHTML = "";
        let gift = await getGift(giftNumber.value);         
        fioInput.value = gift.fio;
        phoneInput.value = gift.phone;
        passportInput.value = gift.passport;
        dateInput.value = getDateTimeInputValue(gift.date);
        offenderInput.checked = gift.offender;
        for (let item of gift.items) {
            if (typeof(item) == "object") {
                addItem(item.id, item.person);
            } else {
                addItem(item.toString(), "");
            }
        }
    };
    loadGiftButton.addEventListener("click", load);

    const urlParams = new URLSearchParams(window.location.search);
    const urlGiftNumber = urlParams.get('gift');
    if (urlGiftNumber) {
        giftNumber.value = urlGiftNumber;
        load();
    }

    initPersonSelect();
}

export function cleanGift() {
    let addItemPersonInput = document.getElementById("addItemPerson")! as HTMLInputElement; 
    let items = document.getElementById("giftItems")!;
    let fioInput = document.getElementById("fioInput")! as HTMLInputElement;
    let phoneInput = document.getElementById("phoneInput")! as HTMLInputElement;
    let passportInput = document.getElementById("passportInput")! as HTMLInputElement;
    let dateInput = document.getElementById("dateInput")! as HTMLInputElement;
    dateInput.value = getDateTimeInputValue(new Date());
    let offenderInput = document.getElementById("offenderInput")! as HTMLInputElement;
    let giftNumber = document.getElementById("giftNumber")! as HTMLInputElement;

    items.innerHTML = "";         
    fioInput.value = "";
    phoneInput.value = "";
    passportInput.value = "";
    dateInput.value = getDateTimeInputValue(new Date());
    offenderInput.checked = false;
    giftNumber.value = "";
    addItemPersonInput.value = "";
}

function getDateTimeInputValue(date: Date) {
    if (!date) 
        return "";
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().substring(0,16);
}

