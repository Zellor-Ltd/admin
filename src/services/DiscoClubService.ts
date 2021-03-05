import axios from "axios";
import snakeToCamelCase from "helpers/snakeToCamelCase";

export const instance = axios.create({
  baseURL: process.env.REACT_APP_HOST_ENDPOINT,
});

instance.interceptors.response.use((response) => {
  return snakeToCamelCase(response.data);
});

export const fetchStartupVideo = () => instance.get("GetStartupVideo");

export const fetchVideoFeed = () => instance.get("GetVideoFeed");

export const deleteVideoFeed = (id: string) => instance.delete("GetVideoFeed");
