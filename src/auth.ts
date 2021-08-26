import createAuth0Client, { Auth0Client } from "@auth0/auth0-spa-js";

export interface User {
    id: string;
    name: string;
}

let auth0: Auth0Client;
    
let redirectUri: string = window.location.origin + (window.location.href.includes("github.io") ? "/tag-generator/" : "");

export async function login() {
    if (!auth0) {
        await getAuthentication();
    }
    auth0?.loginWithRedirect({ redirect_uri: redirectUri });
}

export async function logout() {
    if (!auth0) {
        await getAuthentication();
    }
    auth0?.logout({ returnTo: redirectUri });
}

export async function getAuthentication(): Promise<User | null> {
    try {
        auth0 = await createAuth0Client({
            domain: "syncretic.eu.auth0.com",
            client_id: "T7k8XmfXePV5zkd8mPOmgB3nv5nyr66I",
            redirectUri: redirectUri
        });
        const query = window.location.search;
        if (query.includes("code=") && query.includes("state=")) {

            // Process the login state
            await auth0.handleRedirectCallback();

            // Use replaceState to redirect the user away and remove the querystring parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        let isAuthenticated = await auth0.isAuthenticated();
        let user = await auth0?.getUser();
        let fio = (isAuthenticated && user!.given_name && user!.family_name) ? user!.given_name + " " + user!.family_name : null;
        return isAuthenticated ? 
            { 
                name: fio || user!.name || user!.nickname || user!.given_name || user!.user_id, 
                id: user!.user_id || user!.sub
            } 
            : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}