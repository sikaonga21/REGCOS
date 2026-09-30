'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle, WarningCircle } from 'phosphor-react';
import { motion } from 'framer-motion';

const initialFormData: Record<string, string> = {
  childName: '',
  childDob: '',
  gender: '',
  residentialAddress: '',
  fatherName: '',
  fatherOccupation: '',
  fatherWorkPlace: '',
  fatherPhone: '',
  fatherEmail: '',
  fatherNationality: '',
  fatherReligion: '',
  motherName: '',
  motherOccupation: '',
  motherWorkPlace: '',
  motherPhone: '',
  motherEmail: '',
  motherNationality: '',
  motherReligion: '',
  previousSchool: '',
  comfortableInGroups: '',
  hasSiblings: '',
  hasPet: '',
  specialDiet: '',
  hasAllergies: '',
  allergyDetails: '',
  usesDiapers: '',
  usesPotty: '',
  toiletReminders: '',
  developmentalConcern: '',
  developmentalDetails: '',
  dayToDayCare: '',
  homeLanguage: '',
  expectedStartDate: '',
};

const inputClassName = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 transition-all focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/50';

function Field({
  label,
  name,
  type = 'text',
  required = false,
  formData,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  formData: Record<string, string>;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-700">
      <span className="mb-2 block">{label}{required ? ' *' : ''}</span>
      {type === 'textarea' ? (
        <textarea name={name} value={formData[name]} onChange={onChange} required={required} rows={3} className={`${inputClassName} resize-none`} />
      ) : (
        <input type={type} name={name} value={formData[name]} onChange={onChange} required={required} className={inputClassName} />
      )}
    </label>
  );
}

function RadioGroup({
  label,
  name,
  options,
  formData,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  formData: Record<string, string>;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-gray-700">{label}{required ? ' *' : ''}</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input type="radio" name={name} value={option} checked={formData[name] === option} onChange={onChange} required={required && option === options[0]} className="h-4 w-4 accent-[#063B82]" />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-6 border-b border-gray-100 pb-4 text-xl font-bold uppercase tracking-wide text-navy">{children}</h3>;
}

export default function EnrollmentForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ ...initialFormData });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'There was an error submitting the registration. Please try again.');
      }
    } catch (error) {
      console.error('Enrollment form error:', error);
      setSubmitStatus('error');
      setErrorMessage('There was a network error sending your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-cream py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <motion.div className="mb-12 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-gold">Join Our Community</p>
            <h2 className="mb-6 text-4xl font-bold text-navy md:text-5xl">Student Registration</h2>
            <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-gold" />
            <p className="mx-auto max-w-2xl text-lg text-gray-600">Please complete the form below to register your child's interest in joining Regcos Christian Academy.</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-navy via-gold to-navy" />

            <div className="mb-10">
              <SectionTitle>Child's Information</SectionTitle>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Child's name?" name="childName" required formData={formData} onChange={handleChange} />
                <Field label="Date of Birth?" name="childDob" type="date" required formData={formData} onChange={handleChange} />
                <RadioGroup label="Gender?" name="gender" options={['Male', 'Female']} required formData={formData} onChange={handleChange} />
                <Field label="Residential Address?" name="residentialAddress" required formData={formData} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-10">
              <SectionTitle>1. Parent Details (Emergency Contact Information)</SectionTitle>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Father/Guardian's Name?" name="fatherName" required formData={formData} onChange={handleChange} />
                <Field label="Occupation?" name="fatherOccupation" required formData={formData} onChange={handleChange} />
                <Field label="Work Place?" name="fatherWorkPlace" required formData={formData} onChange={handleChange} />
                <Field label="Phone/WhatsApp No?" name="fatherPhone" type="tel" required formData={formData} onChange={handleChange} />
                <Field label="Email Address?" name="fatherEmail" type="email" required formData={formData} onChange={handleChange} />
                <Field label="Nationality?" name="fatherNationality" required formData={formData} onChange={handleChange} />
                <Field label="Religion?" name="fatherReligion" required formData={formData} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-10">
              <SectionTitle>2. Parent Details (Emergency Contact Information)</SectionTitle>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Mother/Guardian's Name?" name="motherName" required formData={formData} onChange={handleChange} />
                <Field label="Occupation?" name="motherOccupation" required formData={formData} onChange={handleChange} />
                <Field label="Work Place?" name="motherWorkPlace" required formData={formData} onChange={handleChange} />
                <Field label="Phone/WhatsApp No?" name="motherPhone" type="tel" required formData={formData} onChange={handleChange} />
                <Field label="Email Address?" name="motherEmail" type="email" required formData={formData} onChange={handleChange} />
                <Field label="Nationality?" name="motherNationality" required formData={formData} onChange={handleChange} />
                <Field label="Religion?" name="motherReligion" required formData={formData} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-10">
              <SectionTitle>Further Information About Your Child</SectionTitle>
              <div className="space-y-7">
                <RadioGroup label="Has your child been to any other school before?" name="previousSchool" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <RadioGroup label="Is your child comfortable in group situation?" name="comfortableInGroups" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <RadioGroup label="Does your child have any siblings?" name="hasSiblings" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <RadioGroup label="Does your child have a pet?" name="hasPet" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <RadioGroup label="Is your child on any special diet?" name="specialDiet" options={['Vegetarian', 'Vegan', 'Other', 'None']} formData={formData} onChange={handleChange} />
                <RadioGroup label="Does your child have any allergies?" name="hasAllergies" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <Field label="If yes, please describe" name="allergyDetails" type="textarea" formData={formData} onChange={handleChange} />
                <RadioGroup label="Does your child use diapers?" name="usesDiapers" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <RadioGroup label="Does your child use a potty or toilet?" name="usesPotty" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <RadioGroup label="Does your child need regular reminder to go to the toilet?" name="toiletReminders" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <RadioGroup label="In what area do you have concern about your child's development?" name="developmentalConcern" options={['Hearing', 'Vision', 'Language', 'Gross Motor', 'Fine Motor', 'Others', 'None']} required formData={formData} onChange={handleChange} />
                <Field label="If any, kindly explain..." name="developmentalDetails" type="textarea" required formData={formData} onChange={handleChange} />
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Who has day to day care of your child at home?" name="dayToDayCare" formData={formData} onChange={handleChange} />
                  <Field label="What language is spoken at home?" name="homeLanguage" formData={formData} onChange={handleChange} />
                  <Field label="Expected date to start school?" name="expectedStartDate" type="date" formData={formData} onChange={handleChange} />
                </div>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-8 flex items-start gap-4 rounded-xl border border-green-200 bg-green-50 p-6">
                <CheckCircle size={28} weight="fill" className="mt-1 shrink-0 text-green-500" />
                <div><h4 className="mb-1 font-bold text-green-800">Registration Received!</h4><p className="text-sm text-green-700">Thank you for registering. Our admissions team will be in touch shortly.</p></div>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mb-8 flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-6">
                <WarningCircle size={28} weight="fill" className="mt-1 shrink-0 text-red-500" />
                <div><h4 className="mb-1 font-bold text-red-800">Submission Failed</h4><p className="text-sm text-red-700">{errorMessage}</p></div>
              </div>
            )}

            <button type="submit" disabled={isSubmitting || submitStatus === 'success'} className="w-full rounded-xl bg-navy px-8 py-5 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-xl shadow-navy/20 transition-all hover:scale-[1.02] hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
