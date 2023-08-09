import { removeDiacritics } from "./lib/node-diacritics";
import { removeAccents } from "./lib/remove-accents";
import { convertAesthetic } from "./lib/aesthetic";

export const normalize = (str: string): string => {
  str = convertAesthetic(str)
  str = removeAccents(str)
  str = removeDiacritics(str)
  return str
}

export default {
  normalize,
}
