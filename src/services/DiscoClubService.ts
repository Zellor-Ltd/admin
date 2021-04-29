import axios, { AxiosRequestConfig } from "axios";
import snakeToCamelCase from "helpers/snakeToCamelCase";
import { Brand } from "interfaces/Brand";
import { Creator } from "interfaces/Creator";
import { Function } from "interfaces/Function";
import { FeedItem } from "interfaces/FeedItem";
import { Login } from "interfaces/Login";
import { Product } from "interfaces/Product";
import { Role } from "interfaces/Role";
import { Tag } from "interfaces/Tag";
import { User } from "interfaces/User";
import { Privilege } from "interfaces/Privilege";
import { Category } from "interfaces/Category";

export const instance = axios.create({
  baseURL: process.env.REACT_APP_HOST_ENDPOINT,
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
    switch (error.response.status) {
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

export const fetchBrands = () => instance.get("Wi/Ep/ListBrands");

export const fetchCategories = () => instance.get("Wi/Ep/GetProductCategories");

export const fetchTags = () => instance.get("Wi/Ep/ListTags");

export const fetchCreators = () => instance.get("Wi/Ep/ListCreators");

export const fetchUsers = () => instance.get("Wi/Ep/ListUsers");

export const fetchProfiles = () => instance.get("Wi/Ep/ListProfiles");

export const fetchFunctions = () => instance.get("Wi/Ep/ListFunctions");

export const fetchEndpoints = () => instance.get("Wi/Ep/ListEndpoints");

export const fetchInterfaces = () => instance.get("Wi/Ep/ListInterfaces");

export const fetchSettings = () => instance.get("Wi/Ep/GetSettings");

export const fetchPrivileges = () => instance.get("Wi/Ep/ListPrivileges");

export const saveVideoFeed = (params: FeedItem) => {
  if (params.id) {
    return instance.put("Disco/Feed/Add", params);
  } else {
    return instance.put("Disco/Feed/Update", params);
  }
};

export const saveProduct = (params: Product) => {
  if (params.id) {
    return instance.post("/Disco/Product/Update", params);
  } else {
    return instance.put("/Disco/Product/Add", params);
  }
};

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
    return instance.post("Wi/Ep/UpdateBrand", params);
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

export const saveEndpoint = (params: Function) => {
  params.type = "endpoint";
  if (params.id) {
    return instance.post("Wi/Ep/UpdateFunction", params);
  } else {
    return instance.put("Wi/EP/AddFunction", params);
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
  if (params.id) return instance.post("Wi/Ep/UpdatePrivileges", params);
  else return instance.post("Wi/Ep/AddPrivilege", params);
};

export const deleteVideoFeed = (data: IDelete) =>
  instance.delete(`Disco/Feed/Delete/${data}`);

export const deleteTag = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemoveTag`, { data });

export const deleteCreator = (id: string) =>
  instance.delete(`Disco/Creator/Delete/${id}`);

export const deleteProduct = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemoveProduct`, { data });

export const deleteBrand = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemoveBrand`, { data });

export const deleteCategory = (data: IDelete) =>
  instance.delete(`Wi/Ep/RemoveCategory`, { data });

export const loginService = (login: Login) =>
  instance.put("Auth/GetApiToken", login);

export const lockFeedToUser = (feedId: string, userId: string) =>
  instance.get(`Disco/Feed/LockToOne/${feedId}/${userId}`);

export const unlockFeed = (id: string) =>
  instance.get(`/Disco/Feed/RebuildOne/${id}`);
