import type { Product } from '@/types/product';
import type { Customer } from '@/types/customer';
import type { CheckoutOrder } from '@/types/checkout';

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-1856801cl16",
    "sku": "18-56801CL16",
    "normalizedSku": "1856801CL16",
    "barcode": "6978974141750",
    "brand": "Burago",
    "name": "Ferrari SF-25 CL16",
    "scale": "1:64",
    "listPrice": 350,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-04-03T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-04-03T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "prod-1856801lh44",
    "sku": "18-56801LH44",
    "normalizedSku": "1856801LH44",
    "barcode": "6978974141767",
    "brand": "Burago",
    "name": "Ferrari SF-25 LH44",
    "scale": "1:64",
    "listPrice": 350,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-03T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-04-03T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "prod-1858001ln4",
    "sku": "18-58001LN4",
    "normalizedSku": "1858001LN4",
    "barcode": "6978974141774",
    "brand": "Burago",
    "name": "McLaren MCL39 Australian GP 2025 LN4",
    "scale": "1:64",
    "listPrice": 350,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-03T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-04-03T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "prod-1858002ka12",
    "sku": "18-58002KA12",
    "normalizedSku": "1858002KA12",
    "barcode": "6978974141798",
    "brand": "Burago",
    "name": "Mercedes AMG W16 KA12",
    "scale": "1:64",
    "listPrice": 350,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-03T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-04-03T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "prod-1858003mv1",
    "sku": "18-58003MV1",
    "normalizedSku": "1858003MV1",
    "barcode": "6978974141811",
    "brand": "Burago",
    "name": "Red Bull RB21 MV1",
    "scale": "1:64",
    "listPrice": 350,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-03T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-04-03T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "prod-3870",
    "sku": "3870",
    "normalizedSku": "3870",
    "barcode": "4573448908703",
    "brand": "IG-Model",
    "name": "RWB 993 Black",
    "scale": "1:64",
    "listPrice": 750,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-840456307557",
    "sku": "840456307557",
    "normalizedSku": "840456307557",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT 840456307557",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2402",
    "sku": "AD-2402",
    "normalizedSku": "AD2402",
    "barcode": "685457410437",
    "brand": "american Diorama",
    "name": "Weekend Warriors",
    "scale": "配件周邊",
    "listPrice": 420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2415",
    "sku": "AD-2415",
    "normalizedSku": "AD2415",
    "barcode": "685457430282",
    "brand": "american Diorama",
    "name": "Team Liberty Walk",
    "scale": "配件周邊",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2416",
    "sku": "AD-2416",
    "normalizedSku": "AD2416",
    "barcode": "685457430350",
    "brand": "american Diorama",
    "name": "Canopy Liberty Walk",
    "scale": "配件周邊",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2428",
    "sku": "AD-2428",
    "normalizedSku": "AD2428",
    "barcode": "850068806133",
    "brand": "american diorama",
    "name": "1:64 Figure Set: Behind the Scenes 2\n (Include 4 figures & 5 accessories total 9 pieces)",
    "scale": "配件周邊",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2429",
    "sku": "AD-2429",
    "normalizedSku": "AD2429",
    "barcode": "850068806195",
    "brand": "american diorama",
    "name": "1:64 Figure Set: Curbside Crowd",
    "scale": "配件周邊",
    "listPrice": 460,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2430",
    "sku": "AD-2430",
    "normalizedSku": "AD2430",
    "barcode": "850068806201",
    "brand": "american diorama",
    "name": "1:64 Figure Set: Hanging Out 3",
    "scale": "配件周邊",
    "listPrice": 460,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2431",
    "sku": "AD-2431",
    "normalizedSku": "AD2431",
    "barcode": "850068806218",
    "brand": "american diorama",
    "name": "1:64 Figure Set: Heavy Lifters",
    "scale": "配件周邊",
    "listPrice": 590,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2432",
    "sku": "AD-2432",
    "normalizedSku": "AD2432",
    "barcode": "850068806225",
    "brand": "american diorama",
    "name": "1:64 Figure Set: Car Meet 5",
    "scale": "配件周邊",
    "listPrice": 460,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ad2437",
    "sku": "AD-2437",
    "normalizedSku": "AD2437",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT AD-2437",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-adlbkuma05",
    "sku": "AD-LBKUMA05",
    "normalizedSku": "ADLBKUMA05",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT AD-LBKUMA05",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-adlbkuma01",
    "sku": "AD-LBKuma01",
    "normalizedSku": "ADLBKUMA01",
    "barcode": "850068806003",
    "brand": "american diorama",
    "name": "Liberty Walk Kuma 400% Style 01 (28cm)",
    "scale": "配件周邊",
    "listPrice": 3600,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-adlbkuma02",
    "sku": "AD-LBKuma02",
    "normalizedSku": "ADLBKUMA02",
    "barcode": "850068806010",
    "brand": "american diorama",
    "name": "Liberty Walk Kuma 400% Style 02 (28cm)",
    "scale": "配件周邊",
    "listPrice": 3600,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-adlbkuma03",
    "sku": "AD-LBKuma03",
    "normalizedSku": "ADLBKUMA03",
    "barcode": "850068806027",
    "brand": "american diorama",
    "name": "Liberty Walk Kuma 400% Style 03 (28cm)",
    "scale": "配件周邊",
    "listPrice": 3600,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrdie6404",
    "sku": "BBRDIE6404",
    "normalizedSku": "BBRDIE6404",
    "barcode": "8053614070350",
    "brand": "BBR",
    "name": "Maserati MC20 Giallo Genio",
    "scale": "1:64",
    "listPrice": 570,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrdie6407",
    "sku": "BBRDIE6407",
    "normalizedSku": "BBRDIE6407",
    "barcode": "8053614078837",
    "brand": "BBR",
    "name": "Maserati MC20 #2 Maserati Performance Experience",
    "scale": "1:64",
    "listPrice": 580,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrdie6414",
    "sku": "BBRDIE6414",
    "normalizedSku": "BBRDIE6414",
    "barcode": "8053614078875",
    "brand": "BBR",
    "name": "Maserati MC12 Stradale 白",
    "scale": "1:64",
    "listPrice": 570,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrdie6417",
    "sku": "BBRDIE6417",
    "normalizedSku": "BBRDIE6417",
    "barcode": "8053614078905",
    "brand": "BBR",
    "name": "Maserati MC12 Competizione Test Fiorano 2004",
    "scale": "1:64",
    "listPrice": 580,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrdie6421",
    "sku": "BBRDIE6421",
    "normalizedSku": "BBRDIE6421",
    "barcode": "8053614078943",
    "brand": "BBR",
    "name": "Maserati MC12 Competizione #1 \n Vitaphone Racing Team \n 2008 Spa 24 Hrs. Winner",
    "scale": "1:64",
    "listPrice": 660,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrdie6425",
    "sku": "BBRDIE6425",
    "normalizedSku": "BBRDIE6425",
    "barcode": "8055404898823",
    "brand": "BBR",
    "name": "Alfa Romeo Giulia GTA White",
    "scale": "1:64",
    "listPrice": 580,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrdie6426",
    "sku": "BBRDIE6426",
    "normalizedSku": "BBRDIE6426",
    "barcode": "8055404898816",
    "brand": "BBR",
    "name": "Alfa Romeo Giulia GTAm White",
    "scale": "1:64",
    "listPrice": 580,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrdie6430",
    "sku": "BBRDIE6430",
    "normalizedSku": "BBRDIE6430",
    "barcode": "810152147900",
    "brand": "BBR",
    "name": "Pagani Utopia Presentation Grigio Rinascimento",
    "scale": "1:64",
    "listPrice": 580,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrfer64011",
    "sku": "BBRFER64011",
    "normalizedSku": "BBRFER64011",
    "barcode": "8059037279172",
    "brand": "BBR",
    "name": "Ferrari 812 Competitizone Blu Tour De France",
    "scale": "1:64",
    "listPrice": 820,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrfer64019",
    "sku": "BBRFER64019",
    "normalizedSku": "BBRFER64019",
    "barcode": "8059037279219",
    "brand": "BBR",
    "name": "Ferrari Daytona SP3 Rosso Imola",
    "scale": "1:64",
    "listPrice": 820,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrfer64030",
    "sku": "BBRFER64030",
    "normalizedSku": "BBRFER64030",
    "barcode": "8055404899981",
    "brand": "BBR",
    "name": "Ferrari SF90 Rosso Corsa",
    "scale": "1:64",
    "listPrice": 820,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-bbrfer64031",
    "sku": "BBRFER64031",
    "normalizedSku": "BBRFER64031",
    "barcode": "8055598835826",
    "brand": "BBR",
    "name": "Ferrari SF90 Giallo Modena",
    "scale": "1:64",
    "listPrice": 820,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-cm64720sgt3x01",
    "sku": "CM64-720SGT3X-01",
    "normalizedSku": "CM64720SGT3X01",
    "barcode": "",
    "brand": "CM Model",
    "name": "McLaren 720S GT3X 亮黑色",
    "scale": "1:64",
    "listPrice": 720,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-24T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-24T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-cm64765lt13",
    "sku": "CM64-765LT-13",
    "normalizedSku": "CM64765LT13",
    "barcode": "6972158311809",
    "brand": "CM Model",
    "name": "Mclaren 765LT Fullcarbon 全碳紅",
    "scale": "1:64",
    "listPrice": 670,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-cm64imola05",
    "sku": "CM64-IMOLA-05",
    "normalizedSku": "CM64IMOLA05",
    "barcode": "6972158312905",
    "brand": "CM Model",
    "name": "Pagani Imola 金屬紅",
    "scale": "1:64",
    "listPrice": 690,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-cm64revolucion09",
    "sku": "CM64-REVOLUCION-09",
    "normalizedSku": "CM64REVOLUCION09",
    "barcode": "6972158313711",
    "brand": "CM Model",
    "name": "pagani Zonda Revlucion chameleon 變色龍",
    "scale": "1:64",
    "listPrice": 680,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-cm64sennagtrtw",
    "sku": "CM64-SENNAGTR-TW",
    "normalizedSku": "CM64SENNAGTRTW",
    "barcode": "6972158315241",
    "brand": "CM Model",
    "name": "McLaren Senna GTR 黃",
    "scale": "1:64",
    "listPrice": 760,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-cm64solus08",
    "sku": "CM64-SOLUS-08",
    "normalizedSku": "CM64SOLUS08",
    "barcode": "6972158313544",
    "brand": "CM Model",
    "name": "McLaren Solus GT 金屬紅",
    "scale": "1:64",
    "listPrice": 690,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-customwheels300",
    "sku": "CUSTOM WHEELS 300",
    "normalizedSku": "CUSTOMWHEELS300",
    "barcode": "Custom Wheels 300",
    "brand": "奇駒小豪輪框",
    "name": "輪框",
    "scale": "1:64",
    "listPrice": 300,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-customwheels340",
    "sku": "CUSTOM WHEELS 340",
    "normalizedSku": "CUSTOMWHEELS340",
    "barcode": "Custom Wheels 340",
    "brand": "奇駒小豪輪框",
    "name": "輪框",
    "scale": "1:64",
    "listPrice": 340,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-hj641087w",
    "sku": "HJ641087W",
    "normalizedSku": "HJ641087W",
    "barcode": "4981932075266",
    "brand": "Hobby Japan",
    "name": "Toyota GR YARIS RZ High performance 2024 Super White II",
    "scale": "1:64",
    "listPrice": 700,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-hj643029w",
    "sku": "HJ643029W",
    "normalizedSku": "HJ643029W",
    "barcode": "4981932073262",
    "brand": "Hobby Japan",
    "name": "Honda Civic (AT) Late Ver. /Genuine Optional Parts White",
    "scale": "1:64",
    "listPrice": 790,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-hj643063w",
    "sku": "HJ643063W",
    "normalizedSku": "HJ643063W",
    "barcode": "4981932069760",
    "brand": "Hobby Japan",
    "name": "Honda Civic Type R (FL5) Championship White",
    "scale": "1:64",
    "listPrice": 750,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-hjdm003a9",
    "sku": "HJDM003A-9",
    "normalizedSku": "HJDM003A9",
    "barcode": "4981932070728",
    "brand": "Hobby Japan",
    "name": "Subaru Impreza 22B-STI Version (GC8) Sonic Blue Mica",
    "scale": "1:64",
    "listPrice": 420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ig3881",
    "sku": "IG3881",
    "normalizedSku": "IG3881",
    "barcode": "4573448908819",
    "brand": "IG-Model",
    "name": "Nissan Nismo Omori Factory CRS R34 槍灰",
    "scale": "1:64",
    "listPrice": 790,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-jc64tl009wh",
    "sku": "JC64-TL009-WH",
    "normalizedSku": "JC64TL009WH",
    "barcode": "9581015736296",
    "brand": "J Collection",
    "name": "Honda Prelude [BA4] 白",
    "scale": "1:64",
    "listPrice": 300,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg122",
    "sku": "KHMG122",
    "normalizedSku": "KHMG122",
    "barcode": "810152142165",
    "brand": "KAIDO HOUSE",
    "name": "Datsun 510 Street Nismo V2",
    "scale": "1:64",
    "listPrice": 590,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg156",
    "sku": "KHMG156",
    "normalizedSku": "KHMG156",
    "barcode": "810152146927",
    "brand": "KAIDO HOUSE",
    "name": "Honda Civic (EF) Kaido Works V2",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg158",
    "sku": "KHMG158",
    "normalizedSku": "KHMG158",
    "barcode": "810152146941",
    "brand": "KAIDO HOUSE",
    "name": "Nissan Skyline GT-R (R34) Kaido Works (V2 Aero) SHINJUKU V2",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg163",
    "sku": "KHMG163",
    "normalizedSku": "KHMG163",
    "barcode": "810152146996",
    "brand": "KAIDO HOUSE",
    "name": "Nissan Skyline GT-R (R33) Active Carbon R V2",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg167",
    "sku": "KHMG167",
    "normalizedSku": "KHMG167",
    "barcode": "",
    "brand": "KAIDO HOUSE",
    "name": "Nissan Skyline GT-R (R34) TAMIYA x  KAIDO HOUSE \"The GRASSHOPPER\" V1",
    "scale": "1:64",
    "listPrice": 550,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg167c",
    "sku": "KHMG167C",
    "normalizedSku": "KHMG167C",
    "barcode": "",
    "brand": "KAIDO HOUSE",
    "name": "Chase Nissan Skyline GT-R (R34) TAMIYA x  KAIDO HOUSE \"The GRASSHOPPER\" V1",
    "scale": "1:64",
    "listPrice": 2500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg172",
    "sku": "KHMG172",
    "normalizedSku": "KHMG172",
    "barcode": "810152149867",
    "brand": "KAIDO HOUSE",
    "name": "Nissan Fairlady Z Kaido GT ADVAN",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg173",
    "sku": "KHMG173",
    "normalizedSku": "KHMG173",
    "barcode": "840456300749",
    "brand": "KAIDO HOUSE",
    "name": "Honda NSX Kaido Racing V2",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg174",
    "sku": "KHMG174",
    "normalizedSku": "KHMG174",
    "barcode": "840456301685",
    "brand": "KAIDO HOUSE",
    "name": "Chevrolet Silverado KAIDO HKS V1",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg177",
    "sku": "KHMG177",
    "normalizedSku": "KHMG177",
    "barcode": "840456301708",
    "brand": "KAIDO HOUSE",
    "name": "BMW M3 KaidoHaus V1",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg180",
    "sku": "KHMG180",
    "normalizedSku": "KHMG180",
    "barcode": "840456303801",
    "brand": "KAIDO HOUSE",
    "name": "Toyota AE86 Sprinter Trueno Kaido Street V1",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg180c",
    "sku": "KHMG180C",
    "normalizedSku": "KHMG180C",
    "barcode": "840456303801",
    "brand": "KAIDO HOUSE",
    "name": "Toyota AE86 Sprinter Trueno Kaido Street V1",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg190",
    "sku": "KHMG190",
    "normalizedSku": "KHMG190",
    "barcode": "840456305034",
    "brand": "KAIDO HOUSE",
    "name": "Honda NSX Kaido Test Car Spec V1",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg192",
    "sku": "KHMG192",
    "normalizedSku": "KHMG192",
    "barcode": "840456305072",
    "brand": "KAIDO HOUSE",
    "name": "KHMG192 Chevrolet Silverado Dually Vintage Spec V1 藍",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg192c",
    "sku": "KHMG192C",
    "normalizedSku": "KHMG192C",
    "barcode": "",
    "brand": "KAIDO HOUSE",
    "name": "KHMG192 chase Chevrolet Silverado Dually Vintage Spec V1 藍",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Unknown",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Unknown"
  },
  {
    "id": "prod-khmg196",
    "sku": "KHMG196",
    "normalizedSku": "KHMG196",
    "barcode": "840456306444",
    "brand": "KAIDO HOUSE",
    "name": "KHMG196 Toyota AE86 Sprinter Trueno Kaido Racing V1 藍",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg196c",
    "sku": "KHMG196C",
    "normalizedSku": "KHMG196C",
    "barcode": "",
    "brand": "KAIDO HOUSE",
    "name": "KHMG196 chase Toyota AE86 Sprinter Trueno Kaido Racing V1 藍",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-16T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-16T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "prod-khmg199",
    "sku": "KHMG199",
    "normalizedSku": "KHMG199",
    "barcode": "840456306505",
    "brand": "KAIDO HOUSE",
    "name": "Kaido House BBS Tent V1",
    "scale": "1:64",
    "listPrice": 300,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg208",
    "sku": "KHMG208",
    "normalizedSku": "KHMG208",
    "barcode": "840456308868",
    "brand": "KAIDO HOUSE",
    "name": "Nissan Fairlady Z Kaido GT Police",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg216",
    "sku": "KHMG216",
    "normalizedSku": "KHMG216",
    "barcode": "840456307489",
    "brand": "KAIDO HOUSE",
    "name": "BMW M3 Kaido GT V2",
    "scale": "1:64",
    "listPrice": 630,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg666",
    "sku": "KHMG666",
    "normalizedSku": "KHMG666",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT KHMG666",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg888",
    "sku": "KHMG888",
    "normalizedSku": "KHMG888",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT KHMG888",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-khmg999",
    "sku": "KHMG999",
    "normalizedSku": "KHMG999",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT KHMG999",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-lv216a",
    "sku": "LV-216A",
    "normalizedSku": "LV216A",
    "barcode": "4543736333906",
    "brand": "Tomytec",
    "name": "Toyota Ambulance FS55V 救急車",
    "scale": "1:64",
    "listPrice": 1080,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-lvn10mcelebration",
    "sku": "LV-N 10M CELEBRATION",
    "normalizedSku": "LVN10MCELEBRATION",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT LV-N 10M CELEBRATION",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-lvn158a",
    "sku": "LV-N158A",
    "normalizedSku": "LVN158A",
    "barcode": "4543736284659",
    "brand": "Tomytec",
    "name": "Honda civic type R 白",
    "scale": "1:64",
    "listPrice": 1200,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-lvn238c",
    "sku": "LV-N238C",
    "normalizedSku": "LVN238C",
    "barcode": "4543736320289",
    "brand": "Tomytec",
    "name": "Nissan Laurel 綠",
    "scale": "1:64",
    "listPrice": 750,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-lvn308e",
    "sku": "LV-N308E",
    "normalizedSku": "LVN308E",
    "barcode": "4543736335986",
    "brand": "Tomytec",
    "name": "Nissan Skyline GT-R V-spec LM Limited 冠軍藍 1996 model",
    "scale": "1:64",
    "listPrice": 690,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-lvn327a",
    "sku": "LV-N327A",
    "normalizedSku": "LVN327A",
    "barcode": "4543736328278",
    "brand": "Tomytec",
    "name": "Subaru Forester S/tb 黑",
    "scale": "1:64",
    "listPrice": 850,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-lvnls400g",
    "sku": "LV-NLS400G",
    "normalizedSku": "LVNLS400G",
    "barcode": "4543736337584",
    "brand": "Tomytec",
    "name": "LV-N 1998 LEXUS LS400 (Gold Beige)",
    "scale": "1:64",
    "listPrice": 950,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-04-02T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-02T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-lvnls400w",
    "sku": "LV-NLS400W",
    "normalizedSku": "LVNLS400W",
    "barcode": "4543736337577",
    "brand": "Tomytec",
    "name": "LV-N 1998 LEXUS LS400 (White Silver)",
    "scale": "1:64",
    "listPrice": 950,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-02T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-02T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-m65320",
    "sku": "M65320",
    "normalizedSku": "M65320",
    "barcode": "6974839356338",
    "brand": "MotorHelix",
    "name": "Honda Civic Type R (FL5) HKS Livery Matt Black",
    "scale": "1:64",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-02T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-02T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00055l",
    "sku": "MGT00055-L",
    "normalizedSku": "MGT00055L",
    "barcode": "4895183688536",
    "brand": "MINI GT",
    "name": "BMW M3 E30 #6 Hong Kong Exclusive",
    "scale": "1:64",
    "listPrice": 500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00159mj",
    "sku": "MGT00159-MJ",
    "normalizedSku": "MGT00159MJ",
    "barcode": "4895183681407",
    "brand": "MINI GT",
    "name": "Land Rover Defender 110 British Red Cross Search & Rescue",
    "scale": "1:64",
    "listPrice": 540,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00193l",
    "sku": "MGT00193-L",
    "normalizedSku": "MGT00193L",
    "barcode": "4895183674546",
    "brand": "MINI GT",
    "name": "Lamborghini Huracan EVO Bologna Airport 2020 Follow Me Car",
    "scale": "1:64",
    "listPrice": 360,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00270l",
    "sku": "MGT00270-L",
    "normalizedSku": "MGT00270L",
    "barcode": "4895183682336",
    "brand": "MINI GT",
    "name": "Miata",
    "scale": "1:64",
    "listPrice": 360,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00286l",
    "sku": "MGT00286-L",
    "normalizedSku": "MGT00286L",
    "barcode": "4895183682657",
    "brand": "MINI GT",
    "name": "Bentley Flying Spur Verdant LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00309l",
    "sku": "MGT00309-L",
    "normalizedSku": "MGT00309L",
    "barcode": "4895183683630",
    "brand": "MINI GT",
    "name": "S2000",
    "scale": "1:64",
    "listPrice": 360,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00378l",
    "sku": "MGT00378-L",
    "normalizedSku": "MGT00378L",
    "barcode": "4895183698771",
    "brand": "MINI GT",
    "name": "Land Rover Defender 90 Wagon White LHD",
    "scale": "1:64",
    "listPrice": 360,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00403l",
    "sku": "MGT00403-L",
    "normalizedSku": "MGT00403L",
    "barcode": "4895183674461",
    "brand": "MINI GT",
    "name": "Hyundai Elantra N festival",
    "scale": "1:64",
    "listPrice": 390,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00422l",
    "sku": "MGT00422-L",
    "normalizedSku": "MGT00422L",
    "barcode": "4895183675352",
    "brand": "MINI GT",
    "name": "Lancia Stratos #1 1977 Rally MonteCarlo Winner LHD",
    "scale": "1:64",
    "listPrice": 420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "prod-mgt00428l",
    "sku": "MGT00428-L",
    "normalizedSku": "MGT00428L",
    "barcode": "4895183675673",
    "brand": "MINI GT",
    "name": "Bugatti Chiron Pur Sport Yellow",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00507l",
    "sku": "MGT00507-L",
    "normalizedSku": "MGT00507L",
    "barcode": "4895183673501",
    "brand": "MINI GT",
    "name": "Porsche 911 Targa 4S Heritage Design Edition GT Silver Metallic LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00507mj",
    "sku": "MGT00507-MJ",
    "normalizedSku": "MGT00507MJ",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Porsche 911 Targa 4S Heritage Design Edition GT Silver Metallic LHD / USA Blister Packaging",
    "scale": "1:64",
    "listPrice": 550,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-05-09T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-05-09T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00507mjc",
    "sku": "MGT00507-MJC",
    "normalizedSku": "MGT00507MJC",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Porsche 911 Targa 4S Heritage Design Edition GT Silver Metallic LHD MJ Chase Car / USA Blister Packaging",
    "scale": "1:64",
    "listPrice": 2500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00507r",
    "sku": "MGT00507-R",
    "normalizedSku": "MGT00507R",
    "barcode": "4895183673532",
    "brand": "MINI GT",
    "name": "Porsche 911 Targa 4S Heritage Design Edition GT Silver Metallic RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00522r",
    "sku": "MGT00522-R",
    "normalizedSku": "MGT00522R",
    "barcode": "4895183674010",
    "brand": "MINI GT",
    "name": "Land Rover Defender 110 Mobile Brigade Corps (KORPS BRIMOB) - EMS Exclusive (RHD Only)",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00583l",
    "sku": "MGT00583-L",
    "normalizedSku": "MGT00583L",
    "barcode": "4895183668408",
    "brand": "MINI GT",
    "name": "Tyrrell P34 #3 Jody Scheckter 1976 Swedish GP Winner",
    "scale": "1:64",
    "listPrice": 420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00599l",
    "sku": "MGT00599-L",
    "normalizedSku": "MGT00599L",
    "barcode": "4895183668897",
    "brand": "MINI GT",
    "name": "Nissan Z Performance 2023 Everest White LHD",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00631l",
    "sku": "MGT00631-L",
    "normalizedSku": "MGT00631L",
    "barcode": "810152142769",
    "brand": "MINI GT",
    "name": "Lincoln Capri 1954 Arctic White / Atlantic Blue LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00649mj",
    "sku": "MGT00649-MJ",
    "normalizedSku": "MGT00649MJ",
    "barcode": "810152142912",
    "brand": "MINI GT",
    "name": "Nissan LB-Super Silhouette S15 SILVIA ADVAN RHD / USA Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00650r",
    "sku": "MGT00650-R",
    "normalizedSku": "MGT00650R",
    "barcode": "4895183667753",
    "brand": "MINI GT",
    "name": "LB-Silhouette WORKS GT NISSAN 35GT-RR Ver.2 “PRINCESS RORO” MINI GT x MIZU Diecast",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00666l",
    "sku": "MGT00666-L",
    "normalizedSku": "MGT00666L",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MGT00666-L",
    "scale": "1:64",
    "listPrice": 400,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00666mjc",
    "sku": "MGT00666-MJC",
    "normalizedSku": "MGT00666MJC",
    "barcode": "",
    "brand": "MINI GT BL",
    "name": "MGT00666-MJC",
    "scale": "1:64",
    "listPrice": 400,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00666r",
    "sku": "MGT00666-R",
    "normalizedSku": "MGT00666R",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MGT00666-R",
    "scale": "1:64",
    "listPrice": 400,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00692l",
    "sku": "MGT00692-L",
    "normalizedSku": "MGT00692L",
    "barcode": "810152140475",
    "brand": "MINI GT",
    "name": "Honda NSX GT3 EVO22 #18 \"UPGARAGE NSX GT3\" TEAM UPGARAGE 2023 SUPER GT SERIES / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00693l",
    "sku": "MGT00693-L",
    "normalizedSku": "MGT00693L",
    "barcode": "810152140659",
    "brand": "MINI GT",
    "name": "BMW Alpina B7 xDrive Aventurin LHD",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00694l",
    "sku": "MGT00694-L",
    "normalizedSku": "MGT00694L",
    "barcode": "810152141397",
    "brand": "MINI GT",
    "name": "Mercedes-Benz EQS 580 4MATIC Black",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00698r",
    "sku": "MGT00698-R",
    "normalizedSku": "MGT00698R",
    "barcode": "810152140789",
    "brand": "MINI GT",
    "name": "Nissan Skyline Kenmeri Liberty Walk LBWK KUMA RHD",
    "scale": "1:64",
    "listPrice": 460,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00707l",
    "sku": "MGT00707-L",
    "normalizedSku": "MGT00707L",
    "barcode": "810152141069",
    "brand": "MINI GT",
    "name": "Porsche 901 1963 'Quickblau' LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00710l",
    "sku": "MGT00710-L",
    "normalizedSku": "MGT00710L",
    "barcode": "810152141182",
    "brand": "MINI GT",
    "name": "Hyundai i20 N Rally1 2023 Rally MonteCarlo 3rd Place #11",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00714bl",
    "sku": "MGT00714-BL",
    "normalizedSku": "MGT00714BL",
    "barcode": "840456300497",
    "brand": "MINI GT",
    "name": "Nissan Silvia (S15)? Top Secret D1GP? / Blister Packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00715l",
    "sku": "MGT00715-L",
    "normalizedSku": "MGT00715L",
    "barcode": "810152144329",
    "brand": "MINI GT",
    "name": "Porsche 911 Carrera RS 2.7 Grand Prix White with Blue Livery",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00715r",
    "sku": "MGT00715-R",
    "normalizedSku": "MGT00715R",
    "barcode": "810152144350",
    "brand": "MINI GT",
    "name": "Porsche 911 Carrera RS 2.7 Grand Prix White with Blue Livery RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00717bl",
    "sku": "MGT00717-BL",
    "normalizedSku": "MGT00717BL",
    "barcode": "810152145685",
    "brand": "MINI GT",
    "name": "Porsche 911 1964 Slate Grey LHD/ Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00720l",
    "sku": "MGT00720-L",
    "normalizedSku": "MGT00720L",
    "barcode": "810152141366",
    "brand": "MINI GT",
    "name": "Lamborghini Countach LPI 800-4 Rosso Mars LHD",
    "scale": "1:64",
    "listPrice": 360,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00722mj",
    "sku": "MGT00722-MJ",
    "normalizedSku": "MGT00722MJ",
    "barcode": "810152141465",
    "brand": "MINI GT",
    "name": "Nissan Z Pandem Passion Red LHD / USA Blister Packaging",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00726l",
    "sku": "MGT00726-L",
    "normalizedSku": "MGT00726L",
    "barcode": "810152142028",
    "brand": "MINI GT",
    "name": "AlphaTauri AT04 #22 Yuki Tsunoda 2023 F1 2023 Australian GP",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00742mj",
    "sku": "MGT00742-MJ",
    "normalizedSku": "MGT00742MJ",
    "barcode": "810152143001",
    "brand": "MINI GT",
    "name": "LB-Silhouette WORKS GT NISSAN 35GT-RR Ver.1 LBWK KUMA LHD / USA Blister Packaging",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00756l",
    "sku": "MGT00756-L",
    "normalizedSku": "MGT00756L",
    "barcode": "810152148983",
    "brand": "MINI GT",
    "name": "Nissan Z GT500 #23 \"MOTUL AUTECH Z\" NISMO 2023 SUPER GT SERIES / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 490,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-18T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-18T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00765bl",
    "sku": "MGT00765-BL",
    "normalizedSku": "MGT00765BL",
    "barcode": "810152148280",
    "brand": "MINI GT",
    "name": "Nissan Z GT500 #3 \"Niterra MOTUL Z\" NDDP RACING 2023 SUPER GT SERIES",
    "scale": "1:64",
    "listPrice": 500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00773r",
    "sku": "MGT00773-R",
    "normalizedSku": "MGT00773R",
    "barcode": "810152145067",
    "brand": "MINI GT",
    "name": "MAZDA RX-7 LB-Super Silhouette #41 Numero Reserve",
    "scale": "1:64",
    "listPrice": 450,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00774l",
    "sku": "MGT00774-L",
    "normalizedSku": "MGT00774L",
    "barcode": "810152145111",
    "brand": "MINI GT",
    "name": "Lamborghini Revuelto Arancio Dac Lucido LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00774r",
    "sku": "MGT00774-R",
    "normalizedSku": "MGT00774R",
    "barcode": "810152145142",
    "brand": "MINI GT",
    "name": "Lamborghini Revuelto Arancio Dac Lucido RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00776l",
    "sku": "MGT00776-L",
    "normalizedSku": "MGT00776L",
    "barcode": "810152145210",
    "brand": "MINI GT",
    "name": "BMW M3 M Performance Touring Alpine White",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00777bl",
    "sku": "MGT00777-BL",
    "normalizedSku": "MGT00777BL",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MGT00777-BL",
    "scale": "1:64",
    "listPrice": 500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00777blc",
    "sku": "MGT00777-BLC",
    "normalizedSku": "MGT00777BLC",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MGT00777-BLC",
    "scale": "1:64",
    "listPrice": 2500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00777l",
    "sku": "MGT00777-L",
    "normalizedSku": "MGT00777L",
    "barcode": "810152145364",
    "brand": "MINI GT",
    "name": "McLaren 720S LB★WORKS Black LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-05-09T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-05-09T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00777r",
    "sku": "MGT00777-R",
    "normalizedSku": "MGT00777R",
    "barcode": "810152145395",
    "brand": "MINI GT",
    "name": "McLaren 720S LB★WORKS Black RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-05-17T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-05-17T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00778r",
    "sku": "MGT00778-R",
    "normalizedSku": "MGT00778R",
    "barcode": "810152145456",
    "brand": "MINI GT",
    "name": "Nissan Z Pandem Seiran Blue RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-04T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-04T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00779l",
    "sku": "MGT00779-L",
    "normalizedSku": "MGT00779L",
    "barcode": "810152145470",
    "brand": "MINI GT",
    "name": "Lamborghini Huracán Sterrato Verde Gea Matt LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-04T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-04T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00779r",
    "sku": "MGT00779-R",
    "normalizedSku": "MGT00779R",
    "barcode": "810152145500",
    "brand": "MINI GT",
    "name": "Lamborghini Huracán Sterrato Verde Gea Matt RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-04T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-04T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00782bl",
    "sku": "MGT00782-BL",
    "normalizedSku": "MGT00782BL",
    "barcode": "810152145777",
    "brand": "MINI GT",
    "name": "Nissan Z LB★NATION WORKS? LB Gold RHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00783r",
    "sku": "MGT00783-R",
    "normalizedSku": "MGT00783R",
    "barcode": "810152145845",
    "brand": "MINI GT",
    "name": "McLaren 750S Spider Mantis Green",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00785bl",
    "sku": "MGT00785-BL",
    "normalizedSku": "MGT00785BL",
    "barcode": "810152145920",
    "brand": "MINI GT",
    "name": "MAZDA RX-7 LB-Super Silhouette Liberty Walk Black LHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-04T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-04T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00785r",
    "sku": "MGT00785-R",
    "normalizedSku": "MGT00785R",
    "barcode": "810152145944",
    "brand": "MINI GT",
    "name": "MAZDA RX-7 LB-Super Silhouette Liberty Walk Black",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00786bl",
    "sku": "MGT00786-BL",
    "normalizedSku": "MGT00786BL",
    "barcode": "840456304419",
    "brand": "MINI GT",
    "name": "Honda NSX-GT \"Type S\" GT500 #8 \"ARTA MUGEN NSX-GT \" ARTA 2023 SUPER GT Series / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 540,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00788r",
    "sku": "MGT00788-R",
    "normalizedSku": "MGT00788R",
    "barcode": "840456301012",
    "brand": "MINI GT",
    "name": "Lamborghini Huracán STO Bianco Asopo RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00792l",
    "sku": "MGT00792-L",
    "normalizedSku": "MGT00792L",
    "barcode": "810152146040",
    "brand": "MINI GT",
    "name": "BMW 750IL Aspen Silver Metallic LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00801r",
    "sku": "MGT00801-R",
    "normalizedSku": "MGT00801R",
    "barcode": "810152146286",
    "brand": "MINI GT",
    "name": "Porsche 911 Carrera RS 2.7 Grand Prix White with Green Livery RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-04-02T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-02T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00802l",
    "sku": "MGT00802-L",
    "normalizedSku": "MGT00802L",
    "barcode": "810152146408",
    "brand": "MINI GT",
    "name": "BMW i7 eDrive50 Black Sapphire LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-03T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-03T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00803bl",
    "sku": "MGT00803-BL",
    "normalizedSku": "MGT00803BL",
    "barcode": "810152146460",
    "brand": "MINI GT",
    "name": "Lamborghini Aventador SVJ 63 Roadster Nero Aldebaran LHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00807l",
    "sku": "MGT00807-L",
    "normalizedSku": "MGT00807L",
    "barcode": "810152146637",
    "brand": "MINI GT",
    "name": "Lamborghini Huracan Sterrato Blu Aegir LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00808l",
    "sku": "MGT00808-L",
    "normalizedSku": "MGT00808L",
    "barcode": "810152146682",
    "brand": "MINI GT",
    "name": "Lotus 78 #3 Gunnar Nilsson 1977 Japanese GP",
    "scale": "1:64",
    "listPrice": 420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00813bl",
    "sku": "MGT00813-BL",
    "normalizedSku": "MGT00813BL",
    "barcode": "810152146866",
    "brand": "MINI GT",
    "name": "Lamborghini Huracan GT3 EVO2 #63 Iron Lynx IMSA 2023 Daytona 24 Hrs. LHD/ Blister Packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00813l",
    "sku": "MGT00813-L",
    "normalizedSku": "MGT00813L",
    "barcode": "810152146859",
    "brand": "MINI GT",
    "name": "Lamborghini Huracan GT3 EVO2 #63 Iron Lynx IMSA 2023 Daytona 24 Hrs. LHD",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00820l",
    "sku": "MGT00820-L",
    "normalizedSku": "MGT00820L",
    "barcode": "810152147801",
    "brand": "MINI GT",
    "name": "Toyota GR86 Larry Chen's HKS Turbocharged GR86 LHD",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-04T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-04T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00841l",
    "sku": "MGT00841-L",
    "normalizedSku": "MGT00841L",
    "barcode": "840456300008",
    "brand": "MINI GT",
    "name": "McLaren 720S LB?orks Purple LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-04T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-04T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00843bl",
    "sku": "MGT00843-BL",
    "normalizedSku": "MGT00843BL",
    "barcode": "810152148082",
    "brand": "MINI GT",
    "name": "Nissan LB-ER34 Super Silhouette SKYLINE Red/Black/ Blister Packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-05-14T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-05-14T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00843r",
    "sku": "MGT00843-R",
    "normalizedSku": "MGT00843R",
    "barcode": "810152148075",
    "brand": "MINI GT",
    "name": "Nissan LB-ER34 Super Silhouette SKYLINE Red/Black",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00844r",
    "sku": "MGT00844-R",
    "normalizedSku": "MGT00844R",
    "barcode": "840456301036",
    "brand": "MINI GT",
    "name": "Nissan LB-ER34 Super Silhouette SKYLINE Black RHD",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00848bl",
    "sku": "MGT00848-BL",
    "normalizedSku": "MGT00848BL",
    "barcode": "810152148297",
    "brand": "MINI GT",
    "name": "Honda NSX-GT \"TYPE S\" GT500 #16 \"Red Bull MOTUL MUGEN NSX-GT \" TEAM Red Bull MUGEN 2022 SUPER GT SERIES / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 540,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00849bl",
    "sku": "MGT00849-BL",
    "normalizedSku": "MGT00849BL",
    "barcode": "810152148303",
    "brand": "MINI GT",
    "name": "Nissan Z GT500 #1 MARELLI IMPUL Z TEAM IMPUL 2023 SUPER GT SERIES / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00850bl",
    "sku": "MGT00850-BL",
    "normalizedSku": "MGT00850BL",
    "barcode": "810152148310",
    "brand": "MINI GT",
    "name": "Nissan Z GT500 #24 \"REALIZE CORPORTATION ADVAN Z\" KONDO RACING 2023 SUPER GT SERIES / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00851r",
    "sku": "MGT00851-R",
    "normalizedSku": "MGT00851R",
    "barcode": "810152149119",
    "brand": "MINI GT",
    "name": "ABARTH 595 LB-WORKS x Abas Works Pink Pink RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00852bl",
    "sku": "MGT00852-BL",
    "normalizedSku": "MGT00852BL",
    "barcode": "810152149164",
    "brand": "MINI GT",
    "name": "Mercedes-Benz 190E 2.5-16 Evolution II Astral Silver LHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00852l",
    "sku": "MGT00852-L",
    "normalizedSku": "MGT00852L",
    "barcode": "810152149157",
    "brand": "MINI GT",
    "name": "Mercedes-Benz 190E 2.5-16 Evolution II Astral Silver LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00855bl",
    "sku": "MGT00855-BL",
    "normalizedSku": "MGT00855BL",
    "barcode": "810152149348",
    "brand": "MINI GT",
    "name": "Nissan Silvia (S15) D-MAX #70 D-MAX Racing 2023 D1 Grand Prix - Japan Exclusive RHD / D1 Blister Packaging",
    "scale": "1:64",
    "listPrice": 600,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00858bl",
    "sku": "MGT00858-BL",
    "normalizedSku": "MGT00858BL",
    "barcode": "810152149294",
    "brand": "MINI GT",
    "name": "Nissan LB-Super Silhouette S15 SILVIA LBWK 2024 Fausto Racing RHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 600,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00858r",
    "sku": "MGT00858-R",
    "normalizedSku": "MGT00858R",
    "barcode": "810152149287",
    "brand": "MINI GT",
    "name": "Nissan LB-Super Silhouette S15 SILVIA LBWK 2024 Fausto Racing RHD",
    "scale": "1:64",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00860bl",
    "sku": "MGT00860-BL",
    "normalizedSku": "MGT00860BL",
    "barcode": "810152149386",
    "brand": "MINI GT",
    "name": "Nissan GT-R NISMO GT3 #10 \"PONOS GAINER GT-R\" GAINER 2023 SUPER GT SERIES? / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 540,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00861bl",
    "sku": "MGT00861-BL",
    "normalizedSku": "MGT00861BL",
    "barcode": "810152149393",
    "brand": "MINI GT",
    "name": "Nissan GT-R NISMO GT3 #11 \"GAINER TANAX GT-R\" GAINER 2023 SUPER GT SERIES? / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 580,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00863l",
    "sku": "MGT00863-L",
    "normalizedSku": "MGT00863L",
    "barcode": "840456300046",
    "brand": "MINI GT",
    "name": "BMW 3.0 CSL White LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00865l",
    "sku": "MGT00865-L",
    "normalizedSku": "MGT00865L",
    "barcode": "810152149676",
    "brand": "MINI GT",
    "name": "Lamborghini Countach LPI 800-4 Viola 30th LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00867l",
    "sku": "MGT00867-L",
    "normalizedSku": "MGT00867L",
    "barcode": "810152149751",
    "brand": "MINI GT",
    "name": "Bentley Flying Spur White Sand Verdant LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00868l",
    "sku": "MGT00868-L",
    "normalizedSku": "MGT00868L",
    "barcode": "810152149805",
    "brand": "MINI GT",
    "name": "Nissan GT-R Nismo 2024 NISMO Stealth Gray LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00868r",
    "sku": "MGT00868-R",
    "normalizedSku": "MGT00868R",
    "barcode": "810152149836",
    "brand": "MINI GT",
    "name": "Nissan GT-R Nismo 2024 NISMO Stealth Gray RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00869r",
    "sku": "MGT00869-R",
    "normalizedSku": "MGT00869R",
    "barcode": "810152149850",
    "brand": "MINI GT",
    "name": "Nissan Skyline GT-R (R32) Nismo Gunmetal W/ Matsuda Figure Tsugio Matsuda Collection",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00870l",
    "sku": "MGT00870-L",
    "normalizedSku": "MGT00870L",
    "barcode": "840456300091",
    "brand": "MINI GT",
    "name": "McLaren F1 GTR #59 1995 Le Mans 24Hr Winner Post-Race Weathered",
    "scale": "1:64",
    "listPrice": 420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00871l",
    "sku": "MGT00871-L",
    "normalizedSku": "MGT00871L",
    "barcode": "840456300121",
    "brand": "MINI GT",
    "name": "Hyundai i20 N Rally1 Hybrid #11 2024 Rallye Monte-Carlo Winner",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00873l",
    "sku": "MGT00873-L",
    "normalizedSku": "MGT00873L",
    "barcode": "840456300183",
    "brand": "MINI GT",
    "name": "Toyota GR86 LB?ation Baby Blue LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00873r",
    "sku": "MGT00873-R",
    "normalizedSku": "MGT00873R",
    "barcode": "810152149911",
    "brand": "MINI GT",
    "name": "Toyota GR86 LB?ation Baby Blue RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00885l",
    "sku": "MGT00885-L",
    "normalizedSku": "MGT00885L",
    "barcode": "840456300312",
    "brand": "MINI GT",
    "name": "Toyota GR86 LB?ation Red",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00886bl",
    "sku": "MGT00886-BL",
    "normalizedSku": "MGT00886BL",
    "barcode": "840456300374",
    "brand": "MINI GT",
    "name": "Lamborghini Revuelto Giallo LHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00886r",
    "sku": "MGT00886-R",
    "normalizedSku": "MGT00886R",
    "barcode": "840456300398",
    "brand": "MINI GT",
    "name": "Lamborghini Revuelto Giallo RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00887bl",
    "sku": "MGT00887-BL",
    "normalizedSku": "MGT00887BL",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Lamborghini Aventador SVJ 63 Roadster Verde Shock LHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00887blc",
    "sku": "MGT00887-BLC",
    "normalizedSku": "MGT00887BLC",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Lamborghini Aventador SVJ 63 Roadster Verde Shock LHD Chase? / Blister Packaging",
    "scale": "1:64",
    "listPrice": 2500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00887l",
    "sku": "MGT00887-L",
    "normalizedSku": "MGT00887L",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Lamborghini Aventador SVJ 63 Roadster Verde Shock LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00887r",
    "sku": "MGT00887-R",
    "normalizedSku": "MGT00887R",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Lamborghini Aventador SVJ 63 Roadster Verde Shock RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00891bl",
    "sku": "MGT00891-BL",
    "normalizedSku": "MGT00891BL",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar Ice Gray Metallic LHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00891blc",
    "sku": "MGT00891-BLC",
    "normalizedSku": "MGT00891BLC",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar Ice Gray Metallic LHD Chase? / Blister Packaging",
    "scale": "1:64",
    "listPrice": 2500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00891l",
    "sku": "MGT00891-L",
    "normalizedSku": "MGT00891L",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar Ice Gray Metallic LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00891r",
    "sku": "MGT00891-R",
    "normalizedSku": "MGT00891R",
    "barcode": "",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar Ice Gray Metallic RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00892r",
    "sku": "MGT00892-R",
    "normalizedSku": "MGT00892R",
    "barcode": "840456300701",
    "brand": "MINI GT",
    "name": "Chevrolet Corvette Z06 2023 Elkhart Lake Blue Metallic RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00894l",
    "sku": "MGT00894-L",
    "normalizedSku": "MGT00894L",
    "barcode": "840456301784",
    "brand": "MINI GT",
    "name": "BMW 750IL Sorrento Blue Metallic",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00895bl",
    "sku": "MGT00895-BL",
    "normalizedSku": "MGT00895BL",
    "barcode": "840456300824",
    "brand": "MINI GT",
    "name": "Nissan LB-Super Silhouette S15 SILVIA #555 2023 Formula Drift Japan RHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00895r",
    "sku": "MGT00895-R",
    "normalizedSku": "MGT00895R",
    "barcode": "840456300817",
    "brand": "MINI GT",
    "name": "Nissan LB-Super Silhouette S15 SILVIA #555 2023 Formula Drift Japan RHD",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00897l",
    "sku": "MGT00897-L",
    "normalizedSku": "MGT00897L",
    "barcode": "840456302217",
    "brand": "MINI GT",
    "name": "BMW M3 M Performance Touring Mint Green",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00902007j",
    "sku": "MGT00902-007J",
    "normalizedSku": "MGT00902007J",
    "barcode": "810152148426",
    "brand": "MINI GT",
    "name": "BMW 750IL \"Tomorrow Never Dies\" / Japanese Blister Packaging",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00903007e",
    "sku": "MGT00903-007E",
    "normalizedSku": "MGT00903007E",
    "barcode": "810152148440",
    "brand": "MINI GT",
    "name": "Jaguar C-X75 \"Spectre\" / English Blister Packaging",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00903007sc",
    "sku": "MGT00903-007SC",
    "normalizedSku": "MGT00903007SC",
    "barcode": "810152148471",
    "brand": "MINI GT",
    "name": "Jaguar C-X75 \"Spectre\" / Simplified Chinese Blister Packaging China Edition",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00903007tc",
    "sku": "MGT00903-007TC",
    "normalizedSku": "MGT00903007TC",
    "barcode": "810152148464",
    "brand": "MINI GT",
    "name": "Jaguar C-X75 \"Spectre\" / Traditional Chinese Blister Packaging",
    "scale": "1:64",
    "listPrice": 460,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00904007e",
    "sku": "MGT00904-007E",
    "normalizedSku": "MGT00904007E",
    "barcode": "840456303337",
    "brand": "MINI GT",
    "name": "Aston Martin DBS “No Time To Die”/ English Blister Packaging",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00904007s",
    "sku": "MGT00904-007S",
    "normalizedSku": "MGT00904007S",
    "barcode": "840456303375",
    "brand": "MINI GT",
    "name": "Aston Martin DBS “No Time To Die”/ Spanish Blister Packaging",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00908007e",
    "sku": "MGT00908-007E",
    "normalizedSku": "MGT00908007E",
    "barcode": "840456309513",
    "brand": "MINI GT",
    "name": "Jaguar XKR \"Die Another Day\"\n / English Blister Packaging",
    "scale": "1:64",
    "listPrice": 550,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00908007tc",
    "sku": "MGT00908-007TC",
    "normalizedSku": "MGT00908007TC",
    "barcode": "840456309544",
    "brand": "MINI GT",
    "name": "Jaguar XKR \"Die Another Day\"\n / Traditional Chinese Blister Packaging",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00912007e",
    "sku": "MGT00912-007E",
    "normalizedSku": "MGT00912007E",
    "barcode": "840456312049",
    "brand": "MINI GT",
    "name": "Lotus Esprit Turbo Copper Fire Metallic \n \"For Your Eyes Only\"\n / English Blister Packaging",
    "scale": "1:64",
    "listPrice": 480,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00912007j",
    "sku": "MGT00912-007J",
    "normalizedSku": "MGT00912007J",
    "barcode": "840456312063",
    "brand": "MINI GT",
    "name": "Lotus Esprit Turbo Copper Fire Metallic \n \"For Your Eyes Only\"\n / Japanese Blister Packaging",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00951bl",
    "sku": "MGT00951-BL",
    "normalizedSku": "MGT00951BL",
    "barcode": "840456301296",
    "brand": "MINI GT",
    "name": "Toyota GR Supra KUHL 2021 D1GP EVANGELION RACING / Blister Packaging",
    "scale": "1:64",
    "listPrice": 650,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00952bl",
    "sku": "MGT00952-BL",
    "normalizedSku": "MGT00952BL",
    "barcode": "840456301081",
    "brand": "MINI GT",
    "name": "BMW i7 xDrive60 Aventurin LHD / Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00952blc",
    "sku": "MGT00952-BLC",
    "normalizedSku": "MGT00952BLC",
    "barcode": "840456301098",
    "brand": "MINI GT",
    "name": "BMW i7 xDrive60 Aventurin LHD Chase Car / Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00952l",
    "sku": "MGT00952-L",
    "normalizedSku": "MGT00952L",
    "barcode": "840456301074",
    "brand": "MINI GT",
    "name": "BMW i7 xDrive60 Aventurin LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00952r",
    "sku": "MGT00952-R",
    "normalizedSku": "MGT00952R",
    "barcode": "840456301104",
    "brand": "MINI GT",
    "name": "BMW i7 xDrive60 Aventurin RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00956",
    "sku": "MGT00956",
    "normalizedSku": "MGT00956",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT MGT00956",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00956r",
    "sku": "MGT00956-R",
    "normalizedSku": "MGT00956R",
    "barcode": "840456301258",
    "brand": "MINI GT",
    "name": "Toyota GR86 HKS TYPE R ADVAN 2022 Tokyo Auto Salon RHD",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-05-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-05-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00957l",
    "sku": "MGT00957-L",
    "normalizedSku": "MGT00957L",
    "barcode": "840456304679",
    "brand": "MINI GT",
    "name": "Ford Mustang Dark Horse 2024 Carbonized Gray",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00959l",
    "sku": "MGT00959-L",
    "normalizedSku": "MGT00959L",
    "barcode": "840456301838",
    "brand": "MINI GT",
    "name": "BMW i7 xDrive60 Alpine White / Black Sapphire",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00962l",
    "sku": "MGT00962-L",
    "normalizedSku": "MGT00962L",
    "barcode": "840456301524",
    "brand": "MINI GT",
    "name": "Mercedes-Maybach S680 Gold / Dark Red Metallic LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00964l",
    "sku": "MGT00964-L",
    "normalizedSku": "MGT00964L",
    "barcode": "840456301623",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar Ice Grey Metallic \"Rally 1978\"LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00964r",
    "sku": "MGT00964-R",
    "normalizedSku": "MGT00964R",
    "barcode": "840456301654",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar Ice Grey Metallic \"Rally 1978\" RHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00974bl",
    "sku": "MGT00974-BL",
    "normalizedSku": "MGT00974BL",
    "barcode": "",
    "brand": "MINI GT BL",
    "name": "#974BL Ford Puma Rally 1 #13 Rally Monte Carlo 2024 吊卡版",
    "scale": "1:64",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-13T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-13T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "prod-mgt00974blc",
    "sku": "MGT00974-BLC",
    "normalizedSku": "MGT00974BLC",
    "barcode": "",
    "brand": "MINI GT BL",
    "name": "#974BL chase Ford Puma Rally 1 #13 Rally Monte Carlo 2024 吊卡版",
    "scale": "1:64",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-01-13T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-13T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "prod-mgt00974l",
    "sku": "MGT00974-L",
    "normalizedSku": "MGT00974L",
    "barcode": "840456302019",
    "brand": "MINI GT",
    "name": "#974L Ford Puma Rally 1 #13 Rally Monte Carlo 2024 RED BULL",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00975l",
    "sku": "MGT00975-L",
    "normalizedSku": "MGT00975L",
    "barcode": "840456303443",
    "brand": "MINI GT",
    "name": "Subaru Impreza WRC98 1998 Rally Monte-Carlo 3rd Place #3",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00983bl",
    "sku": "MGT00983-BL",
    "normalizedSku": "MGT00983BL",
    "barcode": "840456303634",
    "brand": "MINI GT",
    "name": "Mazda RX-7 LB-Super Silhouette Advan\n / Blister Packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00985l",
    "sku": "MGT00985-L",
    "normalizedSku": "MGT00985L",
    "barcode": "840456303702",
    "brand": "MINI GT",
    "name": "Nissan Z VeilSide FZ400 Gold Chrome",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00986l",
    "sku": "MGT00986-L",
    "normalizedSku": "MGT00986L",
    "barcode": "840456303870",
    "brand": "MINI GT",
    "name": "Subaru Impreza WRC99 1999 Rally Australia Winner #5 Australia Exclusive",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00989l",
    "sku": "MGT00989-L",
    "normalizedSku": "MGT00989L",
    "barcode": "840456305201",
    "brand": "MINI GT",
    "name": "Nissan Z VeilSide FFZ400 Orange",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00990bl",
    "sku": "MGT00990-BL",
    "normalizedSku": "MGT00990BL",
    "barcode": "840456304136",
    "brand": "MINI GT",
    "name": "Mazda RX-7 LB-Super Silhouette 787B \n / Blister Packaging",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00990r",
    "sku": "MGT00990-R",
    "normalizedSku": "MGT00990R",
    "barcode": "840456304129",
    "brand": "MINI GT",
    "name": "Mazda RX-7 LB-Super Silhouette 787B",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00991l",
    "sku": "MGT00991-L",
    "normalizedSku": "MGT00991L",
    "barcode": "840456304259",
    "brand": "MINI GT",
    "name": "Bentley Flying Spur Orange Flame / Onyx",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-02-10T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-10T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00992bl",
    "sku": "MGT00992-BL",
    "normalizedSku": "MGT00992BL",
    "barcode": "840456304433",
    "brand": "MINI GT",
    "name": "Honda NSX-GT \"Type S\" GT500 #64 \"Modulo NSX-GT\" Modulo Nakajima Racing 2023 SUPER GT Series / SUPER GT Blister Packaging",
    "scale": "1:64",
    "listPrice": 540,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00995l",
    "sku": "MGT00995-L",
    "normalizedSku": "MGT00995L",
    "barcode": "840456303931",
    "brand": "MINI GT",
    "name": "Abarth 595 LB-WORKS x Abas Works Grey",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00998bl",
    "sku": "MGT00998-BL",
    "normalizedSku": "MGT00998BL",
    "barcode": "840456304181",
    "brand": "MINI GT",
    "name": "BMW Z8 Silver\n / Blister Packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00998l",
    "sku": "MGT00998-L",
    "normalizedSku": "MGT00998L",
    "barcode": "840456304174",
    "brand": "MINI GT",
    "name": "BMW Z8 Silver",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt00999l",
    "sku": "MGT00999-L",
    "normalizedSku": "MGT00999L",
    "barcode": "840456304228",
    "brand": "MINI GT",
    "name": "Aston Martin AMR24 #14 Fernando Alonso\n 2024 F1 2024 Bahrain GP",
    "scale": "1:64",
    "listPrice": 550,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01005r",
    "sku": "MGT01005-R",
    "normalizedSku": "MGT01005R",
    "barcode": "840456304754",
    "brand": "MINI GT",
    "name": "Toyota GR86 HKS TYPE R 2022 Tokyo Auto Salon",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01006bl",
    "sku": "MGT01006-BL",
    "normalizedSku": "MGT01006BL",
    "barcode": "840456304808",
    "brand": "MINI GT BL",
    "name": "#1006BL RB VCARB 01 #3 D. Ricciardo 2024 F1 Bahrain GP 吊卡版",
    "scale": "1:64",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01006l",
    "sku": "MGT01006-L",
    "normalizedSku": "MGT01006L",
    "barcode": "840456304792",
    "brand": "MINI GT",
    "name": "#1006L RB VCARB 01 #3 D. Ricciardo 2024 F1 Bahrain GP",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-05-09T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-05-09T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01007bl",
    "sku": "MGT01007-BL",
    "normalizedSku": "MGT01007BL",
    "barcode": "840456304839",
    "brand": "MINI GT",
    "name": "#1007BL RB VCARB 01 #22 Y. Tsunoda 2024 F1 Bahrain GP 吊卡版",
    "scale": "1:64",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-04-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01007l",
    "sku": "MGT01007-L",
    "normalizedSku": "MGT01007L",
    "barcode": "840456304822",
    "brand": "MINI GT",
    "name": "#1007L RB VCARB 01 #22 Y. Tsunoda 2024 F1 Bahrain GP",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-05T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-05T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01008l",
    "sku": "MGT01008-L",
    "normalizedSku": "MGT01008L",
    "barcode": "840456304853",
    "brand": "MINI GT",
    "name": "Aston Martin DBS 007 Edition LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01009l",
    "sku": "MGT01009-L",
    "normalizedSku": "MGT01009L",
    "barcode": "840456306536",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar Rally 1974",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01009r",
    "sku": "MGT01009-R",
    "normalizedSku": "MGT01009R",
    "barcode": "840456306567",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar Rally 1974",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01022r",
    "sku": "MGT01022-R",
    "normalizedSku": "MGT01022R",
    "barcode": "840456304983",
    "brand": "MINI GT",
    "name": "Nissan LB-Super Silhouette S15 SILVIA\n GARASIDRIFT x LBWK 2025",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01024bl",
    "sku": "MGT01024-BL",
    "normalizedSku": "MGT01024BL",
    "barcode": "840456305423",
    "brand": "MINI GT",
    "name": "Nissan Skyline GT-R (NISMO BNR32 CRS Version) Dark Metal Gray/ Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01024r",
    "sku": "MGT01024-R",
    "normalizedSku": "MGT01024R",
    "barcode": "840456305416",
    "brand": "MINI GT",
    "name": "Nissan Skyline GT-R (NISMO BNR32 CRS Version) \n Dark Metal Gray",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01045l",
    "sku": "MGT01045-L",
    "normalizedSku": "MGT01045L",
    "barcode": "840456305690",
    "brand": "MINI GT",
    "name": "Nissan GT-R Nismo 2024 Brilliant White Pearl",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01045r",
    "sku": "MGT01045-R",
    "normalizedSku": "MGT01045R",
    "barcode": "840456305720",
    "brand": "MINI GT",
    "name": "Nissan GT-R Nismo 2024 Brilliant White Pearl",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01046r",
    "sku": "MGT01046-R",
    "normalizedSku": "MGT01046R",
    "barcode": "840456305744",
    "brand": "MINI GT",
    "name": "Mazda RX-7 RE-Amemiya 20B NA 3ROTOR-7 \n  “Ama-san Go”",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01047r",
    "sku": "MGT01047-R",
    "normalizedSku": "MGT01047R",
    "barcode": "840456305782",
    "brand": "MINI GT",
    "name": "Mazda AZ-1 Liberty Walk LB40 PILOT",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01052l",
    "sku": "MGT01052-L",
    "normalizedSku": "MGT01052L",
    "barcode": "840456306581",
    "brand": "MINI GT",
    "name": "Porsche 911 GT3 R #77 AO Racing \n 2024 IMSA ROAD AMERICA",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01053l",
    "sku": "MGT01053-L",
    "normalizedSku": "MGT01053L",
    "barcode": "840456306611",
    "brand": "MINI GT",
    "name": "Lamborghini LB-Silhouette \n WORKS MURCIELAGO GT Evo Black",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01054bl",
    "sku": "MGT01054-BL",
    "normalizedSku": "MGT01054BL",
    "barcode": "840456306673",
    "brand": "MINI GT",
    "name": "Nissan LB-Super Silhouette S15 SILVIA ATHLETE\n / Blister Packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01054r",
    "sku": "MGT01054-R",
    "normalizedSku": "MGT01054R",
    "barcode": "840456306666",
    "brand": "MINI GT",
    "name": "Nissan LB-Super Silhouette S15 SILVIA ATHLETE",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01055r",
    "sku": "MGT01055-R",
    "normalizedSku": "MGT01055R",
    "barcode": "840456306734",
    "brand": "MINI GT",
    "name": "LB★WORKS Lamborghini Huracán GT GRAVITY",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01056l",
    "sku": "MGT01056-L",
    "normalizedSku": "MGT01056L",
    "barcode": "840456306758",
    "brand": "MINI GT",
    "name": "Acura ARX-06 GTP #10 \n Wayne Taylor Racing with Andretti \n 2024 IMSA Daytona 24 Hrs",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01057l",
    "sku": "MGT01057-L",
    "normalizedSku": "MGT01057L",
    "barcode": "840456306925",
    "brand": "MINI GT",
    "name": "Mazda RX-7 VeilSide Fortune Grey",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01057r",
    "sku": "MGT01057-R",
    "normalizedSku": "MGT01057R",
    "barcode": "840456306956",
    "brand": "MINI GT",
    "name": "Mazda RX-7 VeilSide Fortune Grey",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01058bl",
    "sku": "MGT01058-BL",
    "normalizedSku": "MGT01058BL",
    "barcode": "840456306987",
    "brand": "MINI GT",
    "name": "Bugatti W16 Mistral Black\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01058l",
    "sku": "MGT01058-L",
    "normalizedSku": "MGT01058L",
    "barcode": "840456306970",
    "brand": "MINI GT",
    "name": "Bugatti W16 Mistral Black",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01059r",
    "sku": "MGT01059-R",
    "normalizedSku": "MGT01059R",
    "barcode": "840456307014",
    "brand": "MINI GT",
    "name": "Nissan LB-ER34 Super Silhouette ATHLETE/COLLET",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01061l",
    "sku": "MGT01061-L",
    "normalizedSku": "MGT01061L",
    "barcode": "840456307052",
    "brand": "MINI GT",
    "name": "Volkswagen ID.Buzz Candy White / Energetic Orange",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01062l",
    "sku": "MGT01062-L",
    "normalizedSku": "MGT01062L",
    "barcode": "840456307106",
    "brand": "MINI GT",
    "name": "Lamborghini Huracán GT3 EVO2 #78 Forte Racing \n 2024 IMSA Daytona 24 Hrs",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01064bl",
    "sku": "MGT01064-BL",
    "normalizedSku": "MGT01064BL",
    "barcode": "840456307236",
    "brand": "MINI GT",
    "name": "Abarth 595 LB-WORKS x Abas Works Fighters\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01064l",
    "sku": "MGT01064-L",
    "normalizedSku": "MGT01064L",
    "barcode": "840456307229",
    "brand": "MINI GT",
    "name": "Abarth 595 LB-WORKS x Abas Works Fighters",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01065bl",
    "sku": "MGT01065-BL",
    "normalizedSku": "MGT01065BL",
    "barcode": "840456306857",
    "brand": "MINI GT",
    "name": "Aston Martin DBS Hyper Red\n / Blister Packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01065l",
    "sku": "MGT01065-L",
    "normalizedSku": "MGT01065L",
    "barcode": "840456306840",
    "brand": "MINI GT",
    "name": "Aston Martin DBS Hyper Red",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-19T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-19T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01066r",
    "sku": "MGT01066-R",
    "normalizedSku": "MGT01066R",
    "barcode": "840456307281",
    "brand": "MINI GT",
    "name": "Nissan Skyline GT-R (R32) VeilSide \n Combat C-I White",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01067l",
    "sku": "MGT01067-L",
    "normalizedSku": "MGT01067L",
    "barcode": "840456307304",
    "brand": "MINI GT",
    "name": "Toyota Supra (A80) Top Secret GT-300 \n Top Secret Purple",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01067r",
    "sku": "MGT01067-R",
    "normalizedSku": "MGT01067R",
    "barcode": "840456307335",
    "brand": "MINI GT",
    "name": "Toyota Supra (A80) Top Secret GT-300 \n Top Secret Purple",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01068l",
    "sku": "MGT01068-L",
    "normalizedSku": "MGT01068L",
    "barcode": "840456307359",
    "brand": "MINI GT",
    "name": "Porsche 911 Dakar \"Uncle Rally\"",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01069l",
    "sku": "MGT01069-L",
    "normalizedSku": "MGT01069L",
    "barcode": "840456307137",
    "brand": "MINI GT",
    "name": "Mazda Miata MX-5 (NA) Tuned Version Dark Blue",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01070l",
    "sku": "MGT01070-L",
    "normalizedSku": "MGT01070L",
    "barcode": "840456307397",
    "brand": "MINI GT",
    "name": "Jaguar C-X75 Black",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01074l",
    "sku": "MGT01074-L",
    "normalizedSku": "MGT01074L",
    "barcode": "840456307618",
    "brand": "MINI GT",
    "name": "Ford Puma Rally1 #16 M-Sport Ford WRT \n 2024 Rally Finland 3rd Place",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01076l",
    "sku": "MGT01076-L",
    "normalizedSku": "MGT01076L",
    "barcode": "840456307687",
    "brand": "MINI GT",
    "name": "Mercedes-Benz 190 E 2.3-16 #11 \n Ayrton Senna 1984 Nürburgring Race of\n Champions w/ Figure",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01077l",
    "sku": "MGT01077-L",
    "normalizedSku": "MGT01077L",
    "barcode": "840456308288",
    "brand": "MINI GT",
    "name": "LB-WORKS FORD MUSTANG Triple Yellow",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01079bl",
    "sku": "MGT01079-BL",
    "normalizedSku": "MGT01079BL",
    "barcode": "840456308387",
    "brand": "MINI GT",
    "name": "Honda Civic TYPE R 2024 Pace Car HRC\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01079l",
    "sku": "MGT01079-L",
    "normalizedSku": "MGT01079L",
    "barcode": "840456308370",
    "brand": "MINI GT",
    "name": "Honda Civic TYPE R 2024 Pace Car HRC",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01080bl",
    "sku": "MGT01080-BL",
    "normalizedSku": "MGT01080BL",
    "barcode": "840456308417",
    "brand": "MINI GT",
    "name": "BMW M5 Touring (G99) Marina Bay \n Blue Metallic\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01080blc",
    "sku": "MGT01080-BLC",
    "normalizedSku": "MGT01080BLC",
    "barcode": "840456308424",
    "brand": "MINI GT",
    "name": "BMW M5 Touring (G99) Marina Bay \n Blue Metallic\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01080l",
    "sku": "MGT01080-L",
    "normalizedSku": "MGT01080L",
    "barcode": "840456308400",
    "brand": "MINI GT",
    "name": "BMW M5 Touring (G99) Marina Bay \n Blue Metallic",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01081l",
    "sku": "MGT01081-L",
    "normalizedSku": "MGT01081L",
    "barcode": "840456308455",
    "brand": "MINI GT",
    "name": "Lamborghini Countach LB-WORKS Black",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01082l",
    "sku": "MGT01082-L",
    "normalizedSku": "MGT01082L",
    "barcode": "840456308509",
    "brand": "MINI GT",
    "name": "BMW Z8 Alpina Alpine Blue",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01083l",
    "sku": "MGT01083-L",
    "normalizedSku": "MGT01083L",
    "barcode": "840456308653",
    "brand": "MINI GT",
    "name": "McLaren 720S LB★Works The Boring Concept",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01086l",
    "sku": "MGT01086-L",
    "normalizedSku": "MGT01086L",
    "barcode": "840456308738",
    "brand": "MINI GT",
    "name": "BMW M5 (G90) Isle of Man Green Metallic",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01086r",
    "sku": "MGT01086-R",
    "normalizedSku": "MGT01086R",
    "barcode": "840456308769",
    "brand": "MINI GT",
    "name": "BMW M5 (G90) Isle of Man Green Metallic",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01087bl",
    "sku": "MGT01087-BL",
    "normalizedSku": "MGT01087BL",
    "barcode": "840456308790",
    "brand": "MINI GT",
    "name": "LB★WORKS Lamborghini Aventador \n Limited Edition Matte Black\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01087l",
    "sku": "MGT01087-L",
    "normalizedSku": "MGT01087L",
    "barcode": "840456308783",
    "brand": "MINI GT",
    "name": "LB★WORKS Lamborghini Aventador \n Limited Edition Matte Black",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01087r",
    "sku": "MGT01087-R",
    "normalizedSku": "MGT01087R",
    "barcode": "840456308813",
    "brand": "MINI GT",
    "name": "LB★WORKS Lamborghini Aventador \n Limited Edition Matte Black",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01089r",
    "sku": "MGT01089-R",
    "normalizedSku": "MGT01089R",
    "barcode": "840456308837",
    "brand": "MINI GT",
    "name": "NISSAN GT-R 2013 Dark Metal Gray \n (NISMO R35 CRS Version)",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01100bl",
    "sku": "MGT01100-BL",
    "normalizedSku": "MGT01100BL",
    "barcode": "840456310953",
    "brand": "MINI GT",
    "name": "Lamborghini Countach LB-WORKS Red\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01100l",
    "sku": "MGT01100-L",
    "normalizedSku": "MGT01100L",
    "barcode": "840456310946",
    "brand": "MINI GT",
    "name": "Lamborghini Countach LB-WORKS Red LHD",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01101r",
    "sku": "MGT01101-R",
    "normalizedSku": "MGT01101R",
    "barcode": "840456311028",
    "brand": "MINI GT",
    "name": "MAZDA RX-7 LB-Super Silhouette FD-NILES RHD",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01103bl",
    "sku": "MGT01103-BL",
    "normalizedSku": "MGT01103BL",
    "barcode": "840456309223",
    "brand": "MINI GT",
    "name": "LB★WORKS Toyota GR Supra Red/White/Blister packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01103l",
    "sku": "MGT01103-L",
    "normalizedSku": "MGT01103L",
    "barcode": "840456309216",
    "brand": "MINI GT",
    "name": "LB★WORKS Toyota GR Supra Red/White",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01106l",
    "sku": "MGT01106-L",
    "normalizedSku": "MGT01106L",
    "barcode": "840456311189",
    "brand": "MINI GT",
    "name": "Mazda RX-7 RE-Amemiya Silver Metallic",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01109l",
    "sku": "MGT01109-L",
    "normalizedSku": "MGT01109L",
    "barcode": "840456309254",
    "brand": "MINI GT",
    "name": "Lotus Esprit Turbo Metallic Silver",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01111l",
    "sku": "MGT01111-L",
    "normalizedSku": "MGT01111L",
    "barcode": "840456309353",
    "brand": "MINI GT",
    "name": "BMW i7 xDrive60 Tanzanite Blue Metallic",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01121bl",
    "sku": "MGT01121-BL",
    "normalizedSku": "MGT01121BL",
    "barcode": "840456309759",
    "brand": "MINI GT",
    "name": "Lamborghini Revuelto Viola 30th Matte\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01121r",
    "sku": "MGT01121-R",
    "normalizedSku": "MGT01121R",
    "barcode": "840456309773",
    "brand": "MINI GT",
    "name": "Lamborghini Revuelto Viola 30th Matte",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01124bl",
    "sku": "MGT01124-BL",
    "normalizedSku": "MGT01124BL",
    "barcode": "840456309872",
    "brand": "MINI GT",
    "name": "LB-Silhouette WORKS GT \n NISSAN 35GT-RR Ver.2 Blue\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01124l",
    "sku": "MGT01124-L",
    "normalizedSku": "MGT01124L",
    "barcode": "840456309865",
    "brand": "MINI GT",
    "name": "LB-Silhouette WORKS GT \n NISSAN 35GT-RR Ver.2 Blue",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01126r",
    "sku": "MGT01126-R",
    "normalizedSku": "MGT01126R",
    "barcode": "840456310052",
    "brand": "MINI GT",
    "name": "MINI GT : 1/64 Nissan Skyline GT-R (R34) V-Spec Black Peral W/TE37 Wheel 2025 Philippines Exclusive Limited Edition 2500pcs",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01130bl",
    "sku": "MGT01130-BL",
    "normalizedSku": "MGT01130BL",
    "barcode": "840456310670",
    "brand": "MINI GT",
    "name": "Shelby GT500 Dragon Snake Concept Black/Gold/Blister packaging",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01130l",
    "sku": "MGT01130-L",
    "normalizedSku": "MGT01130L",
    "barcode": "840456310663",
    "brand": "MINI GT",
    "name": "Shelby GT500 Dragon Snake Concept Black/Gold",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01131l",
    "sku": "MGT01131-L",
    "normalizedSku": "MGT01131L",
    "barcode": "840456310700",
    "brand": "MINI GT",
    "name": "Lancia Delta HF Integrale Evoluzione #1 \n 1993 Rallye Monte-Carlo",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01134l",
    "sku": "MGT01134-L",
    "normalizedSku": "MGT01134L",
    "barcode": "840456310816",
    "brand": "MINI GT",
    "name": "Lamborghini Countach 25th Anniversary White",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01135bl",
    "sku": "MGT01135-BL",
    "normalizedSku": "MGT01135BL",
    "barcode": "840456311240",
    "brand": "MINI GT",
    "name": "LB-Silhouette WORKS MURCIELAGO GT Evo Yellow \n /Blister packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01135l",
    "sku": "MGT01135-L",
    "normalizedSku": "MGT01135L",
    "barcode": "840456311233",
    "brand": "MINI GT",
    "name": "LB-Silhouette WORKS MURCIELAGO GT Evo Yellow",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01144bl",
    "sku": "MGT01144-BL",
    "normalizedSku": "MGT01144BL",
    "barcode": "840456311769",
    "brand": "MINI GT",
    "name": "Range Rover 1981 Camel Trophy Sumatra\n C.Swoboda & K.Mentel Winner\n /Blister packaging",
    "scale": "1:64",
    "listPrice": 470,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01144l",
    "sku": "MGT01144-L",
    "normalizedSku": "MGT01144L",
    "barcode": "840456311752",
    "brand": "MINI GT",
    "name": "Range Rover 1981 Camel Trophy Sumatra\n C.Swoboda & K.Mentel Winner",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgt01149r",
    "sku": "MGT01149-R",
    "normalizedSku": "MGT01149R",
    "barcode": "840456311967",
    "brand": "MINI GT",
    "name": "Toyota GR86 LB★Nation Black / Gold",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgtac20",
    "sku": "MGTAC20",
    "normalizedSku": "MGTAC20",
    "barcode": "810152142950",
    "brand": "MINI GT",
    "name": "Paddock Service Tent Set - ADVAN",
    "scale": "1:64",
    "listPrice": 260,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-10T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-10T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgtac36",
    "sku": "MGTAC36",
    "normalizedSku": "MGTAC36",
    "barcode": "810152146002",
    "brand": "MINI GT",
    "name": "1/64 Figurine: Car Enthusiasts",
    "scale": "1:64",
    "listPrice": 700,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-04-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgtom039",
    "sku": "MGTOM039",
    "normalizedSku": "MGTOM039",
    "barcode": "840456303214",
    "brand": "MINI GT",
    "name": "MINI GT Mini Flag Set - Classic Logo",
    "scale": "1:64",
    "listPrice": 80,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgtom040",
    "sku": "MGTOM040",
    "normalizedSku": "MGTOM040",
    "barcode": "840456303221",
    "brand": "MINI GT",
    "name": "MINI GT Bear Bag Charm - Brownie",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgtom044",
    "sku": "MGTOM044",
    "normalizedSku": "MGTOM044",
    "barcode": "840456303269",
    "brand": "MINI GT",
    "name": "MINI GT Sticker Set C",
    "scale": "1:64",
    "listPrice": 100,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mgts0017",
    "sku": "MGTS0017",
    "normalizedSku": "MGTS0017",
    "barcode": "840456301753",
    "brand": "MINI GT",
    "name": "Veilside Hobby Expo China 2025 Chrome Set",
    "scale": "1:64",
    "listPrice": 0,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-mm64rwb964002",
    "sku": "MM64-RWB964-002",
    "normalizedSku": "MM64RWB964002",
    "barcode": "4892345678213",
    "brand": "MINI GT",
    "name": "RWB964 Ichiban Boshi #7",
    "scale": "1:64",
    "listPrice": 450,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-02T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-02T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64103",
    "sku": "PR64-103",
    "normalizedSku": "PR64103",
    "barcode": "6973027529554",
    "brand": "POP RACE",
    "name": "GTR R32 AXIA",
    "scale": "1:64",
    "listPrice": 480,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64126",
    "sku": "PR64-126",
    "normalizedSku": "PR64126",
    "barcode": "6973027528564",
    "brand": "POP RACE",
    "name": "EVA RT Production Model-02 Goodride GR Yaris",
    "scale": "1:64",
    "listPrice": 570,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64135",
    "sku": "PR64-135",
    "normalizedSku": "PR64135",
    "barcode": "4894826023055",
    "brand": "POP RACE",
    "name": "POPRACE x TINY Coca-Cola SKYLINE C210 KAIDO RACER BOSOZOKU STYLE",
    "scale": "1:64",
    "listPrice": 480,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64144",
    "sku": "PR64-144",
    "normalizedSku": "PR64144",
    "barcode": "6973027529332",
    "brand": "POP RACE",
    "name": "Coca-Cola Skyline GT-R V8 Drif (Hakosuka)",
    "scale": "1:64",
    "listPrice": 530,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64194",
    "sku": "PR64-194",
    "normalizedSku": "PR64194",
    "barcode": "PR640194",
    "brand": "POP RACE",
    "name": "SKYLINE GT-R BNR32(Castrol)",
    "scale": "1:64",
    "listPrice": 540,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64202",
    "sku": "PR64-202",
    "normalizedSku": "PR64202",
    "barcode": "6973027523682",
    "brand": "POP RACE",
    "name": "RWB 997 粉",
    "scale": "1:64",
    "listPrice": 480,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64206",
    "sku": "PR64-206",
    "normalizedSku": "PR64206",
    "barcode": "PR640206",
    "brand": "POP RACE",
    "name": "Pandem Civic EG6 電鍍藍",
    "scale": "1:64",
    "listPrice": 530,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64223",
    "sku": "PR64-223",
    "normalizedSku": "PR64223",
    "barcode": "PR640223",
    "brand": "POP RACE",
    "name": "Mazda RX7 RE-Amemiya 電鍍藍",
    "scale": "1:64",
    "listPrice": 530,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64228",
    "sku": "PR64-228",
    "normalizedSku": "PR64228",
    "barcode": "6978132320652",
    "brand": "POP RACE",
    "name": "PANDEM GR 86",
    "scale": "1:64",
    "listPrice": 540,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr64230",
    "sku": "PR64-230",
    "normalizedSku": "PR64230",
    "barcode": "PR640230",
    "brand": "POP RACE",
    "name": "McLaren F1 黑",
    "scale": "1:64",
    "listPrice": 490,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr640126",
    "sku": "PR640126",
    "normalizedSku": "PR640126",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT PR640126",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr640136",
    "sku": "PR640136",
    "normalizedSku": "PR640136",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT PR640136",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr640218",
    "sku": "PR640218",
    "normalizedSku": "PR640218",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT PR640218",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr640223",
    "sku": "PR640223",
    "normalizedSku": "PR640223",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT PR640223",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pr640256",
    "sku": "PR640256",
    "normalizedSku": "PR640256",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT PR640256",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pre006",
    "sku": "PRE006",
    "normalizedSku": "PRE006",
    "barcode": "181351618500601",
    "brand": "POP RACE",
    "name": "SKYLINE GT-R V8 DRIFT HAKOSUKA CHRORE",
    "scale": "1:64",
    "listPrice": 560,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-24T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-24T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pre007",
    "sku": "PRE007",
    "normalizedSku": "PRE007",
    "barcode": "161850071",
    "brand": "POP RACE",
    "name": "Pandem GR Yaris Goodride Motorsports",
    "scale": "1:64",
    "listPrice": 480,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-pre012",
    "sku": "PRE012",
    "normalizedSku": "PRE012",
    "barcode": "PRE012",
    "brand": "POP RACE",
    "name": "Pandem GR Yaris AutoFinesse",
    "scale": "1:64",
    "listPrice": 490,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-qz00501bl",
    "sku": "QZ00501-BL",
    "normalizedSku": "QZ00501BL",
    "barcode": "840456308578",
    "brand": "Qube",
    "name": "Nissan LB-Super Silhouette S15 SILVIA Liberty Walk Presentation / Blister packaging",
    "scale": "1:64",
    "listPrice": 250,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-qz00502bl",
    "sku": "QZ00502-BL",
    "normalizedSku": "QZ00502BL",
    "barcode": "840456308585",
    "brand": "Qube",
    "name": "Nissan LB-Super Silhouette S15 SILVIA Auto Finesse SEMA 2023 / Blister packaging",
    "scale": "1:64",
    "listPrice": 250,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-04-12T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-12T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-r1001",
    "sku": "R1001",
    "normalizedSku": "R1001",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT R1001",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t6404324mgp30",
    "sku": "T64-043-24MGP30",
    "normalizedSku": "T6404324MGP30",
    "barcode": "9581015734780",
    "brand": "Tarmac Works",
    "name": "Audi R8 LMS GT3 EVO II Macau GT CUP-FIA GT World Cup 2024 Uno Racing Team James YU",
    "scale": "1:64",
    "listPrice": 1280,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t6406225chn77",
    "sku": "T64-062-25CHN77",
    "normalizedSku": "T6406225CHN77",
    "barcode": "9581015737675",
    "brand": "Tarmac Works",
    "name": "AMG GT3 GT World Challenge Asia 2025-Beijing Season Finale",
    "scale": "1:64",
    "listPrice": 800,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-17T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-17T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t6407796mgp03",
    "sku": "T64-077-96MGP03",
    "normalizedSku": "T6407796MGP03",
    "barcode": "9581015733059",
    "brand": "Tarmac Works",
    "name": "Audi A4 Quattro Macau Guia Race 1996 Winner",
    "scale": "1:64",
    "listPrice": 670,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64tl06187ehc35",
    "sku": "T64-TL061-87EHC35",
    "normalizedSku": "T64TL06187EHC35",
    "barcode": "9681015722630",
    "brand": "Tarmac Works",
    "name": "Renault 5 MAXI Turbo European Hill-Climb Championship 1987 Giovanni Rossi",
    "scale": "1:64",
    "listPrice": 680,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 35,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64g020gy",
    "sku": "T64G-020-GY",
    "normalizedSku": "T64G020GY",
    "barcode": "9580015718233",
    "brand": "Tarmac Works",
    "name": "Land Rover Defender Grey Metallic",
    "scale": "1:64",
    "listPrice": 400,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64g069sl",
    "sku": "T64G-069-SL",
    "normalizedSku": "T64G069SL",
    "barcode": "9581015731963",
    "brand": "Tarmac Works",
    "name": "Porsche 911 GT3 (Type 996) Silver",
    "scale": "1:64",
    "listPrice": 390,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-18T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-18T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64g07697mcr01",
    "sku": "T64G-076-97MCR01",
    "normalizedSku": "T64G07697MCR01",
    "barcode": "9581015734537",
    "brand": "Tarmac Works",
    "name": "Mitsubishi Lancer Evolution IV Rallye Monte-Carlo 1997 Tommi Makinen/Seppo harjanne",
    "scale": "1:64",
    "listPrice": 430,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-04-01T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-01T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64g080wh",
    "sku": "T64G-080-WH",
    "normalizedSku": "T64G080WH",
    "barcode": "9581015735497",
    "brand": "Tarmac Works",
    "name": "VERTEX Toyota Soarer JZZ30 白",
    "scale": "1:64",
    "listPrice": 360,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64gf064ms1",
    "sku": "T64G-F064-MS1",
    "normalizedSku": "T64GF064MS1",
    "barcode": "9581015730379",
    "brand": "Tarmac Works",
    "name": "Mercedes-AMG F1 W14 E Performance Spanish Grand Prix Tyre Testing 2023 Mick Schumacher",
    "scale": "1:64",
    "listPrice": 500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 42,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64gf070op1",
    "sku": "T64G-F070-OP1",
    "normalizedSku": "T64GF070OP1",
    "barcode": "9581015730478",
    "brand": "Tarmac Works",
    "name": "McLaren MCL60 Monaco GP 2023 O. Piastri",
    "scale": "1:64",
    "listPrice": 490,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-03-18T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-18T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64gf070op2",
    "sku": "T64G-F070-OP2",
    "normalizedSku": "T64GF070OP2",
    "barcode": "9581015730492",
    "brand": "Tarmac Works",
    "name": "McLaren MCL60 Australian Grand Prix 2023 Oscar Piastri",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64gtl005bcf",
    "sku": "T64G-TL005-BCF",
    "normalizedSku": "T64GTL005BCF",
    "barcode": "9581015735954",
    "brand": "Tarmac Works",
    "name": "Koenigsegg Agera RS Black Carbon Fiber/Red Accents",
    "scale": "1:64",
    "listPrice": 670,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64gtl017sl",
    "sku": "T64G-TL017-SL",
    "normalizedSku": "T64GTL017SL",
    "barcode": "9581015726716",
    "brand": "Tarmac Works",
    "name": "Koenigsegg Regera Silver Metallic / Blue accents",
    "scale": "1:64",
    "listPrice": 520,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 32,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64gtl028gr",
    "sku": "T64G-TL028-GR",
    "normalizedSku": "T64GTL028GR",
    "barcode": "9581015725214",
    "brand": "Tarmac Works",
    "name": "Dodge Viper ACR Extreme Green Metallic",
    "scale": "1:64",
    "listPrice": 420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-03-18T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-18T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64gtl032me",
    "sku": "T64G-TL032-ME",
    "normalizedSku": "T64GTL032ME",
    "barcode": "9581015725221",
    "brand": "Tarmac Works",
    "name": "Dodge Van Mooneyes",
    "scale": "1:64",
    "listPrice": 540,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-18T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-18T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64gtl051wh",
    "sku": "T64G-TL051-WH",
    "normalizedSku": "T64GTL051WH",
    "barcode": "9581015734575",
    "brand": "Tarmac Works",
    "name": "Koenigsegg CC850 White",
    "scale": "1:64",
    "listPrice": 500,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-03-28T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-28T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64r076re2",
    "sku": "T64R-076-RE2",
    "normalizedSku": "T64R076RE2",
    "barcode": "9581015733400",
    "brand": "Tarmac Works",
    "name": "Ferrari F40 紅",
    "scale": "1:64",
    "listPrice": 670,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64s009yl",
    "sku": "T64S-009-YL",
    "normalizedSku": "T64S009YL",
    "barcode": "4007864056460",
    "brand": "schuco",
    "name": "Porsche 911 Turbo Yellow",
    "scale": "1:64",
    "listPrice": 450,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-04-02T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-04-02T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-t64s025sl",
    "sku": "T64S-025-SL",
    "normalizedSku": "T64S025SL",
    "barcode": "9581677370340",
    "brand": "J Collection",
    "name": "Audi quattro 銀",
    "scale": "1:64",
    "listPrice": 510,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 24
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 38,
    "createdAt": "2026-03-25T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-25T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-test0212",
    "sku": "TEST0212",
    "normalizedSku": "TEST0212",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT TEST0212",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 33,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-ts180333",
    "sku": "TS180333",
    "normalizedSku": "TS180333",
    "barcode": "",
    "brand": "MINI GT",
    "name": "MINI GT TS180333",
    "scale": "1:64",
    "listPrice": 370,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-tsm430864",
    "sku": "TSM430864",
    "normalizedSku": "TSM430864",
    "barcode": "840456308042",
    "brand": "Top speed",
    "name": "Porsche 911 GT3 R (992) #77 AO Racing \n 2025 IMSA DAYTONA 24Hrs",
    "scale": "1:64",
    "listPrice": 3420,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 3
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 8
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 29,
    "createdAt": "2026-07-05T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-07-05T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "prod-y380",
    "sku": "Y380",
    "normalizedSku": "Y380",
    "barcode": "9580006133809",
    "brand": "Sparky",
    "name": "Aston Martin Aramco F1 Team AMR24 #14 Saudi Arabian GP 2024",
    "scale": "1:64",
    "listPrice": 660,
    "stocks": [
      {
        "location": "store",
        "locationName": "門市現貨",
        "quantity": 6
      },
      {
        "location": "warehouse",
        "locationName": "後方倉庫",
        "quantity": 12
      },
      {
        "location": "company",
        "locationName": "公司總倉",
        "quantity": 18
      },
      {
        "location": "other",
        "locationName": "調度暫存",
        "quantity": 0
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Fay"
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    "id": "cust-001",
    "name": "奇可",
    "phone": "0900000000",
    "email": null,
    "vipTier": "S",
    "vipTierName": "S 級特約經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-13T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-13T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-002",
    "name": "Max Gear",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "偏好物流: 順豐",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-003",
    "name": "馬修",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "偏好物流: 順豐",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-004",
    "name": "阿爾法",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-005",
    "name": "烈馬驛站",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-006",
    "name": "東海",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-007",
    "name": "愛瑜",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-008",
    "name": "創Q本館",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ChuangQ",
    "createdAt": "2026-01-04T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-04T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-009",
    "name": "創Q ATT",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ChuangQ",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-010",
    "name": "創Q大魯閣",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ChuangQ",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-011",
    "name": "創Q台茂",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ChuangQ",
    "createdAt": "2026-01-13T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-13T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-012",
    "name": "創Q文心",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ChuangQ",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-013",
    "name": "創Q夢時代",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ChuangQ",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-014",
    "name": "創Q宏匯",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ChuangQ",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-015",
    "name": "極致",
    "phone": "0900000000",
    "email": null,
    "vipTier": "S",
    "vipTierName": "S 級特約經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-13T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-13T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-016",
    "name": "CA",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-017",
    "name": "新光桃園",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ShinKong",
    "createdAt": "2026-01-04T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-04T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-018",
    "name": "新光A8",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ShinKong",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-019",
    "name": "新光高雄",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ShinKong",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-020",
    "name": "新光台中",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ShinKong",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-021",
    "name": "新光天母",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ShinKong",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-022",
    "name": "新光台南",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "note": "群組: Group_ShinKong",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-023",
    "name": "布萊恩",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-04T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-04T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-024",
    "name": "小賈",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-025",
    "name": "王育章",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-026",
    "name": "林佩瑩",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-027",
    "name": "黃彼德",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-028",
    "name": "BOSS",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-029",
    "name": "吳承翰",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-030",
    "name": "GL Lab",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-031",
    "name": "強強",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-032",
    "name": "劉小品",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-033",
    "name": "模例",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-034",
    "name": "Patrick",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-035",
    "name": "INLOVE",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-036",
    "name": "小車迷",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-037",
    "name": "模物",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-038",
    "name": "玩三",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-039",
    "name": "工匠模型",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-040",
    "name": "車模重地",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-041",
    "name": "LEO林雲",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-042",
    "name": "積金Allen",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-043",
    "name": "Henry",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-044",
    "name": "FNRC",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-045",
    "name": "收藏模人",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-046",
    "name": "玩軌",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-047",
    "name": "minitoys",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-048",
    "name": "胖企鵝",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-049",
    "name": "奇駒小豪",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-050",
    "name": "呂志宥",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-02-02T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-02-02T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-051",
    "name": "阿傑",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-052",
    "name": "菘",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-053",
    "name": "李岳勳×",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-054",
    "name": "D MODEL×",
    "phone": "0900000000",
    "email": null,
    "vipTier": "A",
    "vipTierName": "A 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-055",
    "name": "采昕×",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-056",
    "name": "MJ楊亦予×",
    "phone": "0900000000",
    "email": null,
    "vipTier": "B",
    "vipTierName": "B 級批發經銷",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-057",
    "name": "TEST-Customer 001",
    "phone": "0911000999",
    "email": "test@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-01T00:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-058",
    "name": "TEST-Customer 002",
    "phone": "0911000000",
    "email": "test@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-02T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-02T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-059",
    "name": "TEST-Customer 003",
    "phone": "0911111111",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-03T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-01-03T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-060",
    "name": "王裕威",
    "phone": "0963803558",
    "email": "w.yuwei0903@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 470,
    "createdAt": "2026-01-22T22:09:56Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:09:56Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-061",
    "name": "陳詠瑜",
    "phone": "0910311227",
    "email": "yonc053083@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:09:57Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:09:57Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-062",
    "name": "顏承新",
    "phone": "0988358738",
    "email": "ms0454853@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:09:59Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:09:59Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-063",
    "name": "李睿杰",
    "phone": "0958803908",
    "email": "g0958803908@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-064",
    "name": "陳政穎",
    "phone": "0922675970",
    "email": "cjy018119@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:01Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:01Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-065",
    "name": "蔡政芳",
    "phone": "0984263232",
    "email": "pcmrq.y@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:02Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:02Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-066",
    "name": "郭子健",
    "phone": "0963308757",
    "email": "f0963308757@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:03Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:03Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-067",
    "name": "翁偉傑",
    "phone": "0922138521",
    "email": "s0922138521s@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:07Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:07Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-068",
    "name": "曾華彥",
    "phone": "0916587075",
    "email": "aciizgj9@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:09Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:09Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-069",
    "name": "陳昱愷",
    "phone": "0905918261",
    "email": "yukaichen920510@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:10Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:10Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-070",
    "name": "鄭植元",
    "phone": "0910765393",
    "email": "snacksolid@yahoo.com.tw",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:12Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:12Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-071",
    "name": "張良有",
    "phone": "0960635292",
    "email": "moondragonfly1126@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-01-22T22:10:14Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T22:10:14Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-072",
    "name": "王大明",
    "phone": "912345679",
    "email": "123456789a@gmail.com",
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-02-20T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-02-20T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-073",
    "name": "林小華",
    "phone": "0900000000",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-02-06T01:01:51Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-06T01:01:51Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-074",
    "name": "林大華",
    "phone": "0900000000",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 80,
    "createdAt": "2026-02-13T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-13T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-075",
    "name": "王中明",
    "phone": "0900000000",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 930,
    "createdAt": "2026-02-06T02:37:12Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-06T02:37:12Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-076",
    "name": "王小明",
    "phone": "0900000000",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 1780,
    "createdAt": "2026-02-06T04:05:16Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-06T04:05:16Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-077",
    "name": "Jim Huang",
    "phone": "0900000000",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 630,
    "createdAt": "2026-02-10T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-02-10T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-078",
    "name": "TESTFAY",
    "phone": "0900000000",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-02-12T23:25:08Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-12T23:25:08Z",
    "updatedBy": "Fay"
  },
  {
    "id": "cust-079",
    "name": "郭富城",
    "phone": "912345678",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-02-20T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-02-20T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  },
  {
    "id": "cust-080",
    "name": "郭富城",
    "phone": "987654321",
    "email": null,
    "vipTier": "Retail",
    "vipTierName": "零售客戶 (Retail)",
    "totalSpent": 0,
    "createdAt": "2026-02-20T10:00:00Z",
    "createdBy": "chenfay@google.com",
    "updatedAt": "2026-02-20T10:00:00Z",
    "updatedBy": "chenfay@google.com"
  }
];

export const INITIAL_ORDERS: CheckoutOrder[] = [
  {
    "id": "so-tr-20260122-012",
    "orderNumber": "TR-20260122-012",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerName": "Retail",
    "items": [
      {
        "productId": "prod-mgt01100l",
        "sku": "MGT01100-L",
        "name": "Lamborghini Countach LB-WORKS Red LHD",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 370,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 370,
        "note": "MGT01052-L 瑕疵退換"
      },
      {
        "productId": "prod-mgt01009l",
        "sku": "MGT01009-L",
        "name": "Porsche 911 Dakar Rally 1974",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 370,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 370,
        "note": "MGT01052-L 瑕疵退換"
      },
      {
        "productId": "prod-mgt01052l",
        "sku": "MGT01052-L",
        "name": "Porsche 911 GT3 R #77 AO Racing \n 2024 IMSA ROAD AMERICA",
        "scale": "1:64",
        "originalPrice": 510,
        "unitPrice": 510,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 510,
        "note": "MGT01052-L 瑕疵退換"
      }
    ],
    "itemsSubtotal": 1250,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 1250,
    "payments": [
      {
        "type": "line_pay",
        "name": "LINE Pay",
        "amount": 1250
      }
    ],
    "note": "MGT01052-L 瑕疵退換",
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-tr-20260122-015",
    "orderNumber": "TR-20260122-015",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerId": "cust-060",
    "customerName": "王裕威",
    "customerPhone": "0963803558",
    "items": [
      {
        "productId": "prod-mgt00895r",
        "sku": "MGT00895-R",
        "name": "Nissan LB-Super Silhouette S15 SILVIA #555 2023 Formula Drift Japan RHD",
        "scale": "1:64",
        "originalPrice": 470,
        "unitPrice": 470,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 470
      }
    ],
    "itemsSubtotal": 470,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 470,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 470
      }
    ],
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-tr-20260122-039",
    "orderNumber": "TR-20260122-039",
    "cashierId": "staff-001",
    "cashierName": "Martin",
    "status": "completed",
    "customerName": "Retail",
    "items": [
      {
        "productId": "prod-840456307557",
        "sku": "840456307557",
        "name": "MINI GT 840456307557",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 0,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 0
      }
    ],
    "itemsSubtotal": 0,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 0,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 0
      }
    ],
    "createdAt": "2026-01-22T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-01-22T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "so-tr-20260123-040",
    "orderNumber": "TR-20260123-040",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerName": "909876543",
    "items": [
      {
        "productId": "prod-mgt00813bl",
        "sku": "MGT00813-BL",
        "name": "Lamborghini Huracan GT3 EVO2 #63 Iron Lynx IMSA 2023 Daytona 24 Hrs. LHD/ Blister Packaging",
        "scale": "1:64",
        "originalPrice": 470,
        "unitPrice": 470,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 470
      },
      {
        "productId": "prod-mgt00813l",
        "sku": "MGT00813-L",
        "name": "Lamborghini Huracan GT3 EVO2 #63 Iron Lynx IMSA 2023 Daytona 24 Hrs. LHD",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 430,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 430,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-mgt00855bl",
        "sku": "MGT00855-BL",
        "name": "Nissan Silvia (S15) D-MAX #70 D-MAX Racing 2023 D1 Grand Prix - Japan Exclusive RHD / D1 Blister Packaging",
        "scale": "1:64",
        "originalPrice": 600,
        "unitPrice": 600,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 600,
        "note": "(退換)"
      }
    ],
    "itemsSubtotal": 1500,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 1500,
    "payments": [
      {
        "type": "line_pay",
        "name": "LINE Pay",
        "amount": 1500
      }
    ],
    "note": "(點數折抵)；(退換)",
    "createdAt": "2026-01-23T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-23T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-tr-20260123-043",
    "orderNumber": "TR-20260123-043",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerName": "Retail",
    "items": [
      {
        "productId": "prod-mgt01024r",
        "sku": "MGT01024-R",
        "name": "Nissan Skyline GT-R (NISMO BNR32 CRS Version) \n Dark Metal Gray",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 370,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 370,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-ad2428",
        "sku": "AD-2428",
        "name": "1:64 Figure Set: Behind the Scenes 2\n (Include 4 figures & 5 accessories total 9 pieces)",
        "scale": "配件周邊",
        "originalPrice": 560,
        "unitPrice": 560,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 560,
        "note": "(退換)"
      }
    ],
    "itemsSubtotal": 930,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 930,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 930
      }
    ],
    "note": "(點數折抵)；(退換)",
    "createdAt": "2026-01-23T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-01-23T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-tr-20260206-061",
    "orderNumber": "TR-20260206-061",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerId": "cust-075",
    "customerName": "王中明",
    "customerPhone": "0900000000",
    "items": [
      {
        "productId": "prod-mgt01007bl",
        "sku": "MGT01007-BL",
        "name": "#1007BL RB VCARB 01 #22 Y. Tsunoda 2024 F1 Bahrain GP 吊卡版",
        "scale": "1:64",
        "originalPrice": 560,
        "unitPrice": 560,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 560,
        "note": "現貨加購 (原預購單號:Pre-20260205-004)"
      },
      {
        "productId": "prod-mgt01007bl",
        "sku": "MGT01007-BL",
        "name": "#1007BL RB VCARB 01 #22 Y. Tsunoda 2024 F1 Bahrain GP 吊卡版",
        "scale": "1:64",
        "originalPrice": 560,
        "unitPrice": 0,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 0,
        "note": "(瑕疵) (瑕疵)"
      }
    ],
    "itemsSubtotal": 560,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 560,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 560
      }
    ],
    "note": "現貨加購 (原預購單號:Pre-20260205-004)；(瑕疵) (瑕疵)",
    "createdAt": "2026-02-06T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-06T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-pay-20260206-034823-34",
    "orderNumber": "PAY-20260206-034823-34",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerId": "cust-074",
    "customerName": "林大華",
    "customerPhone": "0900000000",
    "items": [
      {
        "productId": "prod-mgt00777l",
        "sku": "MGT00777-L",
        "name": "McLaren 720S LB★WORKS Black LHD",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 0,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 0,
        "note": "(瑕疵) (瑕疵)"
      },
      {
        "productId": "prod-mgt00777r",
        "sku": "MGT00777-R",
        "name": "McLaren 720S LB★WORKS Black RHD",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 40,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 40,
        "note": "(點數折抵)"
      }
    ],
    "itemsSubtotal": 40,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 40,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 40
      }
    ],
    "note": "(瑕疵) (瑕疵)；(點數折抵)",
    "createdAt": "2026-02-06T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-06T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-pay-20260206-040630-72",
    "orderNumber": "PAY-20260206-040630-72",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerId": "cust-076",
    "customerName": "王小明",
    "customerPhone": "0900000000",
    "items": [
      {
        "productId": "prod-mgt00777r",
        "sku": "MGT00777-R",
        "name": "McLaren 720S LB★WORKS Black RHD",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 0,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 0,
        "note": "(瑕疵) (瑕疵)"
      },
      {
        "productId": "prod-khmg999",
        "sku": "KHMG999",
        "name": "MINI GT KHMG999",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 0,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 0,
        "note": "(點數折抵)"
      }
    ],
    "itemsSubtotal": 0,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 0,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 0
      }
    ],
    "note": "(瑕疵) (瑕疵)；(點數折抵)",
    "createdAt": "2026-02-06T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-06T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-pay-20260206-041805-9",
    "orderNumber": "PAY-20260206-041805-9",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerId": "cust-076",
    "customerName": "王小明",
    "customerPhone": "0900000000",
    "items": [
      {
        "productId": "prod-mgt00777blc",
        "sku": "MGT00777-BLC",
        "name": "MGT00777-BLC",
        "scale": "1:64",
        "originalPrice": 2500,
        "unitPrice": 1780,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 1780,
        "note": "(點數折抵) (點數折抵)"
      },
      {
        "productId": "prod-khmg888",
        "sku": "KHMG888",
        "name": "MINI GT KHMG888",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 0,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 0,
        "note": "(瑕疵) (瑕疵)"
      }
    ],
    "itemsSubtotal": 1780,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 1780,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 1780
      }
    ],
    "note": "(點數折抵) (點數折抵)；(瑕疵) (瑕疵)",
    "createdAt": "2026-02-06T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-06T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-pay-20260206-111122-51",
    "orderNumber": "PAY-20260206-111122-51",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerId": "cust-074",
    "customerName": "林大華",
    "customerPhone": "0900000000",
    "items": [
      {
        "productId": "prod-mgt00666mjc",
        "sku": "MGT00666-MJC",
        "name": "MGT00666-MJC",
        "scale": "1:64",
        "originalPrice": 400,
        "unitPrice": 40,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 40,
        "note": "(點數折抵) (點數折抵)"
      },
      {
        "productId": "prod-khmg888",
        "sku": "KHMG888",
        "name": "MINI GT KHMG888",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 0,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 0,
        "note": "(瑕疵) (瑕疵)"
      }
    ],
    "itemsSubtotal": 40,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 40,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 40
      }
    ],
    "note": "(點數折抵) (點數折抵)；(瑕疵) (瑕疵)",
    "createdAt": "2026-02-06T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-06T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-pay-20260210-1900-093",
    "orderNumber": "PAY-20260210-1900-093",
    "cashierId": "staff-001",
    "cashierName": "Martin",
    "status": "completed",
    "customerId": "cust-077",
    "customerName": "Jim Huang",
    "customerPhone": "0900000000",
    "items": [
      {
        "productId": "prod-mgt00869r",
        "sku": "MGT00869-R",
        "name": "Nissan Skyline GT-R (R32) Nismo Gunmetal W/ Matsuda Figure Tsugio Matsuda Collection",
        "scale": "1:64",
        "originalPrice": 520,
        "unitPrice": 160,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 160,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-mgt00998l",
        "sku": "MGT00998-L",
        "name": "BMW Z8 Silver",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 70,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 70,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-mgt01103l",
        "sku": "MGT01103-L",
        "name": "LB★WORKS Toyota GR Supra Red/White",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 70,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 70,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-mgt00843bl",
        "sku": "MGT00843-BL",
        "name": "Nissan LB-ER34 Super Silhouette SKYLINE Red/Black/ Blister Packaging",
        "scale": "1:64",
        "originalPrice": 470,
        "unitPrice": 110,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 110,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-mgt00990bl",
        "sku": "MGT00990-BL",
        "name": "Mazda RX-7 LB-Super Silhouette 787B \n / Blister Packaging",
        "scale": "1:64",
        "originalPrice": 520,
        "unitPrice": 160,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 160,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-ad2402",
        "sku": "AD-2402",
        "name": "Weekend Warriors",
        "scale": "配件周邊",
        "originalPrice": 420,
        "unitPrice": 60,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 60,
        "note": "(點數折抵)"
      }
    ],
    "itemsSubtotal": 630,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 630,
    "payments": [
      {
        "type": "credit_card_physical",
        "name": "信用卡(實體)",
        "amount": 630
      }
    ],
    "note": "(點數折抵)",
    "createdAt": "2026-02-10T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-02-10T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "so-pay-20260315-1420-107",
    "orderNumber": "PAY-20260315-1420-107",
    "cashierId": "staff-001",
    "cashierName": "Martin",
    "status": "completed",
    "customerName": "Retail",
    "items": [
      {
        "productId": "prod-mgt01089r",
        "sku": "MGT01089-R",
        "name": "NISSAN GT-R 2013 Dark Metal Gray \n (NISMO R35 CRS Version)",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 10,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 10,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-mgt01106l",
        "sku": "MGT01106-L",
        "name": "Mazda RX-7 RE-Amemiya Silver Metallic",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 430,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 430
      }
    ],
    "itemsSubtotal": 440,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 440,
    "payments": [
      {
        "type": "cash",
        "name": "現金",
        "amount": 440
      }
    ],
    "note": "(點數折抵)",
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "so-tr-20260205-051",
    "orderNumber": "TR-20260205-051",
    "cashierId": "staff-001",
    "cashierName": "Fay",
    "status": "completed",
    "customerId": "cust-075",
    "customerName": "王中明",
    "customerPhone": "0900000000",
    "items": [
      {
        "productId": "prod-mgt00717bl",
        "sku": "MGT00717-BL",
        "name": "Porsche 911 1964 Slate Grey LHD/ Blister Packaging",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 0,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 0,
        "note": "(瑕疵)"
      }
    ],
    "itemsSubtotal": 0,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 0,
    "payments": [
      {
        "type": "credit_card_physical",
        "name": "信用卡(實體)",
        "amount": 0
      }
    ],
    "note": "(瑕疵)",
    "createdAt": "2026-02-05T10:00:00Z",
    "createdBy": "Fay",
    "updatedAt": "2026-02-05T10:00:00Z",
    "updatedBy": "Fay"
  },
  {
    "id": "so-pay-20260210-0349-089",
    "orderNumber": "PAY-20260210-0349-089",
    "cashierId": "staff-001",
    "cashierName": "Martin",
    "status": "completed",
    "customerId": "cust-075",
    "customerName": "王中明",
    "customerPhone": "0900000000",
    "items": [
      {
        "productId": "prod-mgt01080l",
        "sku": "MGT01080-L",
        "name": "BMW M5 Touring (G99) Marina Bay \n Blue Metallic",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 370,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 370
      }
    ],
    "itemsSubtotal": 370,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 370,
    "payments": [
      {
        "type": "credit_card_physical",
        "name": "信用卡(實體)",
        "amount": 370
      }
    ],
    "createdAt": "2026-02-10T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-02-10T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "so-pay-20260315-1520-132",
    "orderNumber": "PAY-20260315-1520-132",
    "cashierId": "staff-001",
    "cashierName": "Martin",
    "status": "completed",
    "customerName": "Retail",
    "items": [
      {
        "productId": "prod-mgt01124bl",
        "sku": "MGT01124-BL",
        "name": "LB-Silhouette WORKS GT \n NISSAN 35GT-RR Ver.2 Blue\n /Blister packaging",
        "scale": "1:64",
        "originalPrice": 470,
        "unitPrice": 470,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 470
      },
      {
        "productId": "prod-mgt00803bl",
        "sku": "MGT00803-BL",
        "name": "Lamborghini Aventador SVJ 63 Roadster Nero Aldebaran LHD / Blister Packaging",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 400,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 400
      },
      {
        "productId": "prod-mgt01080bl",
        "sku": "MGT01080-BL",
        "name": "BMW M5 Touring (G99) Marina Bay \n Blue Metallic\n /Blister packaging",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 430,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 430
      },
      {
        "productId": "prod-mgt00788r",
        "sku": "MGT00788-R",
        "name": "Lamborghini Huracán STO Bianco Asopo RHD",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 10,
        "isManualPrice": true,
        "priceDiffReason": "議價/折扣",
        "quantity": 1,
        "subtotal": 10,
        "note": "(點數折抵)"
      },
      {
        "productId": "prod-mgt01101r",
        "sku": "MGT01101-R",
        "name": "MAZDA RX-7 LB-Super Silhouette FD-NILES RHD",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 430,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 430
      }
    ],
    "itemsSubtotal": 1740,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 1740,
    "payments": [
      {
        "type": "credit_card_physical",
        "name": "信用卡(實體)",
        "amount": 1740
      }
    ],
    "note": "(點數折抵)",
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Martin"
  },
  {
    "id": "so-pay-20260315-1720-182",
    "orderNumber": "PAY-20260315-1720-182",
    "cashierId": "staff-001",
    "cashierName": "Martin",
    "status": "completed",
    "customerName": "Retail",
    "items": [
      {
        "productId": "prod-khmg172",
        "sku": "KHMG172",
        "name": "Nissan Fairlady Z Kaido GT ADVAN",
        "scale": "1:64",
        "originalPrice": 630,
        "unitPrice": 630,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 630
      },
      {
        "productId": "prod-mgt01100l",
        "sku": "MGT01100-L",
        "name": "Lamborghini Countach LB-WORKS Red LHD",
        "scale": "1:64",
        "originalPrice": 370,
        "unitPrice": 370,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 370
      },
      {
        "productId": "prod-mgt00843r",
        "sku": "MGT00843-R",
        "name": "Nissan LB-ER34 Super Silhouette SKYLINE Red/Black",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 430,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 430
      },
      {
        "productId": "prod-mgt00785r",
        "sku": "MGT00785-R",
        "name": "MAZDA RX-7 LB-Super Silhouette Liberty Walk Black",
        "scale": "1:64",
        "originalPrice": 430,
        "unitPrice": 430,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 430
      },
      {
        "productId": "prod-mgt01124bl",
        "sku": "MGT01124-BL",
        "name": "LB-Silhouette WORKS GT \n NISSAN 35GT-RR Ver.2 Blue\n /Blister packaging",
        "scale": "1:64",
        "originalPrice": 470,
        "unitPrice": 470,
        "isManualPrice": false,
        "quantity": 1,
        "subtotal": 470
      }
    ],
    "itemsSubtotal": 2330,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 2330,
    "payments": [
      {
        "type": "credit_card_physical",
        "name": "信用卡(實體)",
        "amount": 2330
      }
    ],
    "createdAt": "2026-03-15T10:00:00Z",
    "createdBy": "Martin",
    "updatedAt": "2026-03-15T10:00:00Z",
    "updatedBy": "Martin"
  }
];
