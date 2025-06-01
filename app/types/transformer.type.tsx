import type { TAbility } from "./ability.type";

export type TTransformer = {
    id: string;
    name: string;
    faction: string;
    icon: string;
    health: number;
    wins: number;
    losses: number;
    abilities: TAbility[];
}
