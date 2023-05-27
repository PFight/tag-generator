import { fillItemsFromGenerations, getItem, getVisitorGifts, saveGift } from "firebase";
import { Gift, GiftItem } from "interfaces";
import { itemNames } from "items";
import { ageLocalization, categoryLocalization, genderLocalization } from "localization";

export function onVisitorOpen() {
    let codeInput = document.getElementById("code")! as HTMLInputElement;
    let viewHistoryButton = document.getElementById("viewHistory")!;
    
    viewHistoryButton.addEventListener("click", async () => {
        let code = codeInput.value;
        let visits = await getVisitorGifts(code);
        
        visits.sort((a, b) => b.date?.getTime() - a.date?.getTime());
        let historyElement = document.getElementById("visitHistory") as HTMLElement;
        historyElement.innerHTML = '';
        for (let visit of visits) {
            let visitElement = createVisitView(visit);
            historyElement.append(visitElement);             
        }

        let currentMonthElement = document.getElementById("currentMonth")! as HTMLElement;
        let currentMonth: Gift = {
            date: "В этом месяце" as any,
            fio: "",
            id: "",
            phone: visits[0]?.phone,
            items: visits.filter(x => x.date.getMonth() == new Date().getMonth())
                .reduce((arr, val) => arr.concat(val.items), [] as (GiftItem | string | number)[])
        };
        let visitElement = createVisitView(currentMonth);
        currentMonthElement.innerHTML = '';
        currentMonthElement.append(visitElement);
    });    
}

function createVisitView(visit: Gift) {
    let visitTemplate = document.getElementById("visitTemplate")! as HTMLTemplateElement;
    let visitElement = document.importNode(visitTemplate.content, true);
    if (visit.id) {
        visitElement.querySelector(".visit__id")!.textContent = visit.id ? ("Номер посещения: " + visit.id) : "";
        (visitElement.querySelector(".visit__id")! as HTMLLinkElement).href = "gift.html?gift=" + visit.id;
    }
    visitElement.querySelector(".visit__date")!.textContent = typeof(visit.date) == "string" ? visit.date : (
        visit.date.toLocaleDateString() + " " + visit.date.toLocaleTimeString()
    );
    let visitItemsElement = visitElement.querySelector(".visit__items")! as HTMLElement;
    let personsItems = {} as { [person: string | "incognito"]: Array<GiftItem | string | number>; };
    for (let item of visit.items) {
        if (typeof (item) != "object" || !item.person) {
            let record = personsItems['incognito'] = personsItems['incognito'] || [];
            record.push(item);
        } else {
            let record = personsItems[item.person] = personsItems[item.person] || [];
            record.push(item);
        }
    }
    let visitPersonTemplate = visitItemsElement.querySelector("#visitPersonTemplate") as HTMLTemplateElement;
    for (let person in personsItems) {
        let visitPersonElement = document.importNode(visitPersonTemplate.content, true);
        visitPersonElement.querySelector(".visit__person-name")!.textContent =
            person == "incognito" ? "Получатель не указан" : person;
        let visitPersonThingsElement = visitPersonElement.querySelector(".visit__person-things")!;
        let visitPersonThingTemplate = visitPersonThingsElement.querySelector("#visitPersonThingTemplate")! as HTMLTemplateElement;
        let categories = {} as { [category: string]: number; };
        for (let item of personsItems[person]) {
            let category = typeof (item) == "object" ? item.id : item;
            categories[category] = (categories[category] ?? 0) + 1;
        }
        for (let category in categories) {
            let categoryName = itemNames[category];
            let count = categories[category];
            let visitPersonThingElement = document.importNode(visitPersonThingTemplate.content, true);
            visitPersonThingElement.querySelector(".visit__person-category")!.textContent = categoryName;
            visitPersonThingElement.querySelector(".visit__person-category-count")!.textContent = count.toString();
            visitPersonThingsElement.append(visitPersonThingElement);
        }
        visitItemsElement.append(visitPersonElement);
    }
    return visitElement;
}
