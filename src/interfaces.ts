export interface Generation {
    start: number; 
    end: number;
    template: string;
    userId: string;
    userName: string;
}

export interface GenerateOptions {
    age: string | null;
    gender: string | null;
    category: string | null;
    size: string | null;
    style: string | null;
    quality: string | null;
}

export interface Gift {
    id: string;
    fio: string;
    phone: string;
    date: Date;
    items: (number | string | GiftItem)[];
}

export interface GiftItem {
    person: string;
    id: string;
}

export const START_PARAM = "start";
export const COUNT_PARAM = "count";
export const TEMPLATE_PARAM = "template";
export const AGE_PARAM = "age";
export const GENDER_PARAM = "gender";
export const CATEGORY_PARAM = "category";
export const SIZE_PARAM = "size";
export const STYLE_PARAM = "style";
export const QUALITY_PARAM = "quality";