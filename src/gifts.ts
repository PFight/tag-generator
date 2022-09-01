import { fillItemsFromGenerations, getItem } from "firebase";
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
    let dateView = document.getElementById("dateView")!;
    dateView.textContent = (new Date()).toLocaleDateString("ru-RU");

    fioInput.addEventListener("change", (ev) => {
        fioView.textContent = fioInput.value;
    });
    phoneInput.addEventListener("change", (ev) => {
        phoneView.textContent = phoneInput.value;
    });    

    let addItemFromBase = async (id: string) => {
        let gen = await getItem(parseInt(id));
        if (gen) {
            let itemElement = document.importNode(itemTemplate.content, true);
            let name = ageLocalization[gen.age] + " / " + genderLocalization[gen.gender] + " / " + categoryLocalization[gen.category];
            itemElement.querySelector(".gift-item__name")!.textContent = name;
            itemElement.querySelector(".gift-item__id")!.textContent = id;
            items!.appendChild(itemElement);
        } else {
            let itemElement = document.importNode(itemTemplate.content, true);
            itemElement.querySelector(".gift-item__id")!.textContent = id;
            items!.appendChild(itemElement);
        }
    }
    let addItem = () => {
        addItemFromBase(addItemInput.value);
        addItemInput.value = "";
        addItemInput.focus();
    }
    addItemInput.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
            ev?.preventDefault();
            addItem();
        }
    });
    addItemButton.addEventListener("click", addItem);
}