import axios from "axios";
import snakeToCamelCase from "helpers/snakeToCamelCase";
import { FeedItem } from "interfaces/FeedItem";
import { Product } from "interfaces/Product";

export const instance = axios.create({
  baseURL: process.env.REACT_APP_HOST_ENDPOINT,
});

instance.interceptors.response.use((response) => {
  return snakeToCamelCase(response.data);
});

export const fetchStartupVideo = () => instance.get("GetStartupVideo");

export const fetchVideoFeed = () => instance.get("GetVideoFeed");

export const deleteVideoFeed = (id: string) => instance.delete("GetVideoFeed");

export const fetchProducts = () => instance.get("GetProducts");

export const fetchBrands = () => instance.get("SearchBrands");

export const saveVideoFeed = (params: FeedItem) => {
  if (params.id) {
    return instance.post("UpdateVideoFeed", params);
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

export const fetchCreators = () => instance.get("GetCreators");
