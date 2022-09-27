import { fillItemsFromGenerations, getItem, saveGift } from "firebase";
import { itemNames } from "items";
import { ageLocalization, categoryLocalization, genderLocalization } from "localization";
import "./gifts.css";

export function onGiftsOpen() {
    let addItemInput = document.getElementById("addItemName")! as HTMLInputElement;
    let addItemButton = document.getElementById("addItemButton")!;
    let items = document.getElementById("giftItems")!;
    let itemTemplate = document.getElementById("giftItemTemplate")! as HTMLTemplateElement;
    let fioInput = document.getElementById("fioInput")! as HTMLInputElement;
    let phoneInput = document.getElementById("phoneInput")! as HTMLInputElement;
    let fioView = document.getElementById("fioView")!;
    let phoneView = document.getElementById("phoneView")!;
    let dateInput = document.getElementById("dateInput")! as HTMLInputElement;
    dateInput.valueAsDate = new Date();
    let dateView = document.getElementById("dateView")!;
    dateView.textContent = (new Date()).toLocaleDateString("ru-RU");
    let saveButton = document.getElementById("save")!;
    let saveAndPrintButton = document.getElementById("saveAndPrint")!;
    let giftNumber = document.getElementById("giftNumber")!;

    fioInput.addEventListener("change", (ev) => {
        fioView.textContent = fioInput.value;
    });
    phoneInput.addEventListener("change", (ev) => {
        phoneView.textContent = phoneInput.value;
    });   
    dateInput.addEventListener("change", (ev) => {
        dateView.textContent = dateInput.valueAsDate!.toLocaleDateString("ru-RU");
    });  

    let addItem = async (id: string) => {
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
            itemElement.querySelector(".gift-item__id")!.textContent = id;
            itemElement.querySelector(".gift-item__delete")?.addEventListener("click", deleteItem)
            items!.appendChild(itemElement);
        } else {
            let itemElement = document.importNode(itemTemplate.content, true);
            itemElement.querySelector(".gift-item__id")!.textContent = id;
            itemElement.querySelector(".gift-item__delete")?.addEventListener("click", deleteItem)
            items!.appendChild(itemElement);
        }
    }
    let onAddItem = () => {
        addItem(addItemInput.value);
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
            let name = element.querySelector(".gift-item__name")!.textContent;
            return id || name;
        });       

        let id = await saveGift({
            id: giftNumber.textContent,
            fio: fioInput.value,
            phone: phoneInput.value,
            date: dateInput.valueAsDate,
            items
        } as any);
        giftNumber.textContent = id;
    }
    saveButton.addEventListener("click", save);
    saveAndPrintButton.addEventListener("click", async () => {
        await save();
        window.print();
    });
}