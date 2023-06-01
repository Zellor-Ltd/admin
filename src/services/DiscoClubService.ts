import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import { Brand } from 'interfaces/Brand';
import {
  AllCategoriesAPI,
  Category,
  ProductCategory,
} from 'interfaces/Category';
import { Creator } from 'interfaces/Creator';
import { DdTemplate } from 'interfaces/DdTemplate';
import { Endpoint } from 'interfaces/Endpoint';
import { FanGroup } from 'interfaces/FanGroup';
import { FeedItem } from 'interfaces/FeedItem';
import { Function } from 'interfaces/Function';
import { Login } from 'interfaces/Login';
import { PreReg } from 'interfaces/PreReg';
import { Privilege } from 'interfaces/Privilege';
import { Product } from 'interfaces/Product';
import { ProductBrand } from 'interfaces/ProductBrand';
import { PromoCode } from 'interfaces/PromoCode';
import { PromoDisplay } from 'interfaces/PromoDisplay';
import { Role } from 'interfaces/Role';
import { Tag } from 'interfaces/Tag';
import { User } from 'interfaces/User';
import { Banner } from 'interfaces/Banner';
import { VideoType } from 'interfaces/VideoType';
import { VariantGroup } from 'interfaces/VariantGroup';
import { AnyAction } from '@reduxjs/toolkit';

export const instance = axios.create({
  baseURL: process.env.REACT_APP_HOST_ENDPOINT,
  headers: { 'Content-Type': 'application/json' },
});
interface IDelete {
  id: string;
}

type Pagination = {
  page?: number;
  limit?: number;
};

function reverseIdRecursively(obj: any) {
  for (let prop in obj) {
    if (prop === 'id') {
      obj['_id'] = obj[prop];
      delete obj[prop];
    } else if (typeof obj[prop] === 'object') reverseIdRecursively(obj[prop]);
  }
}

function replaceIdRecursively(obj: any) {
  for (let prop in obj) {
    if (prop === '_id') {
      obj['id'] = obj[prop];
      delete obj[prop];
    } else if (typeof obj[prop] === 'object') {
      replaceIdRecursively(obj[prop]);
    }
  }
  return obj;
}

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  const data = JSON.parse(JSON.stringify(config.data || {}));
  if (data) {
    reverseIdRecursively(data);
  }
  config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  config.data = data;
  return config;
});

const MAX_STACKED_ERRORS = 1;
const ERROR_MESSAGE_DURATION = 3000;
let errorCounter = 0;
let loggingOut = false;

const errorHandler = (
  error: any,
  errorMsg = 'Something went wrong.',
  responseData?: any
) => {
  if (errorCounter < MAX_STACKED_ERRORS) {
    message.error('Error: ' + errorMsg);
    errorCounter++;
    setTimeout(() => {
      errorCounter--;
    }, ERROR_MESSAGE_DURATION);
  }
  if (responseData) {
    // eslint-disable-next-line no-throw-literal
    throw { error, ...responseData };
  } else {
    throw error;
  }
};

instance.interceptors.response.use(
  response => {
    const { error, message, success, results } = response?.data;
    if (!loggingOut) {
      if (error && error.response?.data !== 'Invalid Token') {
        errorHandler(error, message || error, response.data);
      } else if (success === false && !(results && !results.length)) {
        errorHandler(new Error('Request failed'), 'Request failed.');
      }
    }
    return replaceIdRecursively(response.data);
  },
  error => {
    if (!loggingOut) {
      if (error.response?.data === 'Invalid Token') {
        loggingOut = true;
        message.error('Your session has expired, please login');
        localStorage.clear();
        window.location.replace('/login');
      } else {
        errorHandler(error);
      }
    }
  }
);

export const uploadImage = (imageFile: File) => {
  const form = new FormData();
  form.append('file', imageFile);

  return axios({
    method: 'post',
    url: `${process.env.REACT_APP_HOST_ENDPOINT}/Wi/Upload`,
    data: form,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

export const addBalanceToUser = (
  userId: string,
  brandId: string,
  discoDollars: number
) =>
  instance.get(
    `Disco/Wallet/AddBalanceToUser/${userId}/${brandId}/${discoDollars}`
  );

export const resetUserBalance = (userId: string, brandId: string) =>
  instance.get(`Disco/Wallet/ResetUserBalance/${userId}/${brandId}`);

export const getMasterPassword = (id: string) =>
  instance.get(`Auth/GetMasterPwd/${id}`);

export const deactivateBrand = (brandId: string, masterPassword: string) =>
  instance.get(`Disco/Brand/Deactivate/${brandId}/${masterPassword}`);

export const reactivateBrand = (brandId: string, masterPassword: string) =>
  instance.get(`Disco/Brand/Reactivate/${brandId}/${masterPassword}`);

export const pushGroupTag = (tagId: string, groupId: string) =>
  instance.get(`/Disco/Feed/PushGroupTag/${tagId}/${groupId}`);

export const resetUser = (id: string) =>
  instance.get(`Disco/Identity/ResetUser/${id}`);

export const loginService = (login: Login) =>
  instance.put('Disco/Identity/Adm/GetApiToken', login);

export const barcodeLookup = (barcode: string, group?: any) =>
  instance.post('Disco/Product/Adm/Scan', { barcode, group });

export const lockFeedToUser = (feedId: string, userId: string) =>
  instance.get(`Disco/Feed/LockToOne/${feedId}/${userId}`);

export const unlockFeed = (id: string) =>
  instance.get(`/Disco/Feed/RebuildOne/${id}`);

export const rebuildAllFeed = () => instance.get('/Disco/Feed/RebuildAll');

export const rebuildLink = (input: string) =>
  instance.get(`/Disco/DataMgm/RebuildOneVideoLink/${input}`);

export const rebuildVLink = (path: string) =>
  instance.post('/Disco/Link/Adm/Revalidade', {
    id: path,
  });

export const propagateVLink = (path: string) =>
  instance.get(`/Disco/DataMgm/PropagateOneVideoLink/${path}`);

export const transferStageProduct = (productId: string) =>
  instance.get(`Disco/Staging/Product/Transfer/${productId}`);

export const exportToShopifyProduct = (productId: string) =>
  instance.get(`/Disco/Product/ExportToShopify/${productId}`);

export const lockFeedMixer = (userId: string) =>
  instance.get(`Disco/Feed/LockUnlockUser/${userId}/y`);

export const unlockFeedMixer = (userId: string) =>
  instance.get(`Disco/Feed/LockUnlockUser/${userId}/n`);

export const setPreserveDdTags = (userId: string) =>
  instance.get(`Disco/Wallet/PreserveDdTagsToUser/${userId}/y`);

export const unsetPreserveDdTags = (userId: string) =>
  instance.get(`Disco/Wallet/PreserveDdTagsToUser/${userId}/n`);

export const preCheckout: (productId: string, DdQuantity?: number) => any = (
  productId,
  DdQuantity = 0
) => instance.get(`Disco/Product/PreCheckout/${productId}/${DdQuantity}`);

export const updateMultipleUsersFeed = (params: any) =>
  instance.put(`Disco/Feed/UpdateAllFansUsersFeed`, {
    query: {},
    feeds: params,
  });

export const updateUsersFeedByGroup = (groupName: string, params: any) =>
  instance.put(`Disco/Feed/UpdateUsersFeedByGroup/${groupName}`, {
    feeds: params,
  });

export const fetchStartupVideo = () => instance.get('Wi/Ep/GetStartupVideo');

export const fetchDirectLinks = ({
  link,
  creatorId,
  brandId,
  productBrandId,
  video,
  url,
  linkType,
}: {
  link?: string;
  creatorId?: string;
  brandId?: string;
  productBrandId?: string;
  video?: string;
  url?: string;
  linkType?: 'Product' | 'Other';
}) =>
  instance.put(`Disco/DirectLink/Adm/List`, {
    link,
    creatorId,
    brandId,
    productBrandId,
    video,
    url,
    linkType,
  });

export const fetchVideoFeed = () => instance.get('Wi/Ep/ListVideoFeed');
export const fetchVideoFeedV2 = ({
  query,
  brandId,
  status,
  videoType,
  productBrandId,
  startIndex,
  categoryId,
  dateSort,
}: {
  query?: string;
  brandId?: string;
  status?: string;
  videoType?: string;
  productBrandId?: string;
  startIndex?: number;
  categoryId?: string;
  dateSort?: string;
}) =>
  instance.put(`Disco/Feed/Adm/List/`, {
    query,
    brandId,
    status,
    videoType,
    productBrandId,
    startIndex,
    categoryId,
    dateSort,
  });

export const fetchVideoFeedV3 = ({
  query,
  brandId,
  status,
  videoType,
  productBrandId,
  startIndex,
  categoryId,
  dateSort,
  page = 0,
  creatorId,
  videoFeedId,
  category,
}: {
  query?: string;
  brandId?: string;
  status?: string;
  videoType?: string;
  productBrandId?: string;
  startIndex?: number;
  categoryId?: string;
  dateSort?: string;
  creatorId?: string;
  videoFeedId?: string;
  category?: string;
} & Pagination) =>
  instance.put(`Disco/Feed/Adm/List/${page}`, {
    query,
    brandId,
    status,
    videoType,
    productBrandId,
    startIndex,
    categoryId,
    dateSort,
    creatorId,
    videoFeedId,
    category,
  });

export const fetchVideoFeed2 = () => instance.get('Wi/Ep/GetVideoFeed');

export const fetchFeaturedFeeds = (name: string) =>
  instance.get(`Disco/Feed/Adm/Featured/List/${name}`);

export const fetchVariants = (variantId: string) =>
  instance.get(`Disco/Product/GetVariants/${variantId}`);

export const fetchVariantGroups = () =>
  instance.get('Disco/Product/VariantGroup/List');

export const fetchProducts = ({
  brandId,
  query,
  unclassified,
  page = 0,
  limit = 30,
  productBrandId,
  date,
  outOfStock,
  status,
  superCategoryId,
  categoryId,
  subCategoryId,
  subSubCategoryId,
  runId,
}: {
  brandId?: string;
  query?: string;
  unclassified?: boolean;
  productBrandId?: string;
  date?: Date;
  outOfStock?: boolean;
  status?: string;
  superCategoryId?: string;
  categoryId?: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  runId?: string;
} & Pagination) =>
  instance.put(`Disco/Product/Adm/List/${page}/${limit}`, {
    brandId,
    query,
    unclassified,
    productBrandId,
    date,
    outOfStock,
    status,
    superCategoryId,
    categoryId,
    subCategoryId,
    subSubCategoryId,
    runId,
  });

export const fetchAllStagingProducts = () =>
  instance.put('Disco/Staging/Product/List/0/0');

export const fetchProductBrands = () =>
  instance.get(`Disco/ProductBrand/Adm/List`);

export const fetchTags = ({
  query,
  brandId,
  page = 0,
  limit = 0,
}: {
  query?: string;
  brandId?: string;
} & Pagination) =>
  instance.put(`Disco/Product/Adm/ListTags/${page}/${limit}`, {
    query,
    brandId,
  });

export const fetchStagingProducts = ({
  brandId,
  query,
  unclassified,
  page = 0,
  limit = 0,
  productBrandId,
  date,
  outOfStock,
  status,
  superCategoryId,
  categoryId,
  subCategoryId,
  subSubCategoryId,
  runId,
}: {
  brandId?: string;
  query?: string;
  unclassified?: boolean;
  productBrandId?: string;
  date?: Date;
  outOfStock?: boolean;
  status?: string;
  superCategoryId?: string;
  categoryId?: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  runId?: string;
} & Pagination) =>
  instance.put(`Disco/Staging/Product/List/${page}/${limit}`, {
    brandId,
    query,
    unclassified,
    productBrandId,
    date,
    outOfStock,
    status,
    superCategoryId,
    categoryId,
    subCategoryId,
    subSubCategoryId,
    runId,
  });

export const fetchProductTemplates = () =>
  instance.get('Wi/Ep/ListProductTemplate');

export const fetchBrands = () => instance.get('Wi/Ep/ListBrands');

export const fetchCategories = () => instance.get('Wi/Ep/GetProductCategories');

export const productCategoriesAPI: AllCategoriesAPI = {
  superCategory: {
    fetch: () => instance.get('Wi/Ep/ListProductSuperCategories'),
    save: (params: ProductCategory) => {
      if (params.id) {
        return instance.post('Wi/Ep/UpdateProductSuperCategories', params);
      } else {
        return instance.put('Wi/Ep/AddProductSuperCategories', params);
      }
    },
    delete: (data: IDelete) =>
      instance.delete('Wi/Ep/RemoveProductSuperCategories', { data }),
  },
  category: {
    fetch: () => instance.get('Wi/Ep/ListProductCategories'),
    save: (params: ProductCategory) => {
      if (params.id) {
        return instance.post('Wi/Ep/UpdateProductCategories', params);
      } else {
        return instance.put('Wi/Ep/AddProductCategories', params);
      }
    },
    delete: (data: IDelete) =>
      instance.delete('Wi/Ep/RemoveProductCategories', { data }),
  },
  subCategory: {
    fetch: () => instance.get('Wi/Ep/ListProductSubCategories'),
    save: (params: ProductCategory) => {
      if (params.id) {
        return instance.post('Wi/Ep/UpdateProductSubCategories', params);
      } else {
        return instance.put('Wi/Ep/AddProductSubCategories', params);
      }
    },
    delete: (data: IDelete) =>
      instance.delete('Wi/Ep/RemoveProductSubCategories', { data }),
  },
  subSubCategory: {
    fetch: () => instance.get('Wi/Ep/ListProductSubSubCategories'),
    save: (params: ProductCategory) => {
      if (params.id) {
        return instance.post('Wi/Ep/UpdateProductSubSubCategories', params);
      } else {
        return instance.put('Wi/Ep/AddProductSubSubCategories', params);
      }
    },
    delete: (data: IDelete) =>
      instance.delete('Wi/Ep/RemoveProductSubSubCategories', { data }),
  },
};

export const fetchCreators = ({
  page = 0,
  query,
}: {
  page?: number;
  query?: string;
}) =>
  instance.post(`Disco/Creator/Adm/List/${page}/`, {
    query,
  });

export const fetchCreatorById = ({ creatorId }: { creatorId: String }) =>
  instance.get(`Disco/Creator/V2/Page/${creatorId}`);

export const fetchUsers = () => instance.get('Wi/Ep/ListUsers');

export const fetchFans = ({
  page = 0,
  query,
}: {
  page: number;
  query?: string;
}) =>
  instance.post(`Disco/Identity/Adm/Fans/List/${page}/`, {
    query,
  });

export const fetchGuests = ({
  page = 0,
  query,
}: {
  page: number;
  query?: string;
}) =>
  instance.post(`Disco/Identity/Adm/Guests/List/${page}/`, {
    query,
  });

export const fetchProfiles = () => instance.get('Wi/Ep/ListProfiles');

export const fetchFunctions = () => instance.get('Wi/Ep/ListFunctions');

export const fetchEndpoints = () => instance.get('Wi/Ep/ListEndpoints');

export const fetchInterfaces = () => instance.get('Wi/Ep/ListInterfaces');

export const fetchSettings = () => instance.get('Wi/Ep/GetSettings');

export const fetchPrivileges = (profile: string) =>
  instance.put('Wi/Ep/ListPrivileges', { profile });

export const fetchOrders = ({
  page = 0,
  brandId,
  userId,
}: {
  page: number;
  brandId?: string;
  userId?: string;
}) =>
  instance.post(`Disco/Orders/Adm/List/${page}`, {
    brandId,
    userId,
  });

export const fetchWalletTransactions = (userId: string) =>
  instance.put('Wi/Ep/GetWalletTransactions', { userId });

export const fetchUserFeed = (userId: string) =>
  instance.get(`Disco/Feed/GetUserFeed/${userId}`);

export const fetchGroupFeed = (groupId: string) =>
  instance.get(`Disco/Feed/GetGroup/${groupId}`);

export const fetchPromoCodes = () => instance.get('Wi/Ep/ListPromoCodes');

export const fetchVideoTypes = () => instance.get('Wi/Ep/ListVideoTypes');

export const fetchPromotions = () => instance.get('Wi/Ep/ListPromotions');

export const fetchPromoStatus = () => instance.get('Wi/Ep/ListPromoStatus');

export const fetchDdTemplates = () => instance.get('Wi/Ep/ListDdTemplate');

export const fetchPromoDisplays = () => instance.get('Wi/Ep/ListPromoDisplay');

export const fetchInterests = () => instance.get('Wi/Ep/ListInterest');

export const fetchFanGroups = () => instance.get('Wi/Ep/ListFanGroup');

export const fetchBalancePerBrand = (userId: string) =>
  instance.get(`Disco/Wallet/GetBalancePerBrand/${userId}`);

export const fetchTransactionsPerBrand = (userId: string, brandId: string) =>
  instance.get(`Disco/Wallet/GetTransactionsPerBrand/${userId}/${brandId}`);

export const fetchServersList = () => instance.get('Wi/Ep/GetServersList');

export const fetchCurrencies = () => instance.get('Wi/Ep/GetCurrencies');

export const fetchLinks = (id: string) =>
  instance.get(`Disco/Link/Adm/List/${id}`);

export const fetchFanFeed = (userId: string) =>
  instance.get(`Disco/Feed/GetOne/${userId}`);

export const fetchLinkStats = () =>
  instance.get(`Disco/Analytics/GetLinkStats`);

export const fetchLinkEngagement = () =>
  instance.get(`Disco/Analytics/GetLinkEngagement`);

export const fetchProductEngagement = () =>
  instance.get(`Disco/Analytics/GetProductEngagement`);

export const fetchActiveRegFansPerDay = () =>
  instance.get(`Disco/Analytics/ActiveRegFansPerDay`);

export const fetchProductsPerDay = () =>
  instance.get(`/Disco/Analytics/ProductsAddedPerDay`);

export const fetchPreRegs = () => instance.get('Wi/Ep/GetPreRegs');

export const fetchFanActivity = () =>
  instance.get(`Disco/Analytics/GetFanActivitives`);

export const fetchBanners = () => instance.get('Wi/Ep/GetFeedBanner');

export const fetchMastheads = () => instance.get('Wi/Ep/ListCreatorMastHead');

export const fetchTrends = () => instance.get('Disco/Trend/Adm/List');

export const fetchFeedTemplates = () =>
  instance.get('Disco/Feed/Adm/ListTemplates');

export const fetchCommissions = ({
  creatorId,
  status,
}: {
  creatorId?: string;
  status?: string;
}) =>
  instance.post(`Disco/Creator/Adm/Commission/List`, {
    creatorId,
    status,
  });

export const fetchCommissionDetails = (id: string) =>
  instance.get(`Disco/Creator/Adm/Commission/List/${id}`);

export const fetchCommissionedItem = ({
  creatorId,
  commissionId,
  quantity,
}: {
  creatorId: string;
  commissionId: string;
  quantity: number;
}) =>
  instance.put(`Disco/Creator/Adm/Commission/List`, {
    creatorId,
    commissionId,
    quantity,
  });

export const fetchPayments = ({
  creatorId,
  status,
  dateFrom,
  dateTo,
  page = 0,
}: {
  creatorId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}) =>
  instance.post(`Disco/Creator/Adm/Payment/List/${page}`, {
    creatorId,
    status,
    dateFrom,
    dateTo,
    page,
  });

export const fetchBrandVault = (id: string) =>
  instance.get(`Disco/Brand/Vault/List/${id}`);

export const updateManyFans = (groupName: string, fansIds: string[]) => {
  return instance.post(`/Disco/Fan/SetUsersGroup/${groupName}`, fansIds);
};

export const saveFixedVideo = (params: any) => {
  return instance.put('Disco/Feed/FixedVideo/Adm/Add', params);
};

export const saveVideoType = (params: VideoType) => {
  return instance.put('Disco/Feed/Adm/Add', params);
};

export const saveProductBrand = (params: ProductBrand) => {
  if (params.id) {
    return instance.put('Disco/ProductBrand/Adm/Update', params);
  } else {
    return instance.put('Disco/ProductBrand/Adm/Add', params);
  }
};

export const addVariant = (productId: string, variantId: string) =>
  instance.get(`Disco/Product/AddToVariantGroup/${productId}/${variantId}`);

export const saveLink = (params: any) =>
  instance.put('Disco/Link/Adm/GenerateExternalLink', params);

export const saveDirectLink = (params: any, newItem?: boolean) => {
  if (newItem)
    return instance.put('Disco/DirectLink/Adm/AddDirectlLink', params);
  else return instance.put('Disco/DirectLink/Adm/UpdateDirectlLink', params);
};

export const saveVideoFeed = (params: FeedItem, isCloning?: boolean) => {
  if (!params.id)
    return instance.put('Disco/Feed/Adm/Add', { feed: params, isCloning });
  else return instance.put('Disco/Feed/Update', params);
};

export const addFeaturedFeed = (feedId: string, listName: string) =>
  instance.put('Disco/Feed/Adm/Featured/Add', { feedId, listName });

export const updateFeaturedFeed = (params: any[]) =>
  instance.put('Disco/Feed/Adm/Featured/Update', params);

export const saveVariantGroup = (params: VariantGroup) => {
  if (params.id) {
    return instance.put('Disco/Product/VariantGroup/Update', params);
  } else {
    return instance.put('Disco/Product/VariantGroup/Add', params);
  }
};

export const saveStagingProduct = (params: Product) => {
  if (params.id) {
    return instance.put('Disco/Product/Adm/Update', params);
  } else {
    return instance.put('Disco/Product/Adm/Add', params);
  }
};

export const saveProductTemplate = (params: any) => {
  if (params.id) {
    return instance.put('Wi/Ep/UpdateProductTemplate', params);
  } else {
    return instance.put('Wi/Ep/AddProductTemplate', params);
  }
};

export const saveCreator = (params: Creator) => {
  if (params.id) {
    return instance.post('Disco/Creator/Update', params);
  } else {
    return instance.put('Disco/Creator/Add', params);
  }
};

export const saveTag = (params: Tag) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateTag', params);
  } else {
    return instance.put('Wi/Ep/AddTag', params);
  }
};

export const saveBrand = (params: Brand) => {
  if (params.id) {
    return instance.post('Disco/Brand/Update', params);
  } else {
    return instance.put('Wi/Ep/AddBrand', params);
  }
};

export const saveCategory = (params: Category) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateCategory', params);
  } else {
    return instance.put('Wi/Ep/AddCategory', params);
  }
};

export const saveEndpoint = (params: Endpoint) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateEndpoint', params);
  } else {
    return instance.put('Wi/Ep/AddEndpoint', params);
  }
};

export const saveInterface = (params: Function) => {
  params.type = 'interface';
  if (params.id) {
    return instance.post('Wi/Ep/UpdateFunction', params);
  } else {
    return instance.put('Wi/Ep/AddFunction', params);
  }
};

export const saveUser = (params: User) => {
  if (params.id) {
    return instance.post('Disco/Identity/Adm/UpdateUser', params);
  } else {
    return instance.put('Disco/Identity/Adm/AddUser', params);
  }
};

export const saveRole = (params: Role) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateProfile', params);
  } else {
    return instance.put('Wi/Ep/AddProfile', params);
  }
};

export const saveSettings = (params: any) => {
  return instance.post('Wi/Ep/UpdateSettings', params);
};

export const savePrivileges = (params: Privilege) => {
  return instance.post('Wi/Ep/AddPrivilege', params);
};

export const saveOrder = (params: any) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateOrder', params);
  } else {
    return instance.put('Wi/Ep/AddOrder', params);
  }
};

export const saveUserFeed = (userId: string, payload: any) =>
  instance.put(`Disco/Feed/UpdateUserFeed/${userId}`, payload);

export const savePromoCode = (params: PromoCode) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdatePromoCode', params);
  } else {
    return instance.put('Wi/Ep/AddPromoCode', params);
  }
};

export const savePromotion = (params: PromoCode) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdatePromotion', params);
  } else {
    return instance.put('Wi/EP/AddPromotion', params);
  }
};

export const saveDdTemplate = (params: DdTemplate) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateDdTemplate', params);
  } else {
    return instance.put('Wi/EP/AddDdTemplate', params);
  }
};

export const savePromoDisplay = (params: PromoDisplay) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdatePromoDisplay', params);
  } else {
    return instance.put('Wi/EP/AddPromoDisplay', params);
  }
};

export const saveFanGroup = (params: FanGroup) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateFanGroup', params);
  } else {
    return instance.put('Wi/EP/AddFanGroup', params);
  }
};

export const saveInterests = (params: any) => {
  return instance.put('Disco/Fan/UpdateInterests', params);
};

export const saveFeedTemplate = (params: any) => {
  return instance.put('Disco/Feed/Adm/UpdateTemplate', params);
};

export const saveTrend = (params: any) => {
  return instance.put('Disco/Trend/Adm/Update', params);
};

export const saveMasthead = (params: Banner) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateCreatorMastHead', params);
  } else {
    return instance.put('Wi/Ep/AddCreatorMastHead', params);
  }
};

export const saveBanner = (params: Banner) => {
  if (params.id) {
    return instance.post('Wi/Ep/UpdateFeedBanner', params);
  } else {
    return instance.put('Wi/EP/AddFeedBanner', params);
  }
};

export const saveBrandVault = (params: any) => {
  if (params.id) {
    return instance.post('Disco/Brand/Vault/Update', params);
  } else {
    return instance.put('Disco/Brand/Vault/Add', params);
  }
};

export const savePayment = ({
  creatorId,
  description,
  amount,
}: {
  creatorId: string;
  description: string;
  amount: number;
}) => {
  return instance.put('Disco/Creator/Adm/OneOffPayment', {
    creatorId,
    description,
    amount,
  });
};

export const saveCommission = ({
  creatorId,
  totalDue,
  items,
}: {
  creatorId: string;
  totalDue: number;
  items: string[];
}) => {
  return instance.put('Disco/Creator/Adm/Commission/Pay', {
    creatorId,
    totalDue,
    items,
  });
};

export const updateCommission = (params: any) => {
  return instance.put('Disco/Creator/Adm/Commission/Update', params);
};

export const saveManualCommission = ({
  date,
  feedId,
  creatorId,
  productId,
  quantity,
}: {
  date: string;
  feedId: string;
  creatorId: string;
  productId: string;
  quantity: number;
}) => {
  return instance.put('Disco/Creator/Adm/Commission/Add', {
    date,
    feedId,
    creatorId,
    productId,
    quantity,
  });
};

export const deleteBrandVault = (id: string) => {
  if (id) {
    return instance.get(`Disco/Brand/Vault/Delete/${id}`);
  }
};

export const deletePrivileges = (data: Privilege) => {
  return instance.delete('Disco/Identity/Adm/RemovePrivillege', { data });
};

export const deleteDirectLink = (id: string) => {
  return instance.delete(`Disco/DirectLink/Adm/RemoveDirectlLink/${id}`);
};

export const deleteVideoFeed = (id: string) => {
  return instance.delete(`Disco/Feed/Delete/${id}`);
};

export const deleteFeaturedFeed = (id: string) => {
  return instance.delete(`Disco/Feed/Adm/Featured/Remove/${id}`);
};

export const deleteTag = (data: IDelete) => {
  return instance.delete('Wi/Ep/RemoveTag', { data });
};

export const deleteCreator = (id: string) => {
  return instance.delete(`Disco/Creator/Delete/${id}`);
};

export const deleteProductBrand = (id: string) => {
  return instance.delete(`Disco/ProductBrand/Adm/Delete/${id}`);
};

export const deleteVariantGroup = (id: string) => {
  if (id) {
    return instance.get(`Disco/Product/VariantGroup/Delete/${id}`);
  }
};

export const deleteVariant = (productId: string, variantId: string) => {
  return instance.get(
    `Disco/Product/RemoveFromVariantGroup/${productId}/${variantId}`
  );
};

export const deleteStagingProduct = (id: string) => {
  return instance.delete(`Disco/Staging/Product/Remove/${id}`);
};

export const deleteProductTemplate = (data: AnyAction) => {
  return instance.delete('Wi/Ep/RemoveProductTemplate', { data });
};

export const deleteBrand = (data: IDelete) => {
  return instance.delete('Wi/Ep/RemoveBrand', { data });
};

export const deleteCategory = (data: IDelete) => {
  return instance.delete('Wi/Ep/RemoveCategory', { data });
};

export const deletePromoCode = (data: IDelete) => {
  return instance.delete('Wi/Ep/RemovePromoCode', { data });
};

export const deletePromotion = (data: IDelete) => {
  return instance.delete('Wi/Ep/RemovePromotion', { data });
};

export const deleteDdTemplate = (data: IDelete) => {
  return instance.delete('Wi/Ep/RemoveDdTemplate', { data });
};

export const deletePromoDisplay = (data: IDelete) => {
  return instance.delete('Wi/Ep/RemovePromoDisplay', { data });
};

export const deleteFanGroup = (data: IDelete) => {
  return instance.delete('Wi/Ep/RemoveFanGroup', { data });
};

export const deleteGuest = (id: string) => {
  return instance.delete(`Disco/Identity/Adm/DeleteGuest/${id}`);
};

export const deleteBanner = (params: Banner) => {
  return instance.put('Wi/Ep/RemoveFeedBanner', params);
};

export const deletePreReg = (params: PreReg) => {
  return instance.put('Wi/Ep/SetPreRegs', params);
};

export const deleteMasthead = (params: Banner) => {
  return instance.put('Wi/Ep/RemoveCreatorMastHead', params);
};

export const deleteLink = (id: string) => {
  return instance.delete(`Disco/Link/Adm/Remove/${id}`);
};

export const fetchLinkBrand = (params: any) => {
  return instance.post('Disco/LinkBrand/adm/search', params);
};

export const updateLinkBrand = (params: any) => {
  return instance.post('Disco/LinkBrand/adm/update', params);
};

export const fetchLinkProductBrand = (params: any) => {
  return instance.post('Disco/LinkProductBrand/adm/search', params);
};

export const updateLinkProductBrand = (params: any) => {
  return instance.post('Disco/LinkProductBrand/adm/update', params);
};

export const fetchLinkProduct = (params: any) => {
  return instance.post('Disco/LinkProduct/adm/search', params);
};

export const updateLinkProduct = (params: any) => {
  return instance.post('Disco/LinkProduct/adm/update', params);
};

export const fetchLinkCreator = (params: any) => {
  return instance.post('Disco/LinkCreator/adm/search', params);
};

export const updateLinkCreator = (params: any) => {
  return instance.post('Disco/LinkCreator/adm/update', params);
};

export const fetchCustomLinkLists = (params: any) => {
  return instance.post('Disco/LinkCustom/Adm/Search/', params);
};

export const fetchCustomLinks = (params: string) => {
  return instance.get(`Disco/LinkCustom/Adm/SearchLinks/${params}`);
};

export const saveCustomLinkList = (params: any) => {
  if (params.id) {
    return instance.post('Disco/LinkCustom/Adm/Update', params);
  } else {
    return instance.post('Disco/LinkCustom/Adm/Add', params);
  }
};
