import { fillItemsFromGenerations, getItem, getVisitorGifts, saveGift } from "firebase";
import { Gift, GiftItem } from "interfaces";
import { chlidrenItems, isChildItem, itemNames, itemRestrictions } from "items";
import { ageLocalization, categoryLocalization, genderLocalization } from "localization";
import "./visitor.css";
import { cleanGift, loadPersons, onVisitorGiftOpen, processCurrentSeasonVisits, setOnVisitorGiftAddedCallback } from "visitor-gift";

const Seasons = [[11, 0, 1], [2, 3, 4], [5, 6, 7], [8, 9, 10]];
const MOTH_VISITS_LIMIT = 8;

let LIMITS_PASPORT = "<b>Лимит по паспорту:</b> 5 детских вещей одной категории на человека в сезон";
let LIMITS_PHONE = "<b>Лимит по телефону:</b> 10 детских вещей в сезон, не более 3 одной категории";
let LIMITS_CHILDREN = "<b>Если больше 3-х детей:</b> нужны подтверждающие документы";

export function onVisitorOpen() {
    onVisitorGiftOpen();

    let phoneCodeInput = document.getElementById("phoneCode")! as HTMLInputElement;
    let passportCodeInput = document.getElementById("passportCode")! as HTMLInputElement;
    let currentMonthElement = document.getElementById("currentMonth")! as HTMLElement;
    let limitsElement = document.getElementById("limits")! as HTMLElement;
    let identityElement = document.getElementById("identity")! as HTMLElement;
    let historyElement = document.getElementById("visitHistory") as HTMLElement;
    let viewHistoryButton = document.getElementById("viewHistory")!;
    let offenderBlock = document.getElementById("offender")!;
    let printButton = document.getElementById("printButton");
    printButton?.addEventListener("click", () => window.print());

    let clean = () => {
        historyElement.innerHTML = '';
        currentMonthElement.innerHTML = '';
        offenderBlock.className = "hide";
    }
    
    let show = async () => {
        clean();
        let giftElement = document.getElementById("gift");
        giftElement?.classList.remove("hide");


        let passportCode = passportCodeInput.value;
        let phoneCode = phoneCodeInput.value;
        let visits = await getVisitorGifts(phoneCode, passportCode);


        
        identityElement.innerText = phoneCode + " " + passportCode;
        if (visits.length == 0) {
            identityElement.innerText += " (новый)";
        }
        let currentMonthVisits = visits.filter(x => 
            x.date.getMonth() == (new Date()).getMonth() && 
            x.date.getFullYear() == (new Date()).getFullYear());
        identityElement.innerText += ` (посещений в этом месяце: ${currentMonthVisits.length})`;
        if (currentMonthVisits.length >= MOTH_VISITS_LIMIT) {
            identityElement.innerText += ` (посещений в этом месяце: ${currentMonthVisits.length} [ЛИМИТ ИСЧЕРПАН])`;
        }
        

        if (visits.some(x => x.offender)) {
            offenderBlock.className = "";
        } else {
            offenderBlock.className = "hide";
        }

        let isPasport = !!passportCode;
        let isPhone = !!phoneCode;
        if (isPasport) {
            limitsElement.innerHTML = LIMITS_PASPORT  + "<br/>" + LIMITS_CHILDREN;
            isPasport = true;
        } else if (isPhone) {
            limitsElement.innerHTML = LIMITS_PHONE + "<br/>" + LIMITS_PASPORT + "<br/>" + LIMITS_CHILDREN;
            isPhone = true;
        } else {
            limitsElement.innerHTML = LIMITS_PHONE + "<br/>" + LIMITS_PASPORT + "<br/>" + LIMITS_CHILDREN;
        }

        cleanGift();
        let phoneInput = document.getElementById("phoneInput") as HTMLInputElement;
        let passportInput = document.getElementById("passportInput") as HTMLInputElement;
        passportInput.value = passportCode;
        phoneInput.value = phoneCode;
        loadPersons(visits);

        showVisits(visits);

        setOnVisitorGiftAddedCallback(gift => {
            (gift as any)["current"] = true;
            let index = visits.findIndex(x => (x as any)["current"] || x.id === gift.id);
            if (index >= 0) {
                visits[index] = gift;
            } else {
                visits.push(gift);
            }
            showVisits(visits);
        });
    };

    viewHistoryButton.addEventListener("click", show);
    phoneCodeInput.addEventListener("keyup", onCodeInput());
    passportCodeInput.addEventListener("keyup", onCodeInput());

    function showVisits(visits: Gift[]) {
        historyElement.innerHTML = '';
        currentMonthElement.innerHTML = '';

        visits.sort((a, b) => b.date?.getTime() - a.date?.getTime());
        for (let visit of visits) {
            let visitElement = createVisitView(visit);
            historyElement.append(visitElement);
        }

        let currentSeasonMonths = Seasons.find(months => months.includes(new Date().getMonth()))!;

        let currentSeason: Gift = {
            date: "В этом сезоне" as any,
            fio: visits.find(x => x.fio)?.fio || "",
            id: "",
            offender: false,
            phone: visits.find(x => x.phone)?.phone || "",
            passport: visits.find(x => x.passport)?.passport || "",
            items: visits.filter(x => monthDiff(x.date, new Date()) <= 6 &&
                currentSeasonMonths.includes(x.date.getMonth()))
                .reduce((arr, val) => arr.concat(val.items), [] as (GiftItem | string | number)[])
        };
        currentSeason.date += " (" + currentSeason.items.filter(x => isChildItem(x as GiftItem)).length + " детского)" as any;
        let visitElement = createVisitView(currentSeason);
        currentMonthElement.append(visitElement);
        if (currentSeason.items.length == 0) {
            var noItemsTemplate = document.getElementById("noVisitTemplate") as HTMLTemplateElement;
            var noItemsElement = document.importNode(noItemsTemplate.content, true);
            currentMonthElement.firstElementChild!.appendChild(noItemsElement);
        }
        processCurrentSeasonVisits(currentSeason);
    }

    function onCodeInput(): any {
        return async (ev: KeyboardEvent) => {
            if (!(ev.target! as HTMLInputElement).value) {
                clean();
            } else {
                if (ev.key == 'Enter') {
                    await show();
                    phoneCodeInput.value = '';
                    passportCodeInput.value = '';
                    // window.print();
                }
            }
        };
    }
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
            let restriction = itemRestrictions[category];
            let restrictionText = count >= restriction ? ' <span class="limit-message">[лимит исчерпан]</span>' : "";
            let visitPersonThingElement = document.importNode(visitPersonThingTemplate.content, true);
            visitPersonThingElement.querySelector(".visit__person-category")!.textContent = categoryName;
            visitPersonThingElement.querySelector(".visit__person-category-count")!.innerHTML = count.toString() + restrictionText;
            visitPersonThingsElement.append(visitPersonThingElement);
        }
        visitItemsElement.append(visitPersonElement);
    }
    return visitElement;
}

function monthDiff(d1: Date, d2: Date) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}