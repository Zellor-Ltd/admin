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

export const instance = axios.create({
  baseURL: process.env.REACT_APP_HOST_ENDPOINT,
});

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

instance.interceptors.response.use((response) => {
  return snakeToCamelCase(response.data);
});

export const fetchStartupVideo = () => instance.get("GetStartupVideo");

export const fetchVideoFeed = () => instance.get("ListVideoFeed");

export const fetchProducts = () => instance.get("ListProducts");

export const fetchBrands = () => instance.get("ListBrands");

export const fetchTags = () => instance.get("ListTags");

export const fetchCreators = () => instance.get("ListCreators");

export const fetchUsers = () => instance.get("ListUsers");

export const fetchProfiles = () => instance.get("ListProfiles");

export const fetchFunctions = () => instance.get("ListFunctions");

export const fetchEndpoints = () => instance.get("ListEndpoints");

export const fetchSettings = () => instance.get("GetSettings");

export const saveVideoFeed = (params: FeedItem) => {
  if (params.id) {
    return instance.put("UpdateVideoFeed", params);
  } else {
    return instance.put("AddVideoFeed", params);
  }
};

export const saveProduct = (params: Product) => {
  if (params.id) {
    return instance.post("UpdateProduct", params);
  } else {
    return instance.put("AddProduct", params);
  }
};

export const saveCreator = (params: Creator) => {
  if (params.id) {
    return instance.post("UpdateCreator", params);
  } else {
    return instance.put("AddCreator", params);
  }
};

export const saveTag = (params: Tag) => {
  if (params.id) {
    return instance.post("UpdateTag", params);
  } else {
    return instance.put("AddTag", params);
  }
};

export const saveBrand = (params: Brand) => {
  if (params.id) {
    return instance.post("UpdateBrand", params);
  } else {
    return instance.put("AddBrand", params);
  }
};

export const saveEndpoint = (params: Function) => {
  params.type = "endpoint";
  if (params.id) {
    return instance.post("UpdateFunction", params);
  } else {
    return instance.put("AddFunction", params);
  }
};

export const saveUser = (params: User) => {
  if (params.id) {
    return instance.post(
      "https://jfkb8c943262a68401ca.discoclub.com/Disco/Identity/UpdateUser",
      params
    );
  } else {
    return instance.put(
      "https://jfkb8c943262a68401ca.discoclub.com/Disco/Identity/AddUser",
      params
    );
  }
};

export const saveRole = (params: Role) => {
  if (params.id) {
    return instance.post("UpdateProfile", params);
  } else {
    return instance.put("AddProfile", params);
  }
};

export const deleteVideoFeed = (id: string) =>
  instance.delete(`delete/videofeed/${id}`);

export const deleteTag = (id: string) => instance.delete(`RemoveTag/${id}`);

export const deleteCreator = (id: string) =>
  instance.delete(`RemoveCreator/${id}`);

export const deleteProduct = (id: string) =>
  instance.delete(`RemoveProduct/${id}`);

export const deleteBrand = (id: string) => instance.delete(`RemoveBrand`);

export const loginService = (login: Login) =>
  instance.put(
    "https://jfkb8c943262a68401ca.hoxwi.com/Auth/GetApiToken",
    login
  );
