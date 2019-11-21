import { writable } from "svelte/store";

export function getCredentials() {
    try {
        return JSON.parse(localStorage.getItem("credentials")) || {};
    } catch (e) {
        console.error(e);
        return {};
    }
}

const cred = getCredentials();

export const credentials = writable(cred);

let listeners = [];

credentials.subscribe(val => {
    localStorage.setItem("credentials", JSON.stringify(val));
    listeners.forEach(async listener => await listener());
});
export const subscribeToChanges = subscription => {
    const cred = getCredentials();
    if (cred.key && cred.secret) subscription();
    listeners = [...listeners, subscription];
};
