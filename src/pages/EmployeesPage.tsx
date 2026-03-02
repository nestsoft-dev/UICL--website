import { useEffect, useMemo, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeesTable from '../components/DataTable/EmployeesTable'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import type { EmployeeRecord } from '../components/DataTable/columns'

const mapSubmission = (record: any): EmployeeRecord => ({
  id: record.id ?? record._id,
  referenceCode: record.referenceCode ?? record.reference_code,
  title: record.title,
  hmoCode: record.hmoCode ?? record.hmo_code,
  surname: record.surname ?? record.lastName ?? record.last_name,
  firstName: record.firstName ?? record.first_name,
  middleName: record.middleName ?? record.middle_name,
  dateOfBirth: record.dateOfBirth ?? record.date_of_birth,
  gender: record.gender,
  maritalStatus: record.maritalStatus ?? record.marital_status,
  religion: record.religion,
  nationality: record.nationality,
  stateOfOrigin: record.stateOfOrigin ?? record.state_of_origin,
  permanentAddress: record.permanentAddress ?? record.permanent_address,
  emailAddressM1: record.emailAddressM1 ?? record.email_address_m1 ?? record.email,
  phoneNumberStaff: record.phoneNumberStaff ?? record.phone_number_staff ?? record.phone,
  profession: record.profession,
  employmentDate: record.employmentDate ?? record.employment_date ?? record.createdAt,
  hobbies: record.hobbies,
  nextOfKinFullName: record.nextOfKinFullName ?? record.next_of_kin_full_name,
  nextOfKinAddress: record.nextOfKinAddress ?? record.next_of_kin_address,
  relationshipNok: record.relationshipNok ?? record.relationship_nok,
  phoneNumberNok: record.phoneNumberNok ?? record.phone_number_nok,
  emailAddressNok: record.emailAddressNok ?? record.email_address_nok,
  guarantorFullName: record.guarantorFullName ?? record.guarantor_full_name,
  guarantorAddress: record.guarantorAddress ?? record.guarantor_address,
  relationshipWithGuarantor:
    record.relationshipWithGuarantor ?? record.relationship_with_guarantor,
  guarantorPhoneNumber: record.guarantorPhoneNumber ?? record.guarantor_phone_number,
  guarantorEmailAddress: record.guarantorEmailAddress ?? record.guarantor_email_address,
  fullNameEmergency: record.fullNameEmergency ?? record.full_name_emergency,
  addressEmergency: record.addressEmergency ?? record.address_emergency,
  relationshipEmergency: record.relationshipEmergency ?? record.relationship_emergency,
  phoneNumberEmergency: record.phoneNumberEmergency ?? record.phone_number_emergency,
  emailAddressEmergency: record.emailAddressEmergency ?? record.email_address_emergency,
  siteAndLocation: record.siteAndLocation ?? record.site_and_location,
  hiringStatus: record.hiringStatus ?? record.hiring_status ?? record.status,
  nameOfFinancialInstitution:
    record.nameOfFinancialInstitution ?? record.name_of_financial_institution,
  accountName: record.accountName ?? record.account_name,
  accountNumber: record.accountNumber ?? record.account_number,
  bankVerificationNumber: record.bankVerificationNumber ?? record.bvn,
  nameOfPensionFundAdministrator:
    record.nameOfPensionFundAdministrator ?? record.pension_fund_administrator,
  retirementSavingsAccountNumberPin:
    record.retirementSavingsAccountNumberPin ?? record.rsa_number,
  staffNinNumber: record.staffNinNumber ?? record.nin_number,
  taxIdentificationNumberTin: record.taxIdentificationNumberTin ?? record.tin,
  criminalConviction: record.criminalConviction ?? record.criminal_conviction,
  criminalConvictionDetails:
    record.criminalConvictionDetails ?? record.criminal_conviction_details,
  uploadPassportPicture:
    record.uploadPassportPicture ?? record.passport_url ?? record.passport,
  uploadSignature: record.uploadSignature ?? record.signature_url ?? record.signature,
  status: record.status,
  role: record.role,
})

const EmployeesPage: FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [data, setData] = useState<EmployeeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/api/submissions')
      const payload = Array.isArray(response.data) ? response.data : response.data?.data ?? []
      setData(payload.map(mapSubmission))
    } catch (err: any) {
      if (err?.response?.status === 403 && user?.role === 'DATA_ENTRY') {
        setError('You can only create submissions. Data view is restricted.')
      } else {
        setError('Unable to load employee data. Please try again.')
      }
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // data-entry users are not supposed to view the listing; send them straight
    // to the entry form instead of showing the error message that occurs when
    // the backend returns 403.
    if (user?.role === 'DATA_ENTRY') {
      navigate('/dashboard/entry', { replace: true })
      return
    }
    fetchEmployees()
  }, [])

  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter((item) => String(item.status).toLowerCase() === 'active').length
    const pending = data.filter((item) => String(item.status).toLowerCase() === 'pending').length
    const rejected = data.filter((item) => String(item.status).toLowerCase() === 'rejected').length
    return { total, active, pending, rejected }
  }, [data])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Employee Bio-Data
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View, filter, and manage staff submissions across sites.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Employees', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Pending', value: stats.pending },
          { label: 'Rejected', value: stats.rejected },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {card.label}
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-800">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <EmployeesTable
        data={data}
        loading={loading}
        error={error}
        role={user?.role}
        onRefresh={fetchEmployees}
      />
    </div>
  )
}

export default EmployeesPage
