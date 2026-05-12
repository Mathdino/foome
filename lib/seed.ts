import { ID } from "react-native-appwrite";
import { appWriteConfig, database } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[]; // list of customization names
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  const list = await database.listDocuments(
    appWriteConfig.databaseId,
    collectionId,
  );

  await Promise.all(
    list.documents.map((doc) =>
      database.deleteDocument(appWriteConfig.databaseId, collectionId, doc.$id),
    ),
  );
}


async function seed(): Promise<void> {
  try {
    // 1. Create Categories
    console.log("⏳ Criando categorias...");
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      const doc = await database.createDocument(
        appWriteConfig.databaseId,
        appWriteConfig.categoriesCollectionId,
        ID.unique(),
        cat,
      );
      categoryMap[cat.name] = doc.$id;
      console.log(`  ✅ Categoria criada: ${cat.name}`);
    }

    // 2. Create Customizations
    console.log("⏳ Criando customizações...");
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
      const doc = await database.createDocument(
        appWriteConfig.databaseId,
        appWriteConfig.customizationsCollectionId,
        ID.unique(),
        {
          name: cus.name,
          price: cus.price,
          type: cus.type,
        },
      );
      customizationMap[cus.name] = doc.$id;
      console.log(`  ✅ Customização criada: ${cus.name}`);
    }

    // 3. Create Menu Items
    console.log("⏳ Criando itens do menu...");
    for (const item of data.menu) {
      const doc = await database.createDocument(
        appWriteConfig.databaseId,
        appWriteConfig.menuCollectionId,
        ID.unique(),
        {
          name: item.name,
          description: item.description,
          image_url: item.image_url,
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          categories: categoryMap[item.category_name],
        },
      );
      console.log(`  ✅ Item do menu criado: ${item.name}`);

      // 4. Create menu_customizations
      for (const cusName of item.customizations) {
        const cusId = customizationMap[cusName];
        if (!cusId) {
          console.warn(
            `  ⚠️ Customização não encontrada: "${cusName}" — pulando.`,
          );
          continue;
        }
        await database.createDocument(
          appWriteConfig.databaseId,
          appWriteConfig.menuCustomizationsCollectionId,
          ID.unique(),
          {
            menu: doc.$id,
            customizations: cusId,
          },
        );
      }
      console.log(
        `  ✅ Customizações do menu vinculadas: ${item.name} (${item.customizations.length})`,
      );
    }

    console.log("✅ Seeding completo.");
  } catch (error) {
    console.error("❌ Erro durante o seeding:", error);
    throw error;
  }
}

export default seed;
