import { useEffect, useMemo, useState, type FC } from 'react'
import type { ClearanceRole } from '../../lib/auth'
import type { EmployeeRecord } from '../DataTable/columns'

export type SensitiveRecord = {
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
}

type DrawerProps = {
  open: boolean
  onClose: () => void
  employee: EmployeeRecord | null
  sensitive?: SensitiveRecord | null
  role?: ClearanceRole
  onPreviewFile: (label: string, url: string) => void
}

const Section: FC<{
  title: string
  items: { label: string; value?: string }[]
  copyable?: string[]
}> = ({ title, items, copyable }) => (
  <div className="space-y-3">
    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
      {title}
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="text-xs text-slate-400">{item.label}</div>
          <div className="flex items-center justify-between gap-2 text-sm font-medium text-slate-700">
            <span>{item.value || '—'}</span>
            {copyable?.includes(item.label) && item.value ? (
              <button
                className="rounded-full border border-slate-200 px-2 py-1 text-[10px] text-slate-500 hover:bg-white"
                onClick={() => navigator.clipboard.writeText(item.value ?? '')}
              >
                Copy
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const EmployeeDrawer: FC<DrawerProps> = ({
  open,
  onClose,
  employee,
  sensitive,
  role,
  onPreviewFile,
}) => {
  const [activeTab, setActiveTab] = useState('Profile')

  useEffect(() => {
    if (employee) {
      setActiveTab('Profile')
    }
  }, [employee])

  const fullName = useMemo(() => {
    if (!employee) return ''
    return [employee.title, employee.firstName, employee.middleName, employee.surname]
      .filter(Boolean)
      .join(' ')
  }, [employee])

  if (!open || !employee) return null

  const showSensitive = role === 'HR_ADMIN'

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="text-lg font-semibold text-slate-800">{fullName || 'Employee Details'}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {employee.referenceCode ? (
                <span className="rounded-full border border-slate-200 px-3 py-1">
                  Ref: {employee.referenceCode}
                </span>
              ) : null}
              {employee.role ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  {employee.role}
                </span>
              ) : null}
              {employee.status ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {employee.status}
                </span>
              ) : null}
            </div>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-6 py-3 text-sm font-medium text-slate-500">
          {['Profile', 'Contacts', 'Employment', ...(showSensitive ? ['Banking & IDs'] : []), 'Files'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 ${
                  activeTab === tab
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="space-y-6 px-6 py-6">
          {activeTab === 'Profile' && (
            <Section
              title="Personal Profile"
              items={[
                { label: 'Title', value: employee.title },
                { label: 'Surname', value: employee.surname },
                { label: 'First Name', value: employee.firstName },
                { label: 'Middle Name', value: employee.middleName },
                { label: 'Date of Birth', value: employee.dateOfBirth },
                { label: 'Gender', value: employee.gender },
                { label: 'Marital Status', value: employee.maritalStatus },
                { label: 'Religion', value: employee.religion },
                { label: 'Nationality', value: employee.nationality },
                { label: 'State of Origin', value: employee.stateOfOrigin },
                { label: 'Permanent Address', value: employee.permanentAddress },
              ]}
            />
          )}

          {activeTab === 'Contacts' && (
            <>
              <Section
                title="Staff Contacts"
                items={[
                  { label: 'Email Address', value: employee.emailAddressM1 },
                  { label: 'Phone Number', value: employee.phoneNumberStaff },
                ]}
                copyable={['Email Address', 'Phone Number']}
              />
              <Section
                title="Next of Kin"
                items={[
                  { label: 'Full Name', value: employee.nextOfKinFullName },
                  { label: 'Address', value: employee.nextOfKinAddress },
                  { label: 'Relationship', value: employee.relationshipNok },
                  { label: 'Phone Number', value: employee.phoneNumberNok },
                  { label: 'Email', value: employee.emailAddressNok },
                ]}
                copyable={['Phone Number', 'Email']}
              />
              <Section
                title="Guarantor"
                items={[
                  { label: 'Full Name', value: employee.guarantorFullName },
                  { label: 'Address', value: employee.guarantorAddress },
                  { label: 'Relationship', value: employee.relationshipWithGuarantor },
                  { label: 'Phone Number', value: employee.guarantorPhoneNumber },
                  { label: 'Email', value: employee.guarantorEmailAddress },
                ]}
                copyable={['Phone Number', 'Email']}
              />
              <Section
                title="Emergency Contact"
                items={[
                  { label: 'Full Name', value: employee.fullNameEmergency },
                  { label: 'Address', value: employee.addressEmergency },
                  { label: 'Relationship', value: employee.relationshipEmergency },
                  { label: 'Phone Number', value: employee.phoneNumberEmergency },
                  { label: 'Email', value: employee.emailAddressEmergency },
                ]}
                copyable={['Phone Number', 'Email']}
              />
            </>
          )}

          {activeTab === 'Employment' && (
            <Section
              title="Employment"
              items={[
                { label: 'Profession', value: employee.profession },
                { label: 'Employment Date', value: employee.employmentDate },
                { label: 'Site & Location', value: employee.siteAndLocation },
                { label: 'Hiring Status', value: employee.hiringStatus },
                { label: 'HMO Code', value: employee.hmoCode },
                { label: 'Hobbies', value: employee.hobbies },
              ]}
            />
          )}

          {activeTab === 'Banking & IDs' && showSensitive && (
            <Section
              title="Sensitive Data"
              items={[
                { label: 'Financial Institution', value: sensitive?.nameOfFinancialInstitution },
                { label: 'Account Name', value: sensitive?.accountName },
                { label: 'Account Number', value: sensitive?.accountNumber },
                { label: 'BVN', value: sensitive?.bankVerificationNumber },
                { label: 'Pension Fund Admin', value: sensitive?.nameOfPensionFundAdministrator },
                { label: 'RSA Number/PIN', value: sensitive?.retirementSavingsAccountNumberPin },
                { label: 'NIN', value: sensitive?.staffNinNumber },
                { label: 'TIN', value: sensitive?.taxIdentificationNumberTin },
                { label: 'Criminal Conviction', value: sensitive?.criminalConviction },
                { label: 'Conviction Details', value: sensitive?.criminalConvictionDetails },
              ]}
              copyable={['Account Number', 'BVN', 'NIN', 'TIN']}
            />
          )}

          {activeTab === 'Files' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Files
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Passport Picture', url: employee.uploadPassportPicture },
                  { label: 'Signature', url: employee.uploadSignature },
                ].map((file) => (
                  <div
                    key={file.label}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div>
                      <div className="text-xs text-slate-400">{file.label}</div>
                      <div className="text-sm font-medium text-slate-700">
                        {file.url ? 'Available' : 'Not Uploaded'}
                      </div>
                    </div>
                    {file.url ? (
                      <button
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                        onClick={() => onPreviewFile(file.label, file.url!)}
                      >
                        View
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDrawer
