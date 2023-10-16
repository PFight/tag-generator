import { getGifts } from "firebase";
import { Gift, GiftItem } from "interfaces";
import { itemNames } from "items";

export async function generateReport() {
    let generateByVisitors = document.getElementById("generateByVisitors");
    let generateByDays = document.getElementById("generateByDays");
    let generateByCategories = document.getElementById("generateByCategories");
    let from = document.getElementById("from") as HTMLInputElement;
    let to = document.getElementById("to") as HTMLInputElement;

    generateByVisitors?.addEventListener("click", async () => {
        let data = await getGifts(from.valueAsDate, to.valueAsDate);
        let csv = "Дата, Количество вещей, Номер телефона/паспорта, Номер анкеты, Нарушение, Колличество имен";
        for (let code in itemNames) {
            csv += ', ' + itemNames[code];
        }
        csv += "\r\n";
        for (let gift of data) {
            if (gift.date) {
                csv += new Date(gift.date).toLocaleDateString() + ", " +
                    (gift.items?.length ?? 0) + ", " +
                    gift.phone + ", " + 
                    gift.id + ", " +
                    gift.offender + ", ";
                let itemsMap = {} as any;
                let personsMap = {} as any;
                for (let item of gift.items) {
                    let itemCode;
                    if (typeof(item) == "object") {
                        itemCode = item.id;
                        personsMap[item.person] = personsMap[item.person] ?? 0;
                        personsMap[item.person]++;
                    } else {
                        itemCode = item;
                    }
                    itemsMap[itemCode] = itemsMap[itemCode] ?? 0;
                    itemsMap[itemCode]++;
                }
                csv += Object.keys(personsMap).length + ', ';
                for (let code in itemNames) {
                    csv += (itemsMap[code] ?? 0) + ', ';
                }
                csv += "\r\n";
            }
        }
        let fileName = getFileName("visitors", from, to);
        download(fileName, csv);
    });    

    const reportByDays = async (noSpecial: boolean) => {
        let data = await getGifts(from.valueAsDate, to.valueAsDate);
        let daysData: { [key: string]: any[] } = {};
        for (let gift of data) {
            if (gift.offender && noSpecial) {
                continue;
            }
            if (gift.date) {
                let key = gift.date.toLocaleDateString();
                daysData[key] = daysData[key] || [];
                daysData[key].push(gift);
            }
        }
        let csv = "Дата, Количество посетителей, Количество вещей" + "\r\n";
        for (let day in daysData) {            
            csv += day + ", " +
                daysData[day].length + ", " +
                daysData[day].reduce((a, b) => a + b.items?.length, 0) +
                "\r\n";
        }
        let fileName = getFileName("days" + (noSpecial ? " no special" : ""), from, to);
        download(fileName, csv);
    }
    generateByDays?.addEventListener("click", () => reportByDays(false));
    
    
    generateByCategories?.addEventListener("click", async () => {
        let data = await getGifts(from.valueAsDate, to.valueAsDate);
        let categoriesData: { [key: string]: { count: number, visitors: number } } = {};
        for (let gift of data) {
            if (gift.items) {
                let visitorUniqueItems: string[] = [];
                for (let item of gift.items) {
                    let category = item as string;
                    if (typeof(item) === "object") {
                        category = (item as GiftItem).id;
                    }
                    categoriesData[category] = categoriesData[category] || { count: 0, visitors: 0 };
                    categoriesData[category].count += 1;
                    if (!visitorUniqueItems.includes(category)) {
                        categoriesData[category].visitors += 1;
                        visitorUniqueItems.push(category);
                    }
                }
            }
        }
        let csv = "Категория, Количество вещей выдано, Количество посетителей взяли" + "\r\n";
        for (let category in categoriesData) {            
            csv += (itemNames[category] ?? category) + ", " +
                categoriesData[category].count + ", " +
                categoriesData[category].visitors +
                "\r\n";
        }
        let fileName = getFileName("categories", from, to);
        download(fileName, csv);
    });   
    
}

function getFileName(baseName: string, from: HTMLInputElement, to: HTMLInputElement) {
    let fileName = baseName;
    if (from.valueAsDate) {
        fileName += " from " + from.valueAsDate.toLocaleDateString();
    }
    if (to.valueAsDate) {
        fileName += " to " + to.valueAsDate.toLocaleDateString();
    }
    fileName += ".csv";
    return fileName;
}

function download(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }