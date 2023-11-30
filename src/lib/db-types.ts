import type {Database} from "$lib/db-types-generated";

export * from "./db-types-generated";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type User = Database["public"]["Tables"]["profiles"]["Row"];