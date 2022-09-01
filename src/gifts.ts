import { fillItemsFromGenerations, findGeneration } from "firebase";
import { ageLocalization, categoryLocalization, genderLocalization } from "localization";

export function onGiftsOpen() {
    let addItemInput = document.getElementById("addItemName")! as HTMLInputElement;
    let addItemButton = document.getElementById("addItemButton")!;
    let items = document.getElementById("giftItems")!;
    let itemTemplate = document.getElementById("giftItemTemplate")! as HTMLTemplateElement;
    let addItemFromBase = async (id: string) => {
        let gen = await findGeneration(parseInt(id));
        if (gen) {
            let itemElement = document.importNode(itemTemplate.content, true);
            let name = ageLocalization[gen.age] + " / " + genderLocalization[gen.age] + " / " + categoryLocalization[gen.category];
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
    addItemButton.addEventListener("click", () => {
        fillItemsFromGenerations();
        alert("done!");
    });    
}