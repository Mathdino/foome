import { CreateUserPrams, GetMenuParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appWriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.foome",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "6a023a12000993b55e80",
  bucketId: "6a038a35001352b683f2",
  userCollectionId: "user",
  categoriesCollectionId: "categories",
  menuCollectionId: "menu",
  customizationsCollectionId: "customizations",
  menuCustomizationsCollectionId: "menu_customizations",
};

export const client = new Client();

client.setEndpoint(appWriteConfig.endpoint);
client.setProject(appWriteConfig.projectId);
client.setPlatform(appWriteConfig.platform);

export const account = new Account(client);
export const database = new Databases(client);
export const avatars = new Avatars(client);
export const storage = new Storage(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserPrams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) {
      throw new Error("Usuário não criado");
    }

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await database.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        name,
        email,
        avatar: avatarUrl,
      },
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) {
      throw new Error("Conta não encontrada");
    }

    const currentUser = await database.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)],
    );

    if (!currentUser) {
      throw new Error("Usuário não encontrado");
    }

    return currentUser.documents[0];
  } catch (e) {
    console.log(e);
    throw new Error(e as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await database.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.menuCollectionId,
      queries,
    );

    return menus.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCategories = async () => {
  try {
    const categories = await database.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.categoriesCollectionId,
    );
    return categories.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};
