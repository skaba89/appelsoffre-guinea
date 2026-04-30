/** TenderFlow Guinea — API Client */
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return axios(error.config);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/auth/login";
        }
      } else {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Type-safe API functions ──────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  tenant_name: string;
  tenant_slug: string;
}

export interface TenderFilters {
  search?: string;
  sector?: string;
  region?: string;
  status?: string;
  tender_type?: string;
  strategy?: string;
  min_score?: number;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
}

export const authApi = {
  login: (data: LoginPayload) => api.post("/auth/login", data),
  register: (data: RegisterPayload) => api.post("/auth/register", data),
  refresh: (refresh_token: string) => api.post("/auth/refresh", { refresh_token }),
  getMe: () => api.get("/auth/me"),
  invite: (data: { email: string; full_name: string; role: string }) => api.post("/auth/invite", data),
};

export const tendersApi = {
  list: (filters?: TenderFilters) => api.get("/tenders", { params: filters }),
  get: (id: string) => api.get(`/tenders/${id}`),
  create: (data: any) => api.post("/tenders", data),
  update: (id: string, data: any) => api.put(`/tenders/${id}`, data),
  delete: (id: string) => api.delete(`/tenders/${id}`),
  score: (id: string) => api.post(`/tenders/${id}/score`),
  match: (id: string) => api.post(`/tenders/${id}/match`),
  dashboardStats: () => api.get("/tenders/dashboard/stats"),
};

export const sourcesApi = {
  list: (params?: any) => api.get("/sources", { params }),
  get: (id: string) => api.get(`/sources/${id}`),
  create: (data: any) => api.post("/sources", data),
  update: (id: string, data: any) => api.put(`/sources/${id}`, data),
  delete: (id: string) => api.delete(`/sources/${id}`),
  trigger: (id: string) => api.post(`/sources/${id}/trigger`),
  runs: (id: string) => api.get(`/sources/${id}/runs`),
};

export const documentsApi = {
  list: (tenderId: string) => api.get(`/documents/tenders/${tenderId}`),
  upload: (tenderId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/documents/tenders/${tenderId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
  ingest: (id: string) => api.post(`/documents/${id}/ingest`),
  ask: (tenderId: string, question: string) => api.post(`/documents/tenders/${tenderId}/ask`, null, { params: { question } }),
};

export const crmApi = {
  // Accounts
  listAccounts: (params?: any) => api.get("/crm/accounts", { params }),
  getAccount: (id: string) => api.get(`/crm/accounts/${id}`),
  createAccount: (data: any) => api.post("/crm/accounts", data),
  updateAccount: (id: string, data: any) => api.put(`/crm/accounts/${id}`, data),
  deleteAccount: (id: string) => api.delete(`/crm/accounts/${id}`),

  // Contacts
  listContacts: (params?: any) => api.get("/crm/contacts", { params }),
  getContact: (id: string) => api.get(`/crm/contacts/${id}`),
  createContact: (data: any) => api.post("/crm/contacts", data),
  updateContact: (id: string, data: any) => api.put(`/crm/contacts/${id}`, data),
  deleteContact: (id: string) => api.delete(`/crm/contacts/${id}`),
  validateContact: (id: string, status: string) => api.post(`/crm/contacts/${id}/validate`, null, { params: { validation_status: status } }),

  // Opportunities
  listOpportunities: (params?: any) => api.get("/crm/opportunities", { params }),
  getOpportunity: (id: string) => api.get(`/crm/opportunities/${id}`),
  createOpportunity: (data: any) => api.post("/crm/opportunities", data),
  updateOpportunity: (id: string, data: any) => api.put(`/crm/opportunities/${id}`, data),
  updateStage: (id: string, stage: string) => api.put(`/crm/opportunities/${id}/stage`, null, { params: { stage } }),

  // Interactions
  createInteraction: (data: any) => api.post("/crm/interactions", data),
  listInteractions: (params?: any) => api.get("/crm/interactions", { params }),

  // Tasks
  createTask: (data: any) => api.post("/crm/tasks", data),
  listTasks: (params?: any) => api.get("/crm/tasks", { params }),
  updateTask: (id: string, data: any) => api.put(`/crm/tasks/${id}`, data),

  // Notes
  createNote: (data: any) => api.post("/crm/notes", data),
  listNotes: (params?: any) => api.get("/crm/notes", { params }),

  // Pipeline
  pipelineStats: () => api.get("/crm/pipeline/stats"),
};

export const promptsApi = {
  list: (params?: any) => api.get("/prompts", { params }),
  get: (id: string) => api.get(`/prompts/${id}`),
  create: (data: any) => api.post("/prompts", data),
  update: (id: string, data: any) => api.put(`/prompts/${id}`, data),
  generate: (tenderId: string, promptType?: string) => api.post(`/prompts/generate/${tenderId}`, null, { params: { prompt_type: promptType } }),
  listTypes: () => api.get("/prompts/types/list"),
};

export const companyApi = {
  getProfile: () => api.get("/company/profile"),
  createProfile: (data: any) => api.post("/company/profile", data),
  updateProfile: (data: any) => api.put("/company/profile", data),
  listReferences: () => api.get("/company/references"),
  createReference: (data: any) => api.post("/company/references", data),
  deleteReference: (id: string) => api.delete(`/company/references/${id}`),
};

export const alertsApi = {
  list: (params?: any) => api.get("/alerts", { params }),
  markRead: (id: string) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put("/alerts/mark-all-read"),
  unreadCount: () => api.get("/alerts/unread-count"),
  listConfigs: () => api.get("/alerts/configs"),
  createConfig: (data: any) => api.post("/alerts/configs", data),
  deleteConfig: (id: string) => api.delete(`/alerts/configs/${id}`),
};

export const adminApi = {
  stats: () => api.get("/admin/stats"),
  listUsers: (params?: any) => api.get("/admin/users", { params }),
  listTaxonomy: () => api.get("/admin/taxonomy"),
  createCategory: (data: any) => api.post("/admin/taxonomy", null, { params: data }),
  auditLogs: (params?: any) => api.get("/admin/audit-logs", { params }),
  scoringConfig: () => api.get("/admin/scoring/config"),
};

export const billingApi = {
  getSubscription: () => api.get("/billing/subscription"),
  getQuotas: () => api.get("/billing/quotas"),
  listPlans: () => api.get("/billing/plans"),
  checkout: (data: any) => api.post("/billing/checkout", data),
  listEvents: () => api.get("/billing/events"),
};
