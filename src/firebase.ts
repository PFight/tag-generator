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
        date: gift.date,
        items: gift.items
    });
    return gift.id;
}

export async function getGifts(from?: Date | null, to?: Date | null) {
    let giftsRequest = firebase.firestore().collection("gifts") as firebase.firestore.Query<any>;
    if (from) {
       giftsRequest = giftsRequest.where("date", ">=", from);
    }
    if (to) {
        giftsRequest = giftsRequest.where("date", "<=", to);
    }
    let gifts = await giftsRequest.get();
    var result = [];
    for (var gen of gifts.docs) {
        result.push({
            phone: gen.get("phone"),
            items: gen.get("items"),
            date: gen.get("date")?.toDate()
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
        items: getGiftItems(gift),
        date: gift.get("date")?.toDate() as Date
    };
}

export async function getVisitorGifts(code: string): Promise<Gift[]> {
    let giftsRequest = firebase.firestore().collection("gifts")
        .where("phone", "==", code) as firebase.firestore.Query<any>;
    let gifts = await giftsRequest.get();
    var result = [];
    for (var gift of gifts.docs) {
        result.push({
            id: gift.id,
            fio: '',
            phone: gift.get("phone") as string,
            items: getGiftItems(gift),
            date: gift.get("date")?.toDate() as Date
        });
    }
    return result;
}

function getGiftItems(gen: firebase.firestore.QueryDocumentSnapshot<any>) {
    return (gen.get("items") as string[]).map(x => JSON.parse(x)) as (GiftItem | number | string)[];
}
