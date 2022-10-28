import { getGifts } from "firebase";
import { itemNames } from "items";

export async function generateReport() {
    let generateByVisitors = document.getElementById("generateByVisitors");
    let generateByDays = document.getElementById("generateByDays");
    let generateByCategories = document.getElementById("generateByCategories");
    let from = document.getElementById("from") as HTMLInputElement;
    let to = document.getElementById("to") as HTMLInputElement;

    generateByVisitors?.addEventListener("click", async () => {
        let data = await getGifts(from.valueAsDate, to.valueAsDate);
        let csv = "Дата, Количество вещей, Номер, Вещи" + "\r\n";
        for (let gift of data) {
            if (gift.date) {
                csv += new Date(gift.date).toLocaleDateString() + ", " +
                    (gift.items?.length ?? 0) + ", " +
                    gift.phone + ", " + 
                    (gift.items?.join(' ') ?? "") +
                    "\r\n";
            }
        }
        let fileName = getFileName("visitors", from, to);
        download(fileName, csv);
    });    

    generateByDays?.addEventListener("click", async () => {
        let data = await getGifts(from.valueAsDate, to.valueAsDate);
        let daysData: { [key: string]: any[] } = {};
        for (let gift of data) {
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
        let fileName = getFileName("days", from, to);
        download(fileName, csv);
    });
    
    generateByCategories?.addEventListener("click", async () => {
        let data = await getGifts(from.valueAsDate, to.valueAsDate);
        let categoriesData: { [key: string]: { count: number, visitors: number } } = {};
        for (let gift of data) {
            if (gift.items) {
                let visitorUniqueItems: string[] = [];
                for (let item of gift.items) {
                    categoriesData[item] = categoriesData[item] || { count: 0, visitors: 0 };
                    categoriesData[item].count += 1;
                    if (!visitorUniqueItems.includes(item)) {
                        categoriesData[item].visitors += 1;
                        visitorUniqueItems.push(item);
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