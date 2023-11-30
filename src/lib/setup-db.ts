import {createClient} from "@supabase/supabase-js";
import type {Database} from "$lib/db-types-generated";

const setupClient = () => {
    return createClient<Database>(
        'https://mwakhqeticwltzxnyajr.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13YWtocWV0aWN3bHR6eG55YWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDEzMzU3NTUsImV4cCI6MjAxNjkxMTc1NX0.EV_pDpb8F4popC49fGaN6dD3DqNuiakdrMaC7hq6oNc'
    );
}

export const supa = setupClient();