import {
  CreateOrderParams,
  CreateUserPrams,
  GetMenuParams,
  SignInParams,
  UpdateUserProfileParams,
} from "@/type";
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
  ordersCollectionId: "order",
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
    try {
      await account.deleteSession("current");
    } catch {}

    let newAccount;
    try {
      newAccount = await account.create(ID.unique(), email, password, name);
    } catch (err: any) {
      const code = err?.code ?? err?.response?.code;
      const type = err?.type ?? err?.response?.type;
      if (code === 409 || type === "user_already_exists") {
        throw new Error(
          "Já existe uma conta com este e-mail. Faça login ou use outro e-mail.",
        );
      }
      throw err;
    }

    if (!newAccount) {
      throw new Error("Usuário não criado");
    }

    try {
      await account.deleteSessions();
    } catch {}

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
  } catch (e: any) {
    throw new Error(e?.message ?? String(e));
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

export const updateUserProfile = async ({
  userId,
  name,
  phones,
  addresses,
}: UpdateUserProfileParams) => {
  try {
    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name;
    if (phones !== undefined) data.phones = phones;
    if (addresses !== undefined) data.addresses = addresses;

    return await database.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      userId,
      data,
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

type UploadAvatarFile = {
  uri: string;
  name: string;
  type: string;
  size: number;
};

export const uploadAvatar = async (file: UploadAvatarFile) => {
  try {
    const uploaded = await storage.createFile(
      appWriteConfig.bucketId,
      ID.unique(),
      file,
    );

    return `${appWriteConfig.endpoint}/storage/buckets/${appWriteConfig.bucketId}/files/${uploaded.$id}/view?project=${appWriteConfig.projectId}`;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  try {
    return await database.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      userId,
      { avatar: avatarUrl },
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession("current");
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getMenuById = async (id: string) => {
  try {
    const menu = await database.getDocument(
      appWriteConfig.databaseId,
      appWriteConfig.menuCollectionId,
      id,
    );

    const links = await database.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.menuCustomizationsCollectionId,
      [Query.equal("menu", id)],
    );

    const customizations = await Promise.all(
      links.documents.map(async (l: any) => {
        const c = l.customizations;
        if (c && typeof c === "object" && c.$id) return c;
        if (typeof c === "string") {
          try {
            return await database.getDocument(
              appWriteConfig.databaseId,
              appWriteConfig.customizationsCollectionId,
              c,
            );
          } catch {
            return null;
          }
        }
        return null;
      }),
    );

    let category: any = (menu as any).categories;
    if (category && typeof category === "string") {
      try {
        category = await database.getDocument(
          appWriteConfig.databaseId,
          appWriteConfig.categoriesCollectionId,
          category,
        );
      } catch {
        category = null;
      }
    }

    return {
      menu: { ...menu, category },
      customizations: customizations.filter(Boolean),
    };
  } catch (e) {
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

export const createOrder = async (params: CreateOrderParams) => {
  try {
    return await database.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.ordersCollectionId,
      ID.unique(),
      {
        ...params,
        items: params.items.map((item) => JSON.stringify(item)),
      },
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getOrders = async (userId: string) => {
  try {
    const res = await database.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.ordersCollectionId,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
    );
    return res.documents.map((doc) => ({
      ...doc,
      items: (doc.items as string[]).map((i) => JSON.parse(i)),
    }));
  } catch (e) {
    throw new Error(e as string);
  }
};
