import { getGifts } from "firebase";
import { Gift, GiftItem } from "interfaces";
import { itemNames } from "items";

export async function generateReport() {
    let generateByVisitors = document.getElementById("generateByVisitors");
    let generateByDays = document.getElementById("generateByDays");
    let generateByDaysNoSpecial = document.getElementById("generateByDaysNoSpecial")
    let generateByCategories = document.getElementById("generateByCategories");
    let generateByDublicates = document.getElementById("generateByDublicates");
    let from = document.getElementById("from") as HTMLInputElement;
    let to = document.getElementById("to") as HTMLInputElement;

    generateByVisitors?.addEventListener("click", async () => {
        let data = await getGifts(from.valueAsDate, to.valueAsDate);
        let csv = "Дата, Количество вещей, Номер, Нарушение, Вещи" + "\r\n";
        for (let gift of data) {
            if (gift.date) {
                csv += new Date(gift.date).toLocaleDateString() + ", " +
                    (gift.items?.length ?? 0) + ", " +
                    gift.phone + ", " + 
                    gift.offender + ", " + 
                    (gift.items.map(i => JSON.stringify(i))?.join(' ') ?? "") +
                    "\r\n";
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
    generateByDaysNoSpecial?.addEventListener("click", () => reportByDays(true));
    
    
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

    generateByDublicates?.addEventListener("click", async () => {
        let data = await getGifts(from.valueAsDate, to.valueAsDate);
        let csv = "Дата, Количество вещей, Номер, Нарушение, Вещи" + "\r\n";
        let dublicates = [] as Gift[];
        for (let gift1 of data) {
            for (let gift2 of data) {
                if (gift1 !== gift2 &&
                    gift1.date && gift2.date &&
                    gift1.date.getTime() == gift2.date.getTime() &&
                    gift1.phone == gift2.phone &&
                    JSON.stringify(gift1.items) == JSON.stringify(gift2.items)) {
                    dublicates.push(gift1);
                }
            }
        }
        for (let gift of dublicates) {
            if (gift.date) {
                csv += new Date(gift.date).toLocaleDateString() + ", " +
                    (gift.items?.length ?? 0) + ", " +
                    gift.phone + ", " + 
                    gift.offender + ", " + 
                    JSON.stringify(gift.items)?.replace(',', ';') +
                    "\r\n";
            }
        }
        let fileName = getFileName("dublicates", from, to);
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