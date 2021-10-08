// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
import "firebase/firestore";
import { Generation } from "interfaces";

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


export async function saveLastGeneration(gen: Generation) {
    let latestDoc = firebase.firestore().doc("generation/latest");
    let latest = await firebase.firestore().doc("generation/latest").get();
    if (latest.get("end") > gen.end) {
        throw Error("Выделенные номера уже заняты. Пожалуйста, обновите страницу и попробуйте снова.");
    }
    await latestDoc.set(gen);

    let historyRecort = firebase.firestore().collection("generation").doc();
    await historyRecort.set(gen);
}