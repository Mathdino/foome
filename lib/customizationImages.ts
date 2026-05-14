import { images } from "@/constants";

const map: Record<string, any> = {
  // toppings
  "queijo extra": images.cheese,
  cebola: images.onions,
  cogumelos: images.mushrooms,
  tomates: images.tomatoes,
  bacon: images.bacon,
  abacate: images.avocado,
  azeitonas: images.azeitona,
  jalapeños: images.jalapenos,
  // sides
  "batata frita": images.fries,
  "batata rústica": images.batataru,
  salada: images.salad,
  "palito de mussarela": images.mozarellaSticks,
  "anéis de cebola": images.onionRings,
  coleslaw: images.coleslaw,
  "coca-cola": images.cocacola,
  "chá gelado": images.cha,
  "pão de alho": images.paodealho,
  "nuggets de frango": images.nuggets,
  "milho verde": images.milho,
  "bolo de chocolate quente": images.bolo,
};

export const getCustomizationImage = (name: string) => {
  const key = name.trim().toLowerCase();
  return map[key] ?? images.emptyState;
};
