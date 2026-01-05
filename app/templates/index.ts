// templates/index.ts

import { templateConfig as hairConfig } from "./hairsalon/config";
// app/templates/index.ts

import { defaultData as hair } from "./hairsalon/defaultData";
import { defaultData as cleaning } from "./cleaning/defaultData";

export const templates = {
  hairsalon: { defaultData: hair },
  cleaning: { defaultData: cleaning },
};

