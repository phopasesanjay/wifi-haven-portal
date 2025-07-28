import { API_CONFIG, getApiUrl } from '@/config/api';
import type { 
  ApiResponse, 
  User, 
  Complaint, 
  SendEmailRequest, 
  ApiQueryParams,
  CreateComplaintRequest,
  SubmitSpeedRecordRequest,
  ApiSuccessResponse
} from '@/types/api';

// Generic API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        await response.text()
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Send Email API
export async function sendEmailToUser(emails: string[]): Promise<void> {
  const url = getApiUrl(API_CONFIG.endpoints.sendEmailToUser);
  const payload: SendEmailRequest = { emails };

  await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Get All Users API
export async function getAllUsers(params: ApiQueryParams): Promise<ApiResponse<User>> {
  const url = getApiUrl(API_CONFIG.endpoints.getAllUsers);
  const payload = {
    data: [],
    page: params.page,
    pageSize: params.pageSize
  };

  return apiRequest<ApiResponse<User>>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Get All Complaints API
export async function getAllComplaints(params: ApiQueryParams): Promise<ApiResponse<Complaint>> {
  const url = getApiUrl(API_CONFIG.endpoints.getAllComplaints);
  const payload = {
    data: [],
    page: params.page,
    pageSize: params.pageSize
  };

  return apiRequest<ApiResponse<Complaint>>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Resolve Complaint API
export async function resolveComplaint(complaintUId: string): Promise<void> {
  const url = getApiUrl(API_CONFIG.endpoints.resolveComplaint);
  const payload = { complaintUId };

  await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Create Complaint API
export async function createComplaint(payload: CreateComplaintRequest): Promise<ApiSuccessResponse> {
  const url = getApiUrl(API_CONFIG.endpoints.createComplaint);

  return apiRequest<ApiSuccessResponse>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Submit Speed Record API
export async function submitSpeedRecord(payload: SubmitSpeedRecordRequest): Promise<ApiSuccessResponse> {
  const url = getApiUrl(API_CONFIG.endpoints.submitSpeedRecord);

  return apiRequest<ApiSuccessResponse>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}