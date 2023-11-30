import {writable} from "svelte/store";
import {supa} from "$lib/setup-db";

export const isSignedIn = writable(false);
supa.auth.onAuthStateChange((event, session) => {
    isSignedIn.set(!!session);
});