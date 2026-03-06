import { useEffect, useMemo, useState, type FC, type FormEvent } from 'react'
import { editSubmission, updateSubmissionStatus, type SubmissionStatus } from '../../lib/api'
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

  const [editForm, setEditForm] = useState({
    firstName: '',
    surnameLastName: '',
    middleName: '',
    gender: '',
    dateOfBirth: '',
    maritalStatus: '',
    religion: '',
    phoneNumberStaff: '',
    emailAddress: '',
    profession: '',
    permanentAddress: '',
    nokFullName: '',
    nokPhoneNumber: '',
    guarantorFullName: '',
    guarantorPhoneNumber: '',
  })
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [rejectedReason, setRejectedReason] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  useEffect(() => {
    if (!employee) return
    const fmt = (d?: string) => {
      if (!d) return ''
      try { return new Date(d).toISOString().split('T')[0] } catch { return '' }
    }
    setEditForm({
      firstName: employee.firstName ?? '',
      surnameLastName: employee.surname ?? '',
      middleName: employee.middleName ?? '',
      gender: employee.gender ?? '',
      dateOfBirth: fmt(employee.dateOfBirth),
      maritalStatus: employee.maritalStatus ?? '',
      religion: employee.religion ?? '',
      phoneNumberStaff: employee.phoneNumberStaff ?? '',
      emailAddress: employee.emailAddressM1 ?? '',
      profession: employee.profession ?? '',
      permanentAddress: employee.permanentAddress ?? '',
      nokFullName: employee.nextOfKinFullName ?? '',
      nokPhoneNumber: employee.phoneNumberNok ?? '',
      guarantorFullName: employee.guarantorFullName ?? '',
      guarantorPhoneNumber: employee.guarantorPhoneNumber ?? '',
    })
    setPassportFile(null)
    setSignatureFile(null)
    setEditSuccess(null)
    setEditError(null)
    setRejectedReason('')
    setStatusSuccess(null)
    setStatusError(null)
  }, [employee])

  const handleEditSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!employee?.referenceCode) return
    setEditLoading(true)
    setEditSuccess(null)
    setEditError(null)
    try {
      await editSubmission(employee.referenceCode, {
        ...editForm,
        passportPicture: passportFile,
        signature: signatureFile,
      })
      setEditSuccess('Submission updated successfully.')
      setPassportFile(null)
      setSignatureFile(null)
      onEditSuccess?.()
    } catch (err: any) {
      setEditError(err?.response?.data?.message ?? 'Failed to update submission.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleStatusUpdate = async (status: SubmissionStatus) => {
    if (!employee?.referenceCode) return
    if (status === 'REJECTED' && !rejectedReason.trim()) {
      setStatusError('A rejection reason is required.')
      return
    }
    setStatusLoading(true)
    setStatusSuccess(null)
    setStatusError(null)
    try {
      await updateSubmissionStatus(
        employee.referenceCode,
        status,
        status === 'REJECTED' ? rejectedReason.trim() : undefined,
      )
      const labels: Record<SubmissionStatus, string> = {
        ACTIVE: 'Submission approved successfully.',
        REJECTED: 'Submission rejected.',
        PENDING: 'Submission reset to pending.',
      }
      setStatusSuccess(labels[status])
      onEditSuccess?.()
    } catch (err: any) {
      setStatusError(err?.response?.data?.message ?? 'Failed to update status.')
    } finally {
      setStatusLoading(false)
    }
  }

  if (!open || !employee) return null

  const showSensitive = role === 'HR_ADMIN'
  const canEdit = role === 'HR_ADMIN' && employee.status?.toUpperCase() === 'PENDING'

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
          {['Profile', 'Contacts', 'Employment', ...(showSensitive ? ['Banking & IDs'] : []), 'Files', ...(canEdit ? ['Edit'] : []), ...(role === 'HR_ADMIN' ? ['Approval'] : [])].map(
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
                { label: 'Designation', value: employee.profession },
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

          {activeTab === 'Edit' && canEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                Only <strong>PENDING</strong> submissions can be edited. All fields are pre-filled — only non-empty values will be sent.
              </p>

              {editSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  {editSuccess}
                </div>
              )}
              {editError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
                  {editError}
                </div>
              )}

              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Personal Info</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { label: 'First Name', key: 'firstName' },
                      { label: 'Surname / Last Name', key: 'surnameLastName' },
                      { label: 'Middle Name', key: 'middleName' },
                      { label: 'Phone Number', key: 'phoneNumberStaff', type: 'tel' },
                      { label: 'Email Address', key: 'emailAddress', type: 'email' },
                      { label: 'Permanent Address', key: 'permanentAddress' },
                      { label: 'Designation', key: 'profession' },
                      { label: 'NOK Full Name', key: 'nokFullName' },
                      { label: 'NOK Phone', key: 'nokPhoneNumber', type: 'tel' },
                      { label: 'Guarantor Full Name', key: 'guarantorFullName' },
                      { label: 'Guarantor Phone', key: 'guarantorPhoneNumber', type: 'tel' },
                    ] as { label: string; key: keyof typeof editForm; type?: string }[]
                  ).map(({ label, key, type = 'text' }) => (
                    <div key={key}>
                      <label className="text-xs text-slate-500">{label}</label>
                      <input
                        type={type}
                        value={editForm[key]}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-xs text-slate-500">Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500">Marital Status</label>
                    <select
                      value={editForm.maritalStatus}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, maritalStatus: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                    >
                      <option value="">Select</option>
                      {['Single', 'Married', 'Divorced', 'Widowed'].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500">Religion</label>
                    <select
                      value={editForm.religion}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, religion: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                    >
                      <option value="">Select</option>
                      {['Christianity', 'Islam', 'Traditional', 'Others'].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Documents</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-500">Passport Picture (JPG/PNG)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => setPassportFile(e.target.files?.[0] ?? null)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1 file:text-xs file:text-emerald-700"
                    />
                    {passportFile && <p className="mt-1 text-xs text-emerald-600">{passportFile.name}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Signature (JPG/PNG)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1 file:text-xs file:text-emerald-700"
                    />
                    {signatureFile && <p className="mt-1 text-xs text-emerald-600">{signatureFile.name}</p>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
              >
                {editLoading ? 'Saving changes…' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'Approval' && role === 'HR_ADMIN' && (
            <div className="space-y-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status Management</div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                <div className="text-xs text-slate-400">Current Status</div>
                <div className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  employee.status?.toUpperCase() === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : employee.status?.toUpperCase() === 'REJECTED'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {employee.status ?? 'PENDING'}
                </div>
              </div>

              {statusSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  {statusSuccess}
                </div>
              )}
              {statusError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
                  {statusError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Rejection Reason <span className="text-slate-400">(required when rejecting)</span></label>
                  <textarea
                    value={rejectedReason}
                    onChange={(e) => setRejectedReason(e.target.value)}
                    rows={3}
                    placeholder="Describe why this submission is being rejected…"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 resize-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={() => handleStatusUpdate('ACTIVE')}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {statusLoading ? '…' : '✓ Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={() => handleStatusUpdate('REJECTED')}
                    className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-60"
                  >
                    {statusLoading ? '…' : '✗ Reject'}
                  </button>
                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={() => handleStatusUpdate('PENDING')}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    {statusLoading ? '…' : '↺ Reset to Pending'}
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Approving sets <strong>approvedBy</strong> and <strong>approvedAt</strong>. Rejecting clears them and records the reason. Resetting to Pending clears all three.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDrawer
