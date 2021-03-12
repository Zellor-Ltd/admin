import axios, { AxiosRequestConfig } from "axios";
import snakeToCamelCase from "helpers/snakeToCamelCase";
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
  }
  return config;
});
instance.interceptors.response.use((response) => {
  return snakeToCamelCase(response.data);
});

export const fetchStartupVideo = () => instance.get("GetStartupVideo");

export const fetchVideoFeed = () => instance.get("GetVideoFeed");

export const fetchProducts = () => instance.get("GetProducts");

export const fetchBrands = () => instance.get("SearchBrands");

export const fetchTags = () => instance.get("ListTags");

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

export const saveTag = (params: Tag) => {
  if (params.id) {
    return instance.post("UpdateTag", params);
  } else {
    return instance.put("AddTag", params);
  }
};

export const deleteVideoFeed = (id: string) => instance.delete("GetVideoFeed");
