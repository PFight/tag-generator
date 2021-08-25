export declare var JsBarcode: any;

export function generate(templateSelector: string, start: number, count: number) {
    document.querySelector<HTMLElement>("#settings")!.style.display = "none";
    document.querySelector<HTMLElement>("#loading")!.style.display = "none";
    
    let print = document.querySelector<HTMLElement>("#print")!;

    let template = document.querySelector<HTMLTemplateElement>(templateSelector);
    if (template) {
        let code = template.content.querySelector(".code");
        for (let i = start; i < (start + count); i++) {
            JsBarcode(code, i, {
                height: 35,
                fontSize: 12
            });
            let clone = document.importNode(template.content, true);
            print.appendChild(clone);
        }
        window.print();
    } else {
        alert("Template not found!");
    }
}
