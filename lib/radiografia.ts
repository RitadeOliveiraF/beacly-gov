export interface IlhaData {
  name: string
  total: number
  restaurante: number
  cafe: number
  barPub: number
  fastFood: number
  pastelaria: number
  geladosSumos: number
  mapped?: boolean
}

export const AZORES_HORECA: IlhaData[] = [
  { name: "São Miguel", total: 820, restaurante: 363, cafe: 173, barPub: 133, fastFood: 83, pastelaria: 55, geladosSumos: 14 },
  { name: "Terceira", total: 331, restaurante: 167, cafe: 56, barPub: 50, fastFood: 23, pastelaria: 32, geladosSumos: 4 },
  { name: "Pico", total: 149, restaurante: 68, cafe: 24, barPub: 33, fastFood: 8, pastelaria: 12, geladosSumos: 4, mapped: true },
  { name: "Faial", total: 112, restaurante: 52, cafe: 17, barPub: 14, fastFood: 9, pastelaria: 19, geladosSumos: 1, mapped: true },
  { name: "São Jorge", total: 75, restaurante: 35, cafe: 18, barPub: 8, fastFood: 7, pastelaria: 5, geladosSumos: 2 },
  { name: "Santa Maria", total: 52, restaurante: 27, cafe: 7, barPub: 14, fastFood: 1, pastelaria: 3, geladosSumos: 0 },
  { name: "Flores", total: 44, restaurante: 21, cafe: 10, barPub: 5, fastFood: 6, pastelaria: 2, geladosSumos: 0 },
  { name: "Graciosa", total: 38, restaurante: 15, cafe: 4, barPub: 7, fastFood: 4, pastelaria: 8, geladosSumos: 0 },
  { name: "Corvo", total: 6, restaurante: 2, cafe: 0, barPub: 0, fastFood: 3, pastelaria: 1, geladosSumos: 0 },
]

export const AZORES_TOTALS = {
  total: 1627,
  restaurante: 750,
  cafe: 309,
  barPub: 264,
  fastFood: 144,
  pastelaria: 137,
  geladosSumos: 25,
  ilhas: 9,
}
