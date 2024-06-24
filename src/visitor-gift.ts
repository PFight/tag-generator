import { fillItemsFromGenerations, getGift, getItem, saveGift } from "firebase";
import { Gift, GiftItem } from "interfaces";
import { itemNames, itemRestrictions } from "items";
import { ageLocalization, categoryLocalization, genderLocalization } from "localization";
import "./gifts.css";
import { addPerson, initPersonSelect } from "person-select";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"

export let onVisitorGiftAddedCallback: (gift: Gift) => void;

export function setOnVisitorGiftAddedCallback(callback: typeof onVisitorGiftAddedCallback) {
    onVisitorGiftAddedCallback = callback;
}

let currentSeason: Gift | undefined = undefined;

export function processCurrentSeasonVisits(visits: Gift) {
    currentSeason = visits;
}

let getSelectedPerson = () => {
    let personList = document.getElementById("personList")! as HTMLElement;

    return personList.querySelector(".gift-add-item__person-list-item.selected")?.getAttribute("data-name");
}

export function onVisitorGiftOpen() {
    let addItemInput = document.getElementById("addItemName")! as HTMLInputElement;
    let addItemButton = document.getElementById("addItemButton")!;
    let addItemButton2 = document.getElementById("addItemButton2")!;
    let addItemButton3 = document.getElementById("addItemButton3")!;
    let addItemButton4 = document.getElementById("addItemButton4")!;
    let addItemButton5 = document.getElementById("addItemButton5")!;
    let clearItemButton = document.getElementById("clearItemButton")!;
    let autoClearInput = document.getElementById("autoClearInput")! as HTMLInputElement;
    let addItemCards = document.querySelectorAll<HTMLElement>(".gift-add-item__card");
    
    
 
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
        let deleteItem = (itemElement: HTMLElement) => {
            itemElement.remove();
            let gift = getCurrentGift();
            onVisitorGiftAddedCallback(gift);
            loadCardRestrictions();
        }

        let deleteItemClick = (ev: Event) => {
            deleteItem((ev.target as HTMLElement).parentElement as HTMLElement);
            let gift = getCurrentGift();
            onVisitorGiftAddedCallback(gift);
            loadCardRestrictions();
        }
        let item: HTMLElement;
        for (let i = 0; i < count; i++) {
            if (code) {
                let name = itemNames[code];
                let itemElement = document.importNode(itemTemplate.content, true);
                itemElement.querySelector(".gift-item__name")!.textContent = name;
                itemElement.querySelector(".gift-item__person")!.textContent = person;
                itemElement.querySelector(".gift-item__id")!.textContent = id;
                itemElement.querySelector(".gift-item__delete")!.addEventListener("click", deleteItemClick)
                item = itemElement.querySelector<HTMLElement>(".gift-item")!;
                items!.prepend(itemElement);
            } else {
                let itemElement = document.importNode(itemTemplate.content, true);
                itemElement.querySelector(".gift-item__id")!.textContent = id;
                itemElement.querySelector(".gift-item__person")!.textContent = person;
                itemElement.querySelector(".gift-item__delete")?.addEventListener("click", deleteItemClick)
                item = itemElement.querySelector<HTMLElement>(".gift-item")!;
                items!.prepend(itemElement);
            }
        }

        if (onVisitorGiftAddedCallback) {
            let gift = getCurrentGift();
            onVisitorGiftAddedCallback(gift);
        }

        loadCardRestrictions();

        showAddItemToast(person, code!, () => deleteItem(item));
    }
    let onAddItem = (count: number = 1, clearInput: boolean | null = null) => {
        addItem(addItemInput.value, getSelectedPerson() || "", count);
        if (clearInput || (clearInput === null && autoClearInput.checked)) {
            addItemInput.value = "";
            addItemInput.focus();
        }
    }
    addItemInput.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
            onAddItem();
        }
    });
    addItemInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && ev.ctrlKey) {
            ev?.preventDefault();
            onAddItem(1, false);
        }
        if (ev.key === "Backspace") {
            addItemInput.value = "";
        }
    });
    addItemButton.addEventListener("click", () => onAddItem(1));
    addItemButton2.addEventListener("click", () => onAddItem(2));
    addItemButton3.addEventListener("click", () => onAddItem(3));
    addItemButton4.addEventListener("click", () => onAddItem(4));
    addItemButton5.addEventListener("click", () => onAddItem(5));

    for (let i = 0;  i < addItemCards.length; i++) {
        let card = addItemCards[i];
        card.addEventListener("click", () => {
            let cardValue = card.getAttribute("data-code") as string;
            addItem(cardValue, getSelectedPerson() || "", 1);
        });
    }


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

export function loadCardRestrictions() {
    let addItemCards = document.querySelectorAll<HTMLElement>(".gift-add-item__card");

    let selectedPerson = getSelectedPerson();
    if (currentSeason) {
        let currentPersonSeasonItems = currentSeason.items.filter(x => (x as GiftItem).person === selectedPerson);
        for (let i = 0; i < addItemCards.length; i++) {
            let card = addItemCards[i];
            let cardValue = card.getAttribute("data-code")!;
            let currentSeasonCount = currentPersonSeasonItems.filter(x => (x as GiftItem).id === cardValue).length;
            let restriction = itemRestrictions[cardValue];
            if (restriction && currentSeasonCount >= restriction) {
                card.classList.add("gift-add-item__card_restricted")
            } else {
                card.classList.remove("gift-add-item__card_restricted")
            }
        }
    }
}

export function loadPersons(visits: Gift[]) {
    let persons: string[] = [];
    for (let visit of visits) {
        if (visit.items) {
            for (let item of visit.items) {
                if (typeof(item) == "object") {
                    if (!persons.includes(item.person)) {
                        persons.push(item.person);
                        addPerson(item.person);
                    }
                }
            }
        }
    }
}

export function cleanGift() {
    let personList = document.getElementById("personList")! as HTMLElement; 
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
    personList.innerHTML = "";
}

function getDateTimeInputValue(date: Date) {
    if (!date) 
        return "";
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().substring(0,16);
}

function showAddItemToast(person: string, code: number, deleteItem: () => void) {
    let addItemToastTemplate = document.getElementById("addItemToast") as HTMLTemplateElement;
    let addItemToast = document.importNode(addItemToastTemplate.content, true);
    addItemToast.querySelector(".add-item-toast__person")!.textContent = person;
    addItemToast.querySelector<HTMLImageElement>(".add-item-toast__image")!.src = code + ".png";
    addItemToast.querySelector(".add-item-toast__text")!.textContent = `${itemNames[code]}`;
    addItemToast.querySelector(".add-item-toast__cancel")!.addEventListener("click", () => {
        toast.hideToast();
        deleteItem();
        Toastify({
            text: `Отменено ${itemNames[code]} у ${person}!`
        }).showToast();
    });
    var toast = Toastify({
        node: addItemToast.querySelector<HTMLElement>(".add-item-toast")!,
        duration: 2000,
        close: false,
        gravity: "top",
        position: "right",
        newWindow: true,
    });
    toast.showToast();
}

