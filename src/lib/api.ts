import axios from 'axios'
import { authStorage } from './auth'

// the API url must include a scheme otherwise axios will treat it as a relative
// path (which leads to requests hitting the frontend instead of the backend).
// the environment variable is expected to supply the full URL (including
// http:// or https://) but we also fall back to a sensible default for local
// development.
// Leave baseURL empty so all /api/* requests are relative to the current origin.
// - In local dev:  Vite's proxy (vite.config.ts) forwards them to the backend.
// - In production: vercel.json rewrites forward them to the backend server-side,
//   avoiding any CORS issues.
const baseURL = import.meta.env.VITE_API_URL ?? ''

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Submissions API Types
export interface SubmissionData {
  // Personal Information
  preferredState: string
  title: string
  surnameLastName: string
  firstName: string
  middleName?: string
  dateOfBirth: string | Date
  gender: string
  maritalStatus: string
  religion: string
  nationality?: string
  stateOfOrigin: string
  permanentAddress: string
  emailAddress?: string
  phoneNumberStaff: string
  profession: string
  professionOther?: string
  hobbies?: string

  // Next of Kin
  nokFullName: string
  nokAddress: string
  relationshipNok: string
  nokPhoneNumber: string
  nokEmailAddress?: string

  // Guarantor
  guarantorFullName: string
  guarantorAddress: string
  relationshipWithGuarantor: string
  guarantorPhoneNumber: string
  guarantorEmailAddress?: string

  // Emergency Contact
  emergencyFullName?: string
  emergencyAddress?: string
  emergencyRelationship?: string
  emergencyPhoneNumber?: string
  emergencyEmailAddress?: string

  // Work Details
  siteAndLocation: string
  hiringStatus?: string
  siteId?: string

  // Documents
  passportPicture?: File | null
  signature?: File | null

  // Declaration
  declarationAccepted: boolean
}

export interface Submission extends SubmissionData {
  id: string
  referenceCode: string
  siteId: string
  status: 'PENDING' | 'ACTIVE' | 'REJECTED'
  approvedBy?: string
  approvedAt?: Date
  rejectedReason?: string
  createdBy: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateSubmissionResponse {
  success: boolean
  referenceCode: string
  id: string
  createdAt: string
}

export interface SubmissionsParams {
  page?: number
  limit?: number
  status?: 'PENDING' | 'ACTIVE' | 'REJECTED'
  q?: string
}

export interface SubmissionsResponse {
  data: Submission[]
  page: number
  limit: number
  total: number
}

export const getSubmissions = async (
  params?: SubmissionsParams,
): Promise<SubmissionsResponse> => {
  const response = await api.get('/api/submissions', { params })
  return response.data
}

export const getSubmissionById = async (id: string): Promise<Submission> => {
  const response = await api.get(`/api/submissions/${id}`)
  return response.data
}

export const createSubmission = async (
  data: SubmissionData,
): Promise<CreateSubmissionResponse> => {
  const formData = new FormData()

  // Required fields
  formData.append('preferredState', data.preferredState)
  formData.append('title', data.title)
  formData.append('firstName', data.firstName)
  formData.append('surnameLastName', data.surnameLastName)
  formData.append('dateOfBirth', String(data.dateOfBirth))
  formData.append('maritalStatus', data.maritalStatus)
  formData.append('religion', data.religion)
  formData.append('stateOfOrigin', data.stateOfOrigin)
  formData.append('permanentAddress', data.permanentAddress)
  formData.append('phoneNumberStaff', data.phoneNumberStaff)
  formData.append('profession', data.profession)
  formData.append('nokFullName', data.nokFullName)
  formData.append('nokAddress', data.nokAddress)
  formData.append('relationshipNok', data.relationshipNok)
  formData.append('nokPhoneNumber', data.nokPhoneNumber)
  formData.append('guarantorFullName', data.guarantorFullName)
  formData.append('guarantorAddress', data.guarantorAddress)
  formData.append('relationshipWithGuarantor', data.relationshipWithGuarantor)
  formData.append('guarantorPhoneNumber', data.guarantorPhoneNumber)
  formData.append('siteAndLocation', data.siteAndLocation)
  formData.append('declarationAccepted', 'true')
  if (data.siteId) formData.append('siteId', data.siteId)

  // Optional fields — only append if provided
  if (data.middleName) formData.append('middleName', data.middleName)
  if (data.emailAddress) formData.append('emailAddress', data.emailAddress)
  if (data.nationality) formData.append('nationality', data.nationality)
  if (data.hobbies) formData.append('hobbies', data.hobbies)
  if (data.professionOther) formData.append('professionOther', data.professionOther)
  if (data.hiringStatus) formData.append('hiringStatus', data.hiringStatus)
  if (data.nokEmailAddress) formData.append('nokEmailAddress', data.nokEmailAddress)
  if (data.guarantorEmailAddress) formData.append('guarantorEmailAddress', data.guarantorEmailAddress)
  if (data.emergencyFullName) formData.append('emergencyFullName', data.emergencyFullName)
  if (data.emergencyAddress) formData.append('emergencyAddress', data.emergencyAddress)
  if (data.emergencyRelationship) formData.append('emergencyRelationship', data.emergencyRelationship)
  if (data.emergencyPhoneNumber) formData.append('emergencyPhoneNumber', data.emergencyPhoneNumber)
  if (data.emergencyEmailAddress) formData.append('emergencyEmailAddress', data.emergencyEmailAddress)

  // Files — append as File objects (axios sets Content-Type automatically)
  if (data.passportPicture) formData.append('passportPicture', data.passportPicture)
  if (data.signature) formData.append('signature', data.signature)

  const response = await api.post('/api/submissions', formData)
  return response.data
}

export const updateSubmission = async (
  id: string,
  data: Partial<SubmissionData>,
): Promise<Submission> => {
  const response = await api.put(`/api/submissions/${id}`, data)
  return response.data
}

export const deleteSubmission = async (id: string): Promise<void> => {
  await api.delete(`/api/submissions/${id}`)
}

export type SubmissionStatus = 'ACTIVE' | 'REJECTED' | 'PENDING'

export const updateSubmissionStatus = async (
  referenceCode: string,
  status: SubmissionStatus,
  rejectedReason?: string,
): Promise<{ success: boolean; data: Submission }> => {
  const body: { status: SubmissionStatus; rejectedReason?: string } = { status }
  if (status === 'REJECTED' && rejectedReason) body.rejectedReason = rejectedReason
  const response = await api.patch(`/api/submissions/${referenceCode}`, body)
  return response.data
}

export interface EditSubmissionData {
  firstName?: string
  surnameLastName?: string
  middleName?: string
  gender?: string
  dateOfBirth?: string
  maritalStatus?: string
  religion?: string
  phoneNumberStaff?: string
  emailAddress?: string
  profession?: string
  permanentAddress?: string
  nokFullName?: string
  nokPhoneNumber?: string
  guarantorFullName?: string
  guarantorPhoneNumber?: string
  passportPicture?: File | null
  signature?: File | null
}

export const editSubmission = async (
  referenceCode: string,
  data: EditSubmissionData,
): Promise<{ success: boolean; data: Submission }> => {
  const formData = new FormData()
  if (data.firstName) formData.append('firstName', data.firstName)
  if (data.surnameLastName) formData.append('surnameLastName', data.surnameLastName)
  if (data.middleName) formData.append('middleName', data.middleName)
  if (data.gender) formData.append('gender', data.gender)
  if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth)
  if (data.maritalStatus) formData.append('maritalStatus', data.maritalStatus)
  if (data.religion) formData.append('religion', data.religion)
  if (data.phoneNumberStaff) formData.append('phoneNumberStaff', data.phoneNumberStaff)
  if (data.emailAddress) formData.append('emailAddress', data.emailAddress)
  if (data.profession) formData.append('profession', data.profession)
  if (data.permanentAddress) formData.append('permanentAddress', data.permanentAddress)
  if (data.nokFullName) formData.append('nokFullName', data.nokFullName)
  if (data.nokPhoneNumber) formData.append('nokPhoneNumber', data.nokPhoneNumber)
  if (data.guarantorFullName) formData.append('guarantorFullName', data.guarantorFullName)
  if (data.guarantorPhoneNumber) formData.append('guarantorPhoneNumber', data.guarantorPhoneNumber)
  if (data.passportPicture) formData.append('passportPicture', data.passportPicture)
  if (data.signature) formData.append('signature', data.signature)
  const response = await api.patch(`/api/submissions/${referenceCode}/edit`, formData)
  return response.data
}
