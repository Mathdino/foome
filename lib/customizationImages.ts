import { images } from "@/constants";

const map: Record<string, any> = {
  // toppings
  "queijo extra": images.cheese,
  cebola: images.onions,
  cogumelos: images.mushrooms,
  tomates: images.tomatoes,
  bacon: images.bacon,
  abacate: images.avocado,
  azeitonas: images.tomatoes,
  jalapeños: images.tomatoes,
  // sides
  "batata frita": images.fries,
  "batata rústica": images.fries,
  salada: images.salad,
  "palito de mussarela": images.mozarellaSticks,
  "anéis de cebola": images.onionRings,
  coleslaw: images.coleslaw,
  "coca-cola": images.fries,
  "chá gelado": images.fries,
  "pão de alho": images.fries,
  "nuggets de frango": images.fries,
  "milho verde": images.fries,
  "bolo de chocolate quente": images.fries,
};

export const getCustomizationImage = (name: string) => {
  const key = name.trim().toLowerCase();
  return map[key] ?? images.emptyState;
};
