// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
import "firebase/firestore";
import Firebase from "firebase/index";
import { GenerateOptions, Generation, Gift, GiftItem } from "interfaces";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjSSoXs-xNIyq310lsCzVcYu8Zz9puiPQ",
  authDomain: "tag-generator-3.firebaseapp.com",
  projectId: "tag-generator-3",
  storageBucket: "tag-generator-3.appspot.com",
  messagingSenderId: "25589238377",
  appId: "1:25589238377:web:b089f263d21e9b18d330f8"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

export async function getLastGeneration(): Promise<Generation> {
    let latest = await firebase.firestore().doc("generation/latest").get();
    return {
        start: latest.get("start"),
        end: latest.get("end"),
        template: latest.get("template"),
        userId: latest.get("userId"),
        userName: latest.get("userName")
    };
}

export async function getItem(num: number): Promise<any> {
    let item = await firebase.firestore().doc(`items/${num}`).get();
    return makeGenerationModel(item);
}

function makeGenerationModel(doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData | undefined>): any {
    return {
        start: doc.get("start"),
        end: doc.get("end"),
        template: doc.get("template"),
        userId: doc.get("userId"),
        userName: doc.get("userName"),
        age: doc.get("age"),
        style: doc.get("style"),
        category: doc.get("category"),
        gender: doc.get("gender"),
        quality: doc.get("quality"),
        size: doc.get("size")
    };
}

export async function fillItemsFromGenerations() {
    let generation = await firebase.firestore().collection("generation");
    let generations = await generation.get();
    for (var gen of generations.docs) {
        if (gen.id !== "latest") {
            await createItems(makeGenerationModel(gen));
        }
    }
}

export async function saveLastGeneration(gen: Generation & GenerateOptions) {
    let latestDoc = firebase.firestore().doc("generation/latest");
    let latest = await firebase.firestore().doc("generation/latest").get();
    if (latest.get("end") > gen.end) {
        throw Error("Выделенные номера уже заняты. Пожалуйста, обновите страницу и попробуйте снова.");
    }
    await latestDoc.set(gen);

    let historyRecort = firebase.firestore().collection("generation").doc();
    await historyRecort.set(gen);

    await createItems(gen);
}

async function createItems(gen: Generation & GenerateOptions) {
    for (let i = gen.start; i <= gen.end; i++) {
        let item = firebase.firestore().collection("items").doc(i.toString());
        await item.set({
            age: gen.age,
            gender: gen.gender,
            category: gen.category,
            size: gen.size,
            style: gen.style,
            quality: gen.quality,
            template: gen.template
        });
    }
}

export async function saveGift(gift: Gift) {
    if (!gift.id) {
        let latest = firebase.firestore().collection("gifts").doc("latest");
        let latestGift = await latest.get();
        gift.id = (latestGift.get("code") + 1).toString();
        await latestGift.ref.set({
            code: latestGift.get("code") + 1
        });
    }

    let doc = firebase.firestore().collection("gifts").doc(gift.id);
    await doc.set({
        fio: gift.fio,
        phone: gift.phone,
        passport: gift.passport,
        date: gift.date,
        items: gift.items,
        offender: gift.offender
    });
    return gift.id;
}

export async function getGifts(from?: Date | null, to?: Date | null): Promise<Gift[]> {
    let giftsRequest = firebase.firestore().collection("gifts") as firebase.firestore.Query<any>;
    if (from) {
       giftsRequest = giftsRequest.where("date", ">=", from);
    }
    if (to) {
        giftsRequest = giftsRequest.where("date", "<=", to);
    }
    let gifts = await giftsRequest.get();
    var result = [] as Gift[];
    for (var gen of gifts.docs) {
        result.push({
            id: gen.id,
            fio: "",
            phone: gen.get("phone"),
            passport: gen.get("passport"),
            items: getGiftItems(gen),
            date: gen.get("date")?.toDate(),
            offender: gen.get("offender")
        });
    }
    return result;
}

export async function getGift(id: string): Promise<Gift> {
    let gift = await firebase.firestore().collection("gifts").doc(id).get();

    return {
        id: gift.id,
        fio: "",
        phone: gift.get("phone"),
        passport: gift.get("passport"),
        items: getGiftItems(gift),
        date: gift.get("date")?.toDate() as Date,
        offender: gift.get("offender")
    };
}

export async function getVisitorGifts(phone: string, passport: string): Promise<Gift[]> {
    let giftsRequest = firebase.firestore().collection("gifts")
        .where("phone", "==", phone) as firebase.firestore.Query<any>;
    let giftsRequest2 = firebase.firestore().collection("gifts")
        .where("passport", "==", passport) as firebase.firestore.Query<any>;
    let gifts = [] as any[];
    if (phone) {
        gifts = [...gifts, ...(await giftsRequest.get()).docs];
    }
    if (passport) {
        gifts = [...gifts, ...(await giftsRequest2.get()).docs];
    }
    var result = [];
    for (var gift of gifts) {
        result.push({
            id: gift.id,
            fio: '',
            phone: gift.get("phone") as string,
            passport: gift.get("passport") as string,
            items: getGiftItems(gift),
            date: gift.get("date")?.toDate() as Date,
            offender: gift.get("offender")
        });
    }
    return result;
}

function getGiftItems(gen: firebase.firestore.QueryDocumentSnapshot<any>) {
    return (gen.get("items") as string[]).map(x => {
        try { return JSON.parse(x) } catch { return x } 
    }) as (GiftItem | number | string)[];
}

const namesKey = "VisitorNames";

export async function getNames(): Promise<string[]> {
    var namesLocalStorage = localStorage.getItem(namesKey);
    if (namesLocalStorage) {
        return JSON.parse(namesLocalStorage);
    } else {
        let namesRequest = firebase.firestore().collection("names") as firebase.firestore.Query<any>;
        let names = await namesRequest.get();
        var result = [];
        for (var name of names.docs) {
            result.push(name.get("name"));
        }
        localStorage.setItem(namesKey, JSON.stringify(result));
        return result;
    }
}

export async function addNames(names: string[]): Promise<void> {
    let namesCollection = firebase.firestore().collection("names");
    for (let name of names) {
        await namesCollection.doc().set({ name: name });
    }
    var namesLocalStorage = localStorage.getItem(namesKey);
    if (namesLocalStorage) {
        let allNames = JSON.parse(namesLocalStorage);
        names.forEach(x => allNames.push(x));
        localStorage.setItem(namesKey, JSON.stringify(allNames));
    }
}