import type { AskPhrases } from "./types";

export const fr = {
  bounded: true,
  phrases: [
    "dis-moi",
    "dites-moi",
    "tiens-moi au courant",
    "tenez-moi au courant",
    "fais-moi savoir",
    "faites-moi savoir",
    "fais-moi signe",
    "faites-moi signe",
    "souhaitez-vous",
    "souhaites-tu",
    "voulez-vous que",
    "veux-tu que",
    "prêt pour relecture",
    "prête pour relecture",
    "prêt pour revue",
    "prête pour revue",
    "pour votre relecture",
    "pour ta relecture",
    "à toi de décider",
    "à vous de décider",
  ],
} as const satisfies AskPhrases;
