import { fillItemsFromGenerations, getGift, getItem, saveGift } from "firebase";
import { GiftItem } from "interfaces";
import { itemNames } from "items";
import { ageLocalization, categoryLocalization, genderLocalization } from "localization";
import "./gifts.css";
import { initPersonSelect } from "person-select";

export function onGiftsOpen() {
    let addItemInput = document.getElementById("addItemName")! as HTMLInputElement;
    let addItemButton = document.getElementById("addItemButton")!;
    let addItemPersonInput = document.getElementById("addItemPerson")! as HTMLInputElement;
    
    let items = document.getElementById("giftItems")!;
    let itemTemplate = document.getElementById("giftItemTemplate")! as HTMLTemplateElement;
    let fioInput = document.getElementById("fioInput")! as HTMLInputElement;
    let phoneInput = document.getElementById("phoneInput")! as HTMLInputElement;
    let dateInput = document.getElementById("dateInput")! as HTMLInputElement;
    dateInput.value = getDateTimeInputValue(new Date());
    let saveButton = document.getElementById("save")!;
    let giftNumber = document.getElementById("giftNumber")! as HTMLInputElement;
    let loadGiftButton = document.getElementById("loadGift")! as HTMLButtonElement;

    let addItem = async (id: string, person: string) => {
        let code: number | null = null;
        try {
            code = parseInt(id)
        } catch {
        }
        let deleteItem = (ev: Event) => {
            (ev.target as HTMLElement).parentElement!.remove();
        }
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
    let onAddItem = () => {
        addItem(addItemInput.value, addItemPersonInput.value);
        addItemInput.value = "";
        addItemInput.focus();
    }
    addItemInput.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
            ev?.preventDefault();
            onAddItem();
        }
    });
    addItemButton.addEventListener("click", onAddItem);

    let save = async () => {
        let itemsElements = document.querySelectorAll(".gift-item");
        let items = [].map.call(itemsElements, (element: HTMLElement) => {
            let id = element.querySelector(".gift-item__id")!.textContent;
            let person = element.querySelector(".gift-item__person")!.textContent;
            let name = element.querySelector(".gift-item__name")!.textContent;
            return JSON.stringify({ id: id || name, person } as GiftItem);
        });       

        let id = await saveGift({
            id: giftNumber.value,
            fio: fioInput.value,
            phone: phoneInput.value,
            date: new Date(dateInput.value),
            items
        } as any);
        giftNumber.value = id;
    }
    saveButton.addEventListener("click", save);

    let load = async () => {
        items.innerHTML = "";
        let gift = await getGift(giftNumber.value);         
        fioInput.value = gift.fio;
        phoneInput.value = gift.phone;
        dateInput.value = getDateTimeInputValue(gift.date);
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

function getDateTimeInputValue(date: Date) {
    if (!date) 
        return "";
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().substring(0,16);
}

