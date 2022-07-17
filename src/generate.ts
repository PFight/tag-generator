import JsBarcode from "jsbarcode";
import { AGE_PARAM, CATEGORY_PARAM, COUNT_PARAM, GENDER_PARAM, GenerateOptions, QUALITY_PARAM, SIZE_PARAM, START_PARAM, STYLE_PARAM, TEMPLATE_PARAM } from "interfaces";
import { ageLocalization, categoryLocalization, genderLocalization, qualityLocalization, sizeLocalization, styleLocalization } from "localization";



export function generate(templateSelector: string, start: number, count: number, options: GenerateOptions) {
    document.querySelector<HTMLElement>("#settings")!.style.display = "none";
    document.querySelector<HTMLElement>("#loading")!.style.display = "none";
    
    let print = document.querySelector<HTMLElement>("#print")!;

    let template = document.querySelector<HTMLTemplateElement>(templateSelector);
    if (template) {
        for (let i = start; i < (start + count); i++) {
            let clone = document.importNode(template.content, true);

            // Render QR code
            let code = clone.querySelector(".code");
            JsBarcode(code).options({
                height: 70,
                fontSize: 25
            })
            .CODE128(i.toString(), {})
            .render();

            const age = clone.querySelector('#' + AGE_PARAM + "Value")!;
            age.textContent = ageLocalization[options.age as string];

            const gender = clone.querySelector('#' + GENDER_PARAM + "Value")!;
            gender.textContent = genderLocalization[options.gender as string];

            const category = clone.querySelector('#' + CATEGORY_PARAM + "Value")!;
            category.textContent = categoryLocalization[options.category as string];

            const size = clone.querySelector('#' + SIZE_PARAM + "Value")!;
            size.textContent = sizeLocalization[options.age as string][options.gender as string][options.size as string];

            const style = clone.querySelector('#' + STYLE_PARAM + "Value")!;
            style.textContent = styleLocalization[options.style as string];

            const quality = clone.querySelector('#' + QUALITY_PARAM + "Value")!;
            quality.textContent = qualityLocalization[options.quality as string];

            print.appendChild(clone);
        }
        window.print();
    } else {
        alert("Template not found!");
    }
}
