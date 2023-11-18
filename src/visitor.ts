import { fillItemsFromGenerations, getItem, getVisitorGifts, saveGift } from "firebase";
import { Gift, GiftItem } from "interfaces";
import { itemNames } from "items";
import { ageLocalization, categoryLocalization, genderLocalization } from "localization";
import "./visitor.css";

const Seasons = [[11, 0, 1], [2, 3, 4], [5, 6, 7], [8, 9, 10]];

let LIMITS_PASPORT = "<b>Лимит по паспорту:</b> 5 детских / 3 младенческих вещи одной категории на человека в сезон";
let LIMITS_PHONE = "<b>Лимит по телефону:</b> 10 детских вещей в сезон, не более 3 одной категории";

export function onVisitorOpen() {
    let codeInput = document.getElementById("code")! as HTMLInputElement;
    let currentMonthElement = document.getElementById("currentMonth")! as HTMLElement;
    let limitsElement = document.getElementById("limits")! as HTMLElement;
    let identityElement = document.getElementById("identity")! as HTMLElement;
    let historyElement = document.getElementById("visitHistory") as HTMLElement;
    let viewHistoryButton = document.getElementById("viewHistory")!;
    let offenderBlock = document.getElementById("offender")!;

    let clean = () => {
        historyElement.innerHTML = '';
        currentMonthElement.innerHTML = '';
        offenderBlock.className = "hide";
    }
    
    let show = async () => {
        clean();
        let code = codeInput.value;
        let visits = await getVisitorGifts(code);
        identityElement.innerText = code;
        if (visits.length == 0) {
            identityElement.innerText += " (новый)";
        }
        if (visits.some(x => x.offender)) {
            offenderBlock.className = "";
        } else {
            offenderBlock.className = "hide";
        }

        let isPasport = false;
        if (visits.some(x => x.passport == code)) {
            limitsElement.innerHTML = LIMITS_PASPORT;
            isPasport = true;
        } else if (visits.some(x => x.phone == code)) {
            limitsElement.innerHTML = LIMITS_PHONE;
        } else {
            limitsElement.innerHTML = LIMITS_PHONE + "<br/>" + LIMITS_PASPORT;
        }

        visits.sort((a, b) => b.date?.getTime() - a.date?.getTime());       
        for (let visit of visits) {
            let visitElement = createVisitView(visit);
            historyElement.append(visitElement);             
        }

        let currentSeason = Seasons.find(months => months.includes(new Date().getMonth()))!;

        let currentMonth: Gift = {
            date: "В этом сезоне" as any,
            fio: visits.find(x => x.fio)?.fio || "",
            id: "",
            offender: false,
            phone: visits.find(x => x.phone)?.phone || "",
            passport: visits.find(x => x.passport)?.passport || "",
            items: visits.filter(x => currentSeason.includes(x.date.getMonth()))
                .reduce((arr, val) => arr.concat(val.items), [] as (GiftItem | string | number)[])
        };
        let visitElement = createVisitView(currentMonth);
        currentMonthElement.append(visitElement);
        if (currentMonth.items.length == 0) {
            var noItemsTemplate = document.getElementById("noVisitTemplate") as HTMLTemplateElement;
            var noItemsElement = document.importNode(noItemsTemplate.content, true);
            currentMonthElement.firstElementChild!.appendChild(noItemsElement);
        }
    };

    viewHistoryButton.addEventListener("click", show);
    codeInput.addEventListener("keyup", async (ev) => {
        if (!codeInput.value) {
            clean();
        } else {
            if (ev.key == 'Enter') {
                await show();
                codeInput.value = '';
                window.print();
            }
        }
    })
}

function createVisitView(visit: Gift) {
    let visitTemplate = document.getElementById("visitTemplate")! as HTMLTemplateElement;
    let visitElement = document.importNode(visitTemplate.content, true);
    if (visit.id) {
        visitElement.querySelector(".visit__id")!.textContent = visit.id ? ("Номер посещения: " + visit.id) : "";
        (visitElement.querySelector(".visit__id")! as HTMLLinkElement).href = "gift.html?gift=" + visit.id;
    }
    if (visit.offender) {
        visitElement.querySelector(".visit__offender")!.classList.remove("hide");
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
