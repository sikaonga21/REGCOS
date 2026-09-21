'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CaretDown, CheckCircle, WarningCircle } from 'phosphor-react';
import { motion } from 'framer-motion';

export default function EnrollmentForm() {
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    childName: '',
    childDob: '',
    program: '',
    previousSchool: '',
    specialNeeds: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          parentName: '',
          parentEmail: '',
          parentPhone: '',
          childName: '',
          childDob: '',
          program: '',
          previousSchool: '',
          specialNeeds: ''
        });
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
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gold font-bold text-xs uppercase tracking-[0.3em] mb-4">Join Our Community</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">Student Registration</h2>
            <div className="w-16 h-1 bg-gold mx-auto mb-6 rounded-full" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Please complete the form below to register your child's interest in joining Regcos Christian Academy. Our admissions team will contact you shortly.
            </p>
          </motion.div>
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-navy via-gold to-navy"></div>

            <h3 className="text-xl font-bold text-navy mb-6 border-b border-gray-100 pb-4">Parent/Guardian Information</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                  placeholder="e.g. john@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                  placeholder="e.g. +260 970 000000"
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-navy mb-6 border-b border-gray-100 pb-4">Student Information</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Child's Full Name *</label>
                <input
                  type="text"
                  name="childName"
                  value={formData.childName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="childDob"
                  value={formData.childDob}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program/Grade Applying For *</label>
                <div className="relative">
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none bg-gray-50 border border-gray-200 px-4 py-3 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-gray-700"
                  >
                    <option value="">Select a Program</option>
                    <option value="Nursery">Nursery / Pre-School</option>
                    <option value="Primary">Primary School</option>
                    <option value="Junior School">Junior Secondary</option>
                    <option value="Senior School">Senior Secondary</option>
                  </select>
                  <CaretDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Previous School (if applicable)</label>
                <input
                  type="text"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-navy mb-6 border-b border-gray-100 pb-4">Additional Information</h3>
            <div className="mb-10">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Conditions or Special Needs</label>
              <textarea
                name="specialNeeds"
                value={formData.specialNeeds}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none"
                placeholder="Please describe any allergies, medical conditions, or learning requirements we should be aware of..."
              />
            </div>

            {submitStatus === 'success' && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl flex items-start gap-4">
                <CheckCircle size={28} weight="fill" className="text-green-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-green-800 font-bold mb-1">Registration Received!</h4>
                  <p className="text-green-700 text-sm">Thank you for registering. We have sent the details to our admissions team and they will be in touch with you shortly.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4">
                <WarningCircle size={28} weight="fill" className="text-red-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-red-800 font-bold mb-1">Submission Failed</h4>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="w-full bg-navy hover:bg-navy-light text-white px-8 py-5 rounded-xl font-bold uppercase tracking-[0.15em] text-sm transition-all shadow-xl shadow-navy/20 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
