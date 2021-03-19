import axios, { AxiosRequestConfig } from "axios";
import snakeToCamelCase from "helpers/snakeToCamelCase";
import { Brand } from "interfaces/Brand";
import { Creator } from "interfaces/Creator";
import { FeedItem } from "interfaces/FeedItem";
import { Product } from "interfaces/Product";
import { Tag } from "interfaces/Tag";

export const instance = axios.create({
  baseURL: process.env.REACT_APP_HOST_ENDPOINT,
});

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  if (config.data) {
    config.data = {
      ...config.data,
      ["_id"]: config.data.id,
    };
    delete config.data.id;
  }
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

export const deleteVideoFeed = (id: string) =>
  instance.delete(`delete/videofeed/${id}`);

export const deleteTag = (id: string) => instance.delete(`RemoveTag/${id}`);

export const deleteCreator = (id: string) =>
  instance.delete(`RemoveCreator/${id}`);
