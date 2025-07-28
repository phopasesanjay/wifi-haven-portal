// API Response Types
export interface ApiResponse<T> {
  page: number;
  pageSize: number;
  data: T[];
}

// User Types
export interface User {
  userUId: string;
  email: string;
  firstName: string;
  lastName: string;
  unit: string;
  apartmentNo: string;
  createdAt: string;
  updatedAt: string;
}

// Complaint Types
export interface Complaint {
  complaintUId: string;
  userUId: string;
  speedTestUId: string;
  appartmentNo: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Email Request Type
export interface SendEmailRequest {
  emails: string[];
}

// API Query Parameters
export interface ApiQueryParams {
  page: number;
  pageSize: number;
}

// Create Complaint Request Type
export interface CreateComplaintRequest {
  email: string;
  appartmentNo: string;
  description: string;
}

// Submit Speed Record Request Type
export interface SubmitSpeedRecordRequest {
  email: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

// Standard API Success Response
export interface ApiSuccessResponse {
  success: boolean;
  body: string;
}