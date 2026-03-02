import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import HeaderCard from '../components/HeaderCard'
import ProgressBar from '../components/ProgressBar'
import SectionCard from '../components/SectionCard'
import FormField from '../components/FormField'
import TextInput from '../components/fields/TextInput'
import SelectInput from '../components/fields/SelectInput'
import Textarea from '../components/fields/Textarea'
import FileInput, { type FileValue } from '../components/fields/FileInput'
import { nigerianStates } from '../constants/nigerianStates'
import { createSubmission, type SubmissionData } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'

const DRAFT_KEY = 'bayelsa_biodata_draft'

const requiredText = z.string().trim().min(1, 'Required')
const optionalText = z.string().optional().or(z.literal(''))
const optionalEmail = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .optional()
  .or(z.literal(''))
const requiredPhone = z
  .string()
  .trim()
  .regex(/^\d{11}$/, 'Phone number must be 11 digits')
const optionalPhone = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || /^\d{11}$/.test(value), {
    message: 'Phone number must be 11 digits',
  })

const fileSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    base64: z.string(),
    file: z.instanceof(File),
  })
  .refine((file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type), {
    message: 'Only JPG or PNG files are allowed',
  })
  .refine((file) => file.size <= 1024 * 1024, {
    message: 'File must be 1MB or smaller',
  })

const optionalFile = z.union([fileSchema, z.null()]).optional()

const formSchema = z
  .object({
    preferredState: requiredText,
    title: requiredText,
    surnameLastName: requiredText,
    firstName: requiredText,
    middleName: optionalText,
    dateOfBirth: requiredText,
    maritalStatus: requiredText,
    religion: requiredText,
    nationality: requiredText,
    stateOfOrigin: requiredText,
    permanentAddress: requiredText,
    emailAddress: optionalEmail,
    phoneNumberStaff: requiredPhone,
    profession: requiredText,
    hobbies: optionalText,
    nokFullName: requiredText,
    nokAddress: requiredText,
    relationshipNok: requiredText,
    nokPhoneNumber: requiredPhone,
    nokEmailAddress: optionalEmail,
    guarantorFullName: requiredText,
    guarantorAddress: requiredText,
    relationshipWithGuarantor: requiredText,
    guarantorPhoneNumber: requiredPhone,
    guarantorEmailAddress: optionalEmail,
    emergencyFullName: optionalText,
    emergencyAddress: optionalText,
    emergencyRelationship: optionalText,
    emergencyPhoneNumber: optionalPhone,
    emergencyEmailAddress: optionalEmail,
    siteAndLocation: requiredText,
    hiringStatus: requiredText,
    nameOfFinancialInstitution: requiredText,
    accountName: requiredText,
    accountNumber: requiredText.regex(/^\d{10}$/, 'Account number must be 10 digits'),
    bankVerificationNumberBvn: requiredText.regex(/^\d{11}$/, 'BVN must be exactly 11 digits'),
    nameOfPensionFundAdministrator: optionalText,
    retirementSavingsAccountNumberOrPin: optionalText,
    staffNinNumber: optionalText.refine(
      (value) => !value || /^\d{11}$/.test(value),
      { message: 'NIN must be 11 digits' },
    ),
    taxIdentificationNumberTin: optionalText,
    convictedCriminalOffence: z.enum(['Yes', 'No']).catch('No'),
    convictionDetails: optionalText,
    uploadPassportPicture: optionalFile,
    uploadSignature: optionalFile,
    declarationAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the declaration',
    }),
  })
  .refine(
    (data) =>
      data.convictedCriminalOffence === 'No' ||
      (data.convictionDetails ?? '').trim().length > 0,
    {
      path: ['convictionDetails'],
      message: 'Conviction details are required',
    },
  )

type FormValues = z.infer<typeof formSchema>

const titleOptions = ['Mr', 'Mrs', 'Miss', 'Dr', 'Engr', 'Prof', 'Others']
const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed']
const religionOptions = ['Christianity', 'Islam', 'Traditional', 'Others']
const professionOptions = [
  'AC TECHNICIAN',
  'Accountant',
  'Administrator',
  'Cleaner',
  'Driver',
  'Engineer',
  'HR Officer',
  'Operations',
  'Security',
  'Supervisor',
  'Technician',
]
const hiringOptions = ['New hire', 'Existing staff', 'Contract', 'Intern']

const defaultValues: FormValues = {
  preferredState: 'Bayelsa',
  title: '',
  surnameLastName: '',
  firstName: '',
  middleName: '',
  dateOfBirth: '',
  maritalStatus: '',
  religion: '',
  nationality: 'Nigeria',
  stateOfOrigin: '',
  permanentAddress: '',
  emailAddress: '',
  phoneNumberStaff: '',
  profession: '',
  hobbies: '',
  nokFullName: '',
  nokAddress: '',
  relationshipNok: '',
  nokPhoneNumber: '',
  nokEmailAddress: '',
  guarantorFullName: '',
  guarantorAddress: '',
  relationshipWithGuarantor: '',
  guarantorPhoneNumber: '',
  guarantorEmailAddress: '',
  emergencyFullName: '',
  emergencyAddress: '',
  emergencyRelationship: '',
  emergencyPhoneNumber: '',
  emergencyEmailAddress: '',
  siteAndLocation: '',
  hiringStatus: 'New hire',
  nameOfFinancialInstitution: '',
  accountName: '',
  accountNumber: '',
  bankVerificationNumberBvn: '',
  nameOfPensionFundAdministrator: '',
  retirementSavingsAccountNumberOrPin: '',
  staffNinNumber: '',
  taxIdentificationNumberTin: '',
  convictedCriminalOffence: '' as FormValues['convictedCriminalOffence'],
  convictionDetails: '',
  uploadPassportPicture: null,
  uploadSignature: null,
  declarationAccepted: false,
}

export default function FormPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const [hasDraft, setHasDraft] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const saveTimer = useRef<number | null>(null)
  const [progress, setProgress] = useState(0)

  const [professionSelectValue, setProfessionSelectValue] = useState('')
  const [professionCustomValue, setProfessionCustomValue] = useState('')
  const preferredState = watch('preferredState')
  const convictedValue = watch('convictedCriminalOffence')

  const stepText = useMemo(() => {
    const step = Math.min(7, Math.max(1, Math.ceil((progress / 100) * 7)))
    return `Step ${step} of 7`
  }, [progress])

  const handleStateChange = (value: string) => {
    setValue('preferredState', value, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      setHasDraft(true)
      setDraftLoaded(false)
    } else {
      setDraftLoaded(true)
    }
  }, [])

  const loadDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) {
      setDraftLoaded(true)
      setHasDraft(false)
      return
    }
    try {
      const parsed = JSON.parse(saved) as FormValues
      reset({ ...defaultValues, ...parsed })
      if (parsed.profession && professionOptions.includes(parsed.profession)) {
        setProfessionSelectValue(parsed.profession)
        setProfessionCustomValue('')
      } else if (parsed.profession) {
        setProfessionSelectValue('Other')
        setProfessionCustomValue(parsed.profession)
      } else {
        setProfessionSelectValue('')
        setProfessionCustomValue('')
      }
    } catch {
      reset(defaultValues)
    }
    setDraftLoaded(true)
    setHasDraft(false)
  }

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    reset(defaultValues)
    setProfessionSelectValue('')
    setProfessionCustomValue('')
    setHasDraft(false)
    setDraftLoaded(true)
  }

  useEffect(() => {
    if (!draftLoaded) return
    const subscription = watch((value) => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
      }
      saveTimer.current = window.setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(value))
      }, 800)
    })
    return () => {
      subscription.unsubscribe()
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
      }
    }
  }, [watch, draftLoaded])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight
      const maxScroll = docHeight - winHeight
      const percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
      setProgress(Math.min(100, Math.max(0, percent)))
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const onSubmit = async (values: FormValues) => {
    try {
      // Prepare submission data matching the backend schema
      const submissionData: SubmissionData = {
        preferredState: values.preferredState,
        title: values.title,
        surnameLastName: values.surnameLastName,
        firstName: values.firstName,
        middleName: values.middleName,
        dateOfBirth: values.dateOfBirth,
        maritalStatus: values.maritalStatus,
        religion: values.religion,
        nationality: values.nationality,
        stateOfOrigin: values.stateOfOrigin,
        permanentAddress: values.permanentAddress,
        emailAddress: values.emailAddress,
        phoneNumberStaff: values.phoneNumberStaff,
        profession: values.profession || values.profession,
        professionOther: values.profession === 'Others' ? values.profession : undefined,
        hobbies: values.hobbies,
        nokFullName: values.nokFullName,
        nokAddress: values.nokAddress,
        relationshipNok: values.relationshipNok,
        nokPhoneNumber: values.nokPhoneNumber,
        nokEmailAddress: values.nokEmailAddress,
        guarantorFullName: values.guarantorFullName,
        guarantorAddress: values.guarantorAddress,
        relationshipWithGuarantor: values.relationshipWithGuarantor,
        guarantorPhoneNumber: values.guarantorPhoneNumber,
        guarantorEmailAddress: values.guarantorEmailAddress,
        emergencyFullName: values.emergencyFullName,
        emergencyAddress: values.emergencyAddress,
        emergencyRelationship: values.emergencyRelationship,
        emergencyPhoneNumber: values.emergencyPhoneNumber,
        emergencyEmailAddress: values.emergencyEmailAddress,
        siteAndLocation: values.siteAndLocation,
        hiringStatus: values.hiringStatus,
        siteId: user?.siteId ?? undefined,
        passportPicture: values.uploadPassportPicture?.file ?? null,
        signature: values.uploadSignature?.file ?? null,
        declarationAccepted: values.declarationAccepted === true,
      }

      // Call the API
      const response = await createSubmission(submissionData)

      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_KEY)

      // Navigate to success page with reference code
      navigate(`/success?ref=${response.referenceCode}`)
    } catch (error) {
      console.error('[Error] Submission failed:', error)
      alert(
        `Failed to submit form. Please check your connection and try again. ${error instanceof Error ? error.message : ''}`,
      )
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-6">
        {hasDraft && !draftLoaded && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-emerald-900">
                  Continue your saved draft
                </p>
                <p className="text-xs text-emerald-700">
                  We found a saved draft from a previous session.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={loadDraft}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  Continue Draft
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="rounded-xl border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        )}

        <HeaderCard
          preferredState={preferredState}
          onStateChange={handleStateChange}
          states={nigerianStates}
          error={errors.preferredState?.message}
        />

        <ProgressBar progress={progress} stepText={stepText} />
        <p className="text-xs text-slate-500">
          Your progress is saved automatically. You can continue later.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('preferredState')} />
          <SectionCard title="Personal Info">
            <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
              <FormField
                label="Title"
                required
                error={errors.title?.message}
                htmlFor="title"
              >
                <SelectInput id="title" {...register('title')}>
                  <option value="">Select</option>
                  {titleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField
                label="Surname/Last Name"
                required
                error={errors.surnameLastName?.message}
                htmlFor="surnameLastName"
              >
                <TextInput
                  id="surnameLastName"
                  placeholder="Enter surname"
                  {...register('surnameLastName')}
                />
              </FormField>

              <FormField
                label="First Name"
                required
                error={errors.firstName?.message}
                htmlFor="firstName"
              >
                <TextInput
                  id="firstName"
                  placeholder="Enter first name"
                  {...register('firstName')}
                />
              </FormField>

              <FormField
                label="Middle Name"
                error={errors.middleName?.message}
                htmlFor="middleName"
              >
                <TextInput
                  id="middleName"
                  placeholder="Enter middle name"
                  {...register('middleName')}
                />
              </FormField>
            </div>

            <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
              <FormField
                label="Date of Birth"
                required
                error={errors.dateOfBirth?.message}
                htmlFor="dateOfBirth"
              >
                <TextInput id="dateOfBirth" type="date" {...register('dateOfBirth')} />
              </FormField>

              <FormField
                label="Marital Status"
                required
                error={errors.maritalStatus?.message}
                htmlFor="maritalStatus"
              >
                <SelectInput id="maritalStatus" {...register('maritalStatus')}>
                  <option value="">Select</option>
                  {maritalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField
                label="Religion"
                required
                error={errors.religion?.message}
                htmlFor="religion"
              >
                <SelectInput id="religion" {...register('religion')}>
                  <option value="">Select</option>
                  {religionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField
                label="Nationality"
                required
                error={errors.nationality?.message}
                htmlFor="nationality"
              >
                <TextInput id="nationality" {...register('nationality')} />
              </FormField>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
              <FormField
                label="State of Origin"
                required
                error={errors.stateOfOrigin?.message}
                htmlFor="stateOfOrigin"
              >
                <SelectInput id="stateOfOrigin" {...register('stateOfOrigin')}>
                  <option value="">Select</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField
                label="Phone Number (Staff)"
                required
                error={errors.phoneNumberStaff?.message}
                htmlFor="phoneNumberStaff"
              >
                <TextInput
                  id="phoneNumberStaff"
                  type="tel"
                  placeholder="Enter phone number"
                  {...register('phoneNumberStaff')}
                />
              </FormField>

              <FormField
                label="Email Address"
                error={errors.emailAddress?.message}
                htmlFor="emailAddress"
              >
                <TextInput
                  id="emailAddress"
                  type="email"
                  placeholder="Enter email address"
                  {...register('emailAddress')}
                />
              </FormField>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
              <FormField
                label="Permanent Address"
                required
                error={errors.permanentAddress?.message}
                htmlFor="permanentAddress"
              >
                <TextInput
                  id="permanentAddress"
                  placeholder="Enter permanent address"
                  {...register('permanentAddress')}
                />
              </FormField>

              <FormField
                label="Profession"
                required
                error={errors.profession?.message}
              >
                <Controller
                  name="profession"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <SelectInput
                        value={professionSelectValue}
                        onChange={(event) => {
                          const value = event.target.value
                          setProfessionSelectValue(value)
                          if (value === 'Other') {
                            field.onChange(professionCustomValue)
                          } else {
                            setProfessionCustomValue('')
                            field.onChange(value)
                          }
                        }}
                      >
                        <option value="">Select</option>
                        {professionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                        <option value="Other">Other (Specify)</option>
                      </SelectInput>

                      {professionSelectValue === 'Other' && (
                        <TextInput
                          placeholder="Specify Profession"
                          value={professionCustomValue}
                          onChange={(event) => {
                            setProfessionCustomValue(event.target.value)
                            field.onChange(event.target.value)
                          }}
                        />
                      )}
                    </div>
                  )}
                />
              </FormField>

              <FormField
                label="Hobbies"
                error={errors.hobbies?.message}
                htmlFor="hobbies"
              >
                <TextInput id="hobbies" placeholder="Enter hobbies" {...register('hobbies')} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Next of Kin (NOK)">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Full Name"
                required
                error={errors.nokFullName?.message}
                htmlFor="nokFullName"
              >
                <TextInput id="nokFullName" {...register('nokFullName')} />
              </FormField>

              <FormField
                label="Relationship"
                required
                error={errors.relationshipNok?.message}
                htmlFor="relationshipNok"
              >
                <TextInput id="relationshipNok" {...register('relationshipNok')} />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Address"
                required
                error={errors.nokAddress?.message}
                htmlFor="nokAddress"
              >
                <TextInput id="nokAddress" {...register('nokAddress')} />
              </FormField>

              <FormField
                label="Phone Number"
                required
                error={errors.nokPhoneNumber?.message}
                htmlFor="nokPhoneNumber"
              >
                <TextInput id="nokPhoneNumber" type="tel" {...register('nokPhoneNumber')} />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Email Address"
                error={errors.nokEmailAddress?.message}
                htmlFor="nokEmailAddress"
              >
                <TextInput id="nokEmailAddress" type="email" {...register('nokEmailAddress')} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Guarantor">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Full Name"
                required
                error={errors.guarantorFullName?.message}
                htmlFor="guarantorFullName"
              >
                <TextInput id="guarantorFullName" {...register('guarantorFullName')} />
              </FormField>

              <FormField
                label="Relationship"
                required
                error={errors.relationshipWithGuarantor?.message}
                htmlFor="relationshipWithGuarantor"
              >
                <TextInput
                  id="relationshipWithGuarantor"
                  {...register('relationshipWithGuarantor')}
                />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Address"
                required
                error={errors.guarantorAddress?.message}
                htmlFor="guarantorAddress"
              >
                <TextInput id="guarantorAddress" {...register('guarantorAddress')} />
              </FormField>

              <FormField
                label="Phone Number"
                required
                error={errors.guarantorPhoneNumber?.message}
                htmlFor="guarantorPhoneNumber"
              >
                <TextInput
                  id="guarantorPhoneNumber"
                  type="tel"
                  {...register('guarantorPhoneNumber')}
                />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Email Address"
                error={errors.guarantorEmailAddress?.message}
                htmlFor="guarantorEmailAddress"
              >
                <TextInput
                  id="guarantorEmailAddress"
                  type="email"
                  {...register('guarantorEmailAddress')}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Emergency Contact">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Full Name"
                error={errors.emergencyFullName?.message}
                htmlFor="emergencyFullName"
              >
                <TextInput id="emergencyFullName" {...register('emergencyFullName')} />
              </FormField>

              <FormField
                label="Relationship"
                error={errors.emergencyRelationship?.message}
                htmlFor="emergencyRelationship"
              >
                <TextInput
                  id="emergencyRelationship"
                  {...register('emergencyRelationship')}
                />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Address"
                error={errors.emergencyAddress?.message}
                htmlFor="emergencyAddress"
              >
                <TextInput id="emergencyAddress" {...register('emergencyAddress')} />
              </FormField>

              <FormField
                label="Phone Number"
                error={errors.emergencyPhoneNumber?.message}
                htmlFor="emergencyPhoneNumber"
              >
                <TextInput
                  id="emergencyPhoneNumber"
                  type="tel"
                  {...register('emergencyPhoneNumber')}
                />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Email Address"
                error={errors.emergencyEmailAddress?.message}
                htmlFor="emergencyEmailAddress"
              >
                <TextInput
                  id="emergencyEmailAddress"
                  type="email"
                  {...register('emergencyEmailAddress')}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Employment">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Site and Location"
                required
                error={errors.siteAndLocation?.message}
                htmlFor="siteAndLocation"
              >
                <TextInput id="siteAndLocation" {...register('siteAndLocation')} />
              </FormField>

              <FormField
                label="Hiring Status"
                required
                error={errors.hiringStatus?.message}
                htmlFor="hiringStatus"
              >
                <SelectInput id="hiringStatus" {...register('hiringStatus')}>
                  <option value="">Select</option>
                  {hiringOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Banking / IDs">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Name of Financial Institution"
                required
                error={errors.nameOfFinancialInstitution?.message}
                htmlFor="nameOfFinancialInstitution"
              >
                <TextInput
                  id="nameOfFinancialInstitution"
                  {...register('nameOfFinancialInstitution')}
                />
              </FormField>

              <FormField
                label="Account Name"
                required
                error={errors.accountName?.message}
                htmlFor="accountName"
              >
                <TextInput id="accountName" {...register('accountName')} />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Account Number"
                required
                error={errors.accountNumber?.message}
                hint="Account number must be 10 digits."
                htmlFor="accountNumber"
              >
                <TextInput
                  id="accountNumber"
                  inputMode="numeric"
                  {...register('accountNumber')}
                />
              </FormField>

              <FormField
                label="Bank Verification Number (BVN)"
                required
                error={errors.bankVerificationNumberBvn?.message}
                htmlFor="bankVerificationNumberBvn"
              >
                <TextInput
                  id="bankVerificationNumberBvn"
                  inputMode="numeric"
                  {...register('bankVerificationNumberBvn')}
                />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Name of Pension Fund Administrator"
                error={errors.nameOfPensionFundAdministrator?.message}
                htmlFor="nameOfPensionFundAdministrator"
              >
                <TextInput
                  id="nameOfPensionFundAdministrator"
                  {...register('nameOfPensionFundAdministrator')}
                />
              </FormField>

              <FormField
                label="Retirement Savings Account Number/PIN"
                error={errors.retirementSavingsAccountNumberOrPin?.message}
                htmlFor="retirementSavingsAccountNumberOrPin"
              >
                <TextInput
                  id="retirementSavingsAccountNumberOrPin"
                  {...register('retirementSavingsAccountNumberOrPin')}
                />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Staff NIN Number"
                error={errors.staffNinNumber?.message}
                htmlFor="staffNinNumber"
              >
                <TextInput id="staffNinNumber" {...register('staffNinNumber')} />
              </FormField>

              <FormField
                label="Tax Identification Number (TIN)"
                error={errors.taxIdentificationNumberTin?.message}
                htmlFor="taxIdentificationNumberTin"
              >
                <TextInput
                  id="taxIdentificationNumberTin"
                  {...register('taxIdentificationNumberTin')}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Compliance">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Convicted of Criminal Offence?"
                required
                error={errors.convictedCriminalOffence?.message}
              >
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="radio"
                      value="Yes"
                      {...register('convictedCriminalOffence')}
                      className="peer sr-only"
                    />
                    <span className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white">
                      Yes
                    </span>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      value="No"
                      {...register('convictedCriminalOffence')}
                      className="peer sr-only"
                    />
                    <span className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white">
                      No
                    </span>
                  </label>
                </div>
              </FormField>

              <FormField
                label="Conviction Details"
                required={convictedValue === 'Yes'}
                error={errors.convictionDetails?.message}
                htmlFor="convictionDetails"
                hint="Provide a brief summary if applicable."
              >
                <div
                  className={`transition-all duration-300 ${
                    convictedValue === 'Yes'
                      ? 'max-h-40 opacity-100'
                      : 'max-h-0 overflow-hidden opacity-0'
                  }`}
                >
                  <Textarea id="convictionDetails" {...register('convictionDetails')} />
                </div>
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Upload Passport Picture"
                error={errors.uploadPassportPicture?.message}
              >
                <Controller
                  name="uploadPassportPicture"
                  control={control}
                  render={({ field }) => (
                    <FileInput
                      id="uploadPassportPicture"
                      accept="image/png,image/jpeg"
                      value={field.value as FileValue | null}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Upload Signature"
                error={errors.uploadSignature?.message}
              >
                <Controller
                  name="uploadSignature"
                  control={control}
                  render={({ field }) => (
                    <FileInput
                      id="uploadSignature"
                      accept="image/png,image/jpeg"
                      value={field.value as FileValue | null}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Sign & Submit">
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Declaration</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  I hereby declare that the information provided above is true
                  and correct to the best of my knowledge. I understand that
                  any false information may lead to disqualification or
                  termination of employment.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="declarationAccepted"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
                  {...register('declarationAccepted')}
                />
                <div>
                  <label
                    htmlFor="declarationAccepted"
                    className="text-sm text-slate-700"
                  >
                    I accept the declaration stated above
                    <span className="ml-1 text-rose-500" title="Required">
                      *
                    </span>
                  </label>
                  {errors.declarationAccepted?.message && (
                    <p className="text-xs text-rose-600">
                      {errors.declarationAccepted?.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting…' : 'Sign & Submit'}
              </button>
            </div>
          </SectionCard>
        </form>
        </div>
      </div>
    </main>
  )
}
