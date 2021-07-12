import axios, { AxiosRequestConfig } from "axios";
import snakeToCamelCase from "helpers/snakeToCamelCase";
import { Brand } from "interfaces/Brand";
import { Creator } from "interfaces/Creator";
import { Endpoint } from "interfaces/Endpoint";
import { Function } from "interfaces/Function";
import { FeedItem } from "interfaces/FeedItem";
import { Login } from "interfaces/Login";
import { Product } from "interfaces/Product";
import { Role } from "interfaces/Role";
import { Tag } from "interfaces/Tag";
import { User } from "interfaces/User";
import { Privilege } from "interfaces/Privilege";
import { PromoCode } from "interfaces/PromoCode";
import {
  AllCategoriesAPI,
  Category,
  ProductCategory,
} from "interfaces/Category";

export const instance = axios.create({
  baseURL: process.env.REACT_APP_HOST_ENDPOINT,
  headers: { "Content-Type": "application/json" },
});

interface IDelete {
  id: string;
}

function replaceIdRecursively(obj: any) {
  for (let prop in obj) {
    if (prop === "id") {
      obj["_id"] = obj[prop];
      delete obj[prop];
    } else if (typeof obj[prop] === "object") replaceIdRecursively(obj[prop]);
  }
}

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  if (config.data) {
    replaceIdRecursively(config.data);
  }
  config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

instance.interceptors.response.use(
  (response) => {
    if (response?.data?.error) {
      if (
        response.data.error.toUpperCase() ===
        "Unauthorized request".toUpperCase()
      ) {
        localStorage.clear();
        window.location.href = "./";
      }
    }
    return snakeToCamelCase(response.data);
  },
  (error) => {
    switch (error.response?.status) {
      case 404:
      case 401: {
        localStorage.clear();
        window.location.href = "./";
      }
    }
  }
);

export const fetchStartupVideo = () => instance.get("Wi/Ep/GetStartupVideo");

export const fetchVideoFeed = () => instance.get("Wi/Ep/ListVideoFeed");

export const fetchProducts = () => instance.get("Wi/Ep/ListProducts");

export const fetchStagingProducts = () =>
  instance.put("Disco/Staging/Product/List", {});

export const fetchBrands = () => instance.get("Wi/Ep/ListBrands");

export const fetchCategories = () => instance.get("Wi/Ep/GetProductCategories");

export const productCategoriesAPI: AllCategoriesAPI = {
  supercategory: {
    fetch: () => instance.get(`Wi/Ep/ListProductSuperCategories`),
    save: (params: ProductCategory) => {
      if (params.id) {
        return instance.post("Wi/Ep/UpdateProductSuperCategories", params);
      } else {
        return instance.put("Wi/EP/AddProductSuperCategories", params);
      }
    },
    delete: (data: IDelete) =>
      instance.delete(`Wi/Ep/RemoveProductSuperCategories`, { data }),
  },
  category: {
    fetch: () => instance.get(`Wi/Ep/ListProductCategories`),
    save: (params: ProductCategory) => {
      if (params.id) {
        return instance.post("Wi/Ep/UpdateProductCategories", params);
      } else {
        return instance.put("Wi/EP/AddProductCategories", params);
      }
    },
    delete: (data: IDelete) =>
      instance.delete(`Wi/Ep/RemoveProductCategories`, { data }),
  },
  subcategory: {
    fetch: () => instance.get(`Wi/Ep/ListProductSubCategories`),
    save: (params: ProductCategory) => {
      if (params.id) {
        return instance.post("Wi/Ep/UpdateProductSubCategories", params);
      } else {
        return instance.put("Wi/EP/AddProductSubCategories", params);
      }
    },
    delete: (data: IDelete) =>
      instance.delete(`Wi/Ep/RemoveProductSubCategories`, { data }),
  },
  subsubcategory: {
    fetch: () => instance.get(`Wi/Ep/ListProductSubSubCategories`),
    save: (params: ProductCategory) => {
      if (params.id) {
        return instance.post("Wi/Ep/UpdateProductSubSubCategories", params);
      } else {
        return instance.put("Wi/EP/AddProductSubSubCategories", params);
      }
    },
    delete: (data: IDelete) =>
      instance.delete(`Wi/Ep/RemoveProductSubSubCategories`, { data }),
  },
};

export const fetchTags = () => instance.get("Wi/Ep/ListTags");

export const fetchCreators = () => instance.get("Wi/Ep/ListCreators");

export const fetchUsers = () => instance.get("Wi/Ep/ListUsers");

export const fetchFans = () => instance.get("Wi/Ep/ListFans");

export const fetchProfiles = () => instance.get("Wi/Ep/ListProfiles");

export const fetchFunctions = () => instance.get("Wi/Ep/ListFunctions");

export const fetchEndpoints = () => instance.get("Wi/Ep/ListEndpoints");

export const fetchInterfaces = () => instance.get("Wi/Ep/ListInterfaces");

export const fetchSettings = () => instance.get("Wi/Ep/GetSettings");

export const fetchPrivileges = (profile: string) =>
  instance.put("Wi/Ep/ListPrivileges", { profile });

export const fetchOrders = () => instance.get("Wi/Ep/ListOrders");

export const fetchWalletTransactions = (userId: string) =>
  instance.put("Wi/Ep/GetWalletTransactions", { userId });

export const fetchUserFeed = (userId: string) =>
  instance.get(`Disco/Feed/GetUserFeed/${userId}`);

export const fetchPromoCodes = () => instance.get("Wi/Ep/ListPromoCodes");

export const saveVideoFeed = (params: FeedItem) => {
  if (params.id) {
    return instance.put("Disco/Feed/Update", params);
  } else {
    return instance.put("Disco/Feed/Add", params);
  }
};

export const saveProduct = (params: Product) => {
  if (params.id) {
    return instance.post("/Disco/Product/Update", params);
  } else {
    return instance.put("/Disco/Product/Add", params);
  }
};

export const saveStagingProduct = (params: Product) =>
  instance.post("Disco/Staging/Product/Update", params);

export const saveCreator = (params: Creator) => {
  if (params.id) {
    return instance.post("Disco/Creator/Update", params);
  } else {
    return instance.put("Disco/Creator/Add", params);
  }
};

export const saveTag = (params: Tag) => {
  if (params.id) {
    return instance.post("Wi/Ep/UpdateTag", params);
  } else {
    return instance.put("Wi/EP/AddTag", params);
  }
};

export const saveBrand = (params: Brand) => {
  if (params.id) {
    return instance.post("Disco/Brand/Update", params);
  } else {
    return instance.put("Wi/EP/AddBrand", params);
  }
};

export const saveCategory = (params: Category) => {
  if (params.id) {
    return instance.post("Wi/Ep/UpdateCategory", params);
  } else {
    return instance.put("Wi/EP/AddCategory", params);
  }
};

export const saveEndpoint = (params: Endpoint) => {
  if (params.id) {
    return instance.post("Wi/Ep/UpdateEndpoint", params);
  } else {
    return instance.put("Wi/EP/AddEndpoint", params);
  }
};

export const saveInterface = (params: Function) => {
  params.type = "interface";
  if (params.id) {
    return instance.post("Wi/Ep/UpdateFunction", params);
  } else {
    return instance.put("Wi/EP/AddFunction", params);
  }
};

export const saveUser = (params: User) => {
  if (params.id) {
    return instance.post("Disco/Identity/UpdateUser", params);
  } else {
    return instance.put("Disco/Identity/AddUser", params);
  }
};

export const saveRole = (params: Role) => {
  if (params.id) {
    return instance.post("Wi/Ep/UpdateProfile", params);
  } else {
    return instance.put("Wi/EP/AddProfile", params);
  }
};

export const saveSettings = (params: any) => {
  return instance.post("Wi/Ep/UpdateSettings", params);
};

export const savePrivileges = (params: Privilege) => {
  return instance.post("Wi/Ep/AddPrivilege", params);
};

export const saveOrder = (params: any) => {
  if (params.id) {
    return instance.post("Wi/Ep/UpdateOrder", params);
  } else {
    return instance.put("Wi/EP/AddOrder", params);
  }
};

export const saveUserFeed = (userId: string, payload: any) =>
  instance.put(`Disco/Feed/UpdateUserFeed/${userId}`, payload);

export const savePromoCode = (params: PromoCode) => {
  if (params.id) {
    return instance.post("Wi/Ep/UpdatePromoCode", params);
  } else {
    return instance.put("Wi/EP/AddPromoCode", params);
  }
};

export const deletePrivileges = (data: Privilege) =>
  instance.delete("Wi/Ep/RemovePrivilege", { data });

export const deleteVideoFeed = (id: string) =>
  instance.delete(`Disco/Feed/Delete/${id}`);

export const deleteTag = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemoveTag`, { data });

export const deleteCreator = (id: string) =>
  instance.delete(`Disco/Creator/Delete/${id}`);

export const deleteProduct = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemoveProduct`, { data });

export const deleteStagingProduct = (id: string) =>
  instance.delete(`Disco/Staging/Product/Remove/${id}`);

export const deleteBrand = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemoveBrand`, { data });

export const deleteCategory = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemoveCategory`, { data });

export const deletePromoCode = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemovePromoCode`, { data });

export const loginService = (login: Login) =>
  instance.put("Auth/GetApiToken", login);

export const lockFeedToUser = (feedId: string, userId: string) =>
  instance.get(`Disco/Feed/LockToOne/${feedId}/${userId}`);

export const unlockFeed = (id: string) =>
  instance.get(`/Disco/Feed/RebuildOne/${id}`);

export const rebuildAllFeedd = () => instance.get("/Disco/Feed/RebuildAll");

export const transferStageProduct = (productId: string) =>
  instance.get(`Disco/Staging/Product/Transfer/${productId}`);
