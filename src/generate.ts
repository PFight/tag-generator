import JsBarcode from "jsbarcode";
import { AGE_PARAM, CATEGORY_PARAM, COUNT_PARAM, GENDER_PARAM, GenerateOptions, QUALITY_PARAM, SIZE_PARAM, START_PARAM, STYLE_PARAM, TEMPLATE_PARAM } from "interfaces";
import { ageLocalization, categoryLocalization, genderLocalization, qualityLocalization, sizeLocalization, styleLocalization } from "localization";

const NUMBERS_ITEM = "Numbers";

export function generate(templateSelector: string, count: number) {
    document.querySelector<HTMLElement>("#settings")!.style.display = "none";
    document.querySelector<HTMLElement>("#loading")!.style.display = "none";
    
    let print = document.querySelector<HTMLElement>("#print")!;
    let numbers = JSON.parse(localStorage.getItem(NUMBERS_ITEM) || "[]");

    let template = document.querySelector<HTMLTemplateElement>(templateSelector);
    if (template) {
        for (let i = 0; i < count; i++) {
            let clone = document.importNode(template.content, true);
            let number = "";
            do  {
                number = Math.round(999999 * Math.random()).toString();
                while (number.length < 6) {
                    number = "0" + number;
                }
            } while (numbers.includes(number));
            numbers.push(number);

            // Render QR code
            let code = clone.querySelector(".code");
            JsBarcode(code).options({
                height: 40,
                fontSize: 20
            })
            .CODE128(number.toString(), {})
            .render();

            print.appendChild(clone);
        }
        //window.print();
        //window.onafterprint = () => window.close();
    } else {
        alert("Template not found!");
    }

    localStorage.setItem(NUMBERS_ITEM, JSON.stringify(numbers));
}
