import type { ColumnDef } from '@tanstack/react-table'
import type { ClearanceRole } from '../../lib/auth'

export type EmployeeRecord = {
  id?: string
  referenceCode?: string
  title?: string
  hmoCode?: string
  surname?: string
  firstName?: string
  middleName?: string
  dateOfBirth?: string
  gender?: string
  maritalStatus?: string
  religion?: string
  nationality?: string
  stateOfOrigin?: string
  permanentAddress?: string
  emailAddressM1?: string
  phoneNumberStaff?: string
  profession?: string
  employmentDate?: string
  hobbies?: string
  nextOfKinFullName?: string
  nextOfKinAddress?: string
  relationshipNok?: string
  phoneNumberNok?: string
  emailAddressNok?: string
  guarantorFullName?: string
  guarantorAddress?: string
  relationshipWithGuarantor?: string
  guarantorPhoneNumber?: string
  guarantorEmailAddress?: string
  fullNameEmergency?: string
  addressEmergency?: string
  relationshipEmergency?: string
  phoneNumberEmergency?: string
  emailAddressEmergency?: string
  siteAndLocation?: string
  hiringStatus?: string
  nameOfFinancialInstitution?: string
  accountName?: string
  accountNumber?: string
  bankVerificationNumber?: string
  nameOfPensionFundAdministrator?: string
  retirementSavingsAccountNumberPin?: string
  staffNinNumber?: string
  taxIdentificationNumberTin?: string
  criminalConviction?: string
  criminalConvictionDetails?: string
  uploadPassportPicture?: string
  uploadSignature?: string
  status?: 'Pending' | 'Active' | 'Rejected' | string
  role?: string
}

export const sensitiveColumnIds = [
  'nameOfFinancialInstitution',
  'accountName',
  'accountNumber',
  'bankVerificationNumber',
  'nameOfPensionFundAdministrator',
  'retirementSavingsAccountNumberPin',
  'staffNinNumber',
  'taxIdentificationNumberTin',
  'criminalConviction',
  'criminalConvictionDetails',
]

const fileCell =
  (onPreview: (label: string, url: string) => void, label: string) =>
  ({ row }: { row: { original: EmployeeRecord } }) => {
    const value =
      label === 'passport'
        ? row.original.uploadPassportPicture
        : row.original.uploadSignature
    if (!value) {
      return <span className="text-xs text-slate-400">Not uploaded</span>
    }
    return (
      <button
        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
        onClick={(event) => {
          event.stopPropagation()
          onPreview(
            label === 'passport' ? 'Passport Picture' : 'Signature',
            value,
          )
        }}
      >
        View
      </button>
    )
  }

export const buildColumns = (
  role: ClearanceRole | undefined,
  onPreview: (label: string, url: string) => void,
): ColumnDef<EmployeeRecord>[] => [
  { header: 'Title', accessorKey: 'title' },
  { header: 'HMO Code', accessorKey: 'hmoCode' },
  { header: 'Surname/ Last Name', accessorKey: 'surname' },
  { header: 'First Name', accessorKey: 'firstName' },
  { header: 'Middle Name', accessorKey: 'middleName' },
  { header: 'Date of Birth', accessorKey: 'dateOfBirth' },
  { header: 'Gender', accessorKey: 'gender' },
  { header: 'Marital Status', accessorKey: 'maritalStatus' },
  { header: 'Religion', accessorKey: 'religion' },
  { header: 'Nationality', accessorKey: 'nationality' },
  { header: 'State of Origin', accessorKey: 'stateOfOrigin' },
  { header: 'Permanent Address', accessorKey: 'permanentAddress' },
  { header: 'Email Address+M1', accessorKey: 'emailAddressM1' },
  { header: 'Phone Number Staff', accessorKey: 'phoneNumberStaff' },
  { header: 'Designation', accessorKey: 'profession' },
  { header: 'Employment Date', accessorKey: 'employmentDate' },
  { header: 'Hobbies', accessorKey: 'hobbies' },
  { header: 'Next of Kin Full Name', accessorKey: 'nextOfKinFullName' },
  { header: 'Next of Kin Address', accessorKey: 'nextOfKinAddress' },
  { header: 'Relationship NOK', accessorKey: 'relationshipNok' },
  { header: 'Phone Number NOK', accessorKey: 'phoneNumberNok' },
  { header: 'Email Address NOK', accessorKey: 'emailAddressNok' },
  { header: 'Guarantor Full Name', accessorKey: 'guarantorFullName' },
  { header: 'Guarantor Address', accessorKey: 'guarantorAddress' },
  { header: 'Relationship with Guarantor', accessorKey: 'relationshipWithGuarantor' },
  { header: 'Guarantor Phone Number', accessorKey: 'guarantorPhoneNumber' },
  { header: 'Guarantor Email Address', accessorKey: 'guarantorEmailAddress' },
  { header: 'Full Name Emergency', accessorKey: 'fullNameEmergency' },
  { header: 'Address Emergency', accessorKey: 'addressEmergency' },
  { header: 'Relationship Emergency', accessorKey: 'relationshipEmergency' },
  { header: 'Phone Number Emergency', accessorKey: 'phoneNumberEmergency' },
  { header: 'Email Address Emergency', accessorKey: 'emailAddressEmergency' },
  { header: 'Site and Location', accessorKey: 'siteAndLocation' },
  { header: 'Hiring Status', accessorKey: 'hiringStatus' },
  { header: 'Name of Financial Institution', accessorKey: 'nameOfFinancialInstitution' },
  { header: 'Account Name', accessorKey: 'accountName' },
  { header: 'Account Number', accessorKey: 'accountNumber' },
  { header: 'Bank Verification Number', accessorKey: 'bankVerificationNumber' },
  {
    header: 'Name of Pension Fund Administrator',
    accessorKey: 'nameOfPensionFundAdministrator',
  },
  {
    header: 'Retirement Savings Account Number/PIN',
    accessorKey: 'retirementSavingsAccountNumberPin',
  },
  { header: 'Staff NIN Number', accessorKey: 'staffNinNumber' },
  { header: 'Tax Identification number (TIN)', accessorKey: 'taxIdentificationNumberTin' },
  {
    header: 'Have you ever been convicted of Any criminal offence?',
    accessorKey: 'criminalConviction',
  },
  {
    header: 'Details (If you selected yes above, kindly provide more details)',
    accessorKey: 'criminalConvictionDetails',
  },
  {
    header: 'Upload Passport Picture (Maximum file size of 1MB, .jpg or .png files only)',
    accessorKey: 'uploadPassportPicture',
    cell: fileCell(onPreview, 'passport'),
  },
  {
    header: 'Upload Signature (Maximum file size of 1MB, .jpg or .png files only)',
    accessorKey: 'uploadSignature',
    cell: fileCell(onPreview, 'signature'),
  },
].filter((col) => {
  if (!role || role === 'HR_ADMIN') return true
  const accessorKey = (col as { accessorKey?: string }).accessorKey
  return accessorKey ? !sensitiveColumnIds.includes(accessorKey) : true
})
