export const apiUser = {
  getUser: "/admin/users",
  getUserById: (id: string) => `/admin/users/${id}`,
  deactivateUsers: (id: string) => `/admin/users/${id}/deactivate`,
  activeUser: (id: string) => `/admin/users/${id}/activate`,
};

export const categoryApi = {
  getAll: "/category",
  getAllsubcategory: (id: string) => "/subcategory" + `?categoryId=${id}`,
  createCategory: "/category",
  createSubCategory: "/subcategory",
  createTag: "/tags",
};

export const meditationApis = {
  create: "/meditation",
  getMediation: (id: string) => `/meditation/${id}`,
  updateMeditaion: (id: string) => `/meditation/${id}`,
  deleteMeditation: (id: string) => `/meditation/${id}`,
};

export const thoughtsApi = {
  create: "/thought",
  getAll: "/thought",
};

export const policyApi = {
  create: (type: string) => `/privacy-policy/${type}`,
  get: (type: string) => `/privacy-policy/${type}`,
};

export const onboardingApis = {
  create: "/onboard/",
  getAll: "/onboard",
  update: (id: string) => `/onboard/${id}`,
  delete: (id: string) => `/onboard/${id}`,
};

export const sarLogsApi = { getAll: "/sar-log" };
