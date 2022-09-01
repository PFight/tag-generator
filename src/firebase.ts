// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
import "firebase/firestore";
import { GenerateOptions, Generation } from "interfaces";

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
