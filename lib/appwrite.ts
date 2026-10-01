import {
  Account,
  Avatars,
  Client,
  Storage,
  Databases,
  Query,
  ID,
  Functions,
} from "react-native-appwrite";
import {
  SignInParams,
  CreateUserParams,
  GetMenuParams,
  MenuItem,
  Category,
  UpdateUserParams,
  User,
  CreateOrderParams,
} from "@/type";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: "com.em.foodordering",
  databaseId: "6a493a6b00002343a467",
  bucketId: "6a4e80ee001a68ef4445",
  userCollectionId: "user",
  categoriesCollectionId: "categories",
  menuCollectionId: "menu",
  customizationsCollectionId: "customizations",
  menuCustomizationsCollectionId: "menu_customizations",
  ordersCollectionId: "6abe2405000aa91d45f3",
  paymentFunctionId: "6abe33f70038fe787c6a",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

const toError = (e: unknown) =>
  new Error(e instanceof Error ? e.message : String(e));

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Could not create account.");

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { email, name, accountId: newAccount.$id, avatar: avatarUrl },
    );
  } catch (e) {
    throw toError(e);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    await account.deleteSession("current").catch(() => {});
    await account.createEmailPasswordSession(email, password);
  } catch (e) {
    throw toError(e);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No active account.");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)],
    );

    return currentUser.documents[0];
  } catch (e) {
    console.log(e);
    throw toError(e);
  }
};

export const getMenu = async ({ category, query, limit }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));
    if (limit) queries.push(Query.limit(limit));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries,
    );

    return menus.documents as unknown as MenuItem[];
  } catch (e) {
    throw toError(e);
  }
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
    );

    return categories.documents as unknown as Category[];
  } catch (e) {
    throw toError(e);
  }
};

export const getMenuItem = async ({ id }: { id: string }) => {
  try {
    const item = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      id,
    );

    return item as unknown as MenuItem;
  } catch (e) {
    throw toError(e);
  }
};

export const getMenuImageUrl = (imageUrl: string) =>
  `${imageUrl}?project=${appwriteConfig.projectId}`;

export const signOut = async () => {
  try {
    await account.deleteSession("current");
  } catch (e) {
    throw toError(e);
  }
};

export const updateUser = async (userId: string, params: UpdateUserParams) => {
  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      params,
    );

    return updated as unknown as User;
  } catch (e) {
    throw toError(e);
  }
};

export const uploadAvatar = async (file: {
  name: string;
  type: string;
  size: number;
  uri: string;
}) => {
  try {
    const filename = file.name || `avatar_${Date.now()}.jpg`;
    const mimeType = file.type || "image/jpeg";
    const fileId = ID.unique();

    // 1. Transformăm imaginea din dispozitiv într-un Blob real
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // 2. Construim FormData cu Blob-ul nativ (acceptat de noul fetch din Expo)
    const formData = new FormData();
    formData.append("fileId", fileId);
    formData.append("file", blob, filename);

    // 3. Trimitem cererea direct către Appwrite Storage API
    const uploadUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "X-Appwrite-Project": appwriteConfig.projectId,
        // Nu setăm manual 'Content-Type': fetch setează automat multipart/form-data cu boundary-ul corect!
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
    }

    const uploadedFileData = await uploadResponse.json();

    // 4. Returnăm URL-ul final pentru vizualizarea imaginii
    const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${uploadedFileData.$id}/view?project=${appwriteConfig.projectId}`;

    return fileUrl;
  } catch (e) {
    console.error("Storage upload error:", e);
    throw toError(e);
  }
};

const functions = new Functions(client);

export const createPaymentIntent = async (amount: number) => {
  try {
    const execution = await functions.createExecution({
      functionId: appwriteConfig.paymentFunctionId,
      body: JSON.stringify({ amount }),
    });

    const result = JSON.parse(execution.responseBody);
    if (execution.responseStatusCode >= 400) {
      throw new Error(result.error ?? "Could not start the payment.");
    }

    return result as { clientSecret: string; paymentIntentId: string };
  } catch (e) {
    throw toError(e);
  }
};

export const createOrder = async (params: CreateOrderParams) => {
  try {
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      ID.unique(),
      { ...params, items: JSON.stringify(params.items), status: "paid" },
    );
  } catch (e) {
    throw toError(e);
  }
};
