'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CaretDown } from 'phosphor-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    program: '',
    childAge: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    if (formData.message.length > 500) {
      setSubmitStatus('Message must be 500 characters or less');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          program: formData.program,
          childAge: formData.childAge,
          message: formData.message
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('Thank you for your message! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          program: '',
          childAge: '',
          message: ''
        });
      } else {
        setSubmitStatus(data.error || 'There was an error sending your message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-[#f5f5f5]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-[#0a192f]/50 font-bold text-xs uppercase tracking-[0.3em] mb-4">Send a Message</p>
            <h2 className="text-4xl font-bold text-[#0a192f] uppercase mb-4">Tell Us What You Need</h2>
            <div className="w-12 h-0.5 bg-[#f7b733] mb-4" />
            <p className="text-lg text-gray-600">
              Fill out the form below and we'll get back to you as soon as possible
            </p>
          </div>
          
          <form id="contact-form" onSubmit={handleSubmit} className="bg-white p-8 md:p-10 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-[#0a192f] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-[#0a192f] transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-[#0a192f] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none bg-white border border-gray-300 px-4 py-3 pr-10 focus:outline-none focus:border-[#0a192f] transition-colors"
                  >
                    <option value="">Select Subject</option>
                    {['General Inquiry', 'Enrollment', 'School Tour', 'Scholarship Support', 'Admissions Support', 'Other'].map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program of Interest</label>
                <div className="relative">
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full appearance-none bg-white border border-gray-300 px-4 py-3 pr-10 focus:outline-none focus:border-[#0a192f] transition-colors"
                  >
                    <option value="">Not Sure Yet</option>
                    <option value="Nursery">Nursery</option>
                    <option value="Primary">Primary</option>
                    <option value="Junior School">Junior School</option>
                    <option value="Music Program">Music Program</option>
                    <option value="Sports Program">Sports Program</option>
                  </select>
                  <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child Age / Grade</label>
                <div className="relative">
                  <select
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleChange}
                    className="w-full appearance-none bg-white border border-gray-300 px-4 py-3 pr-10 focus:outline-none focus:border-[#0a192f] transition-colors"
                  >
                    <option value="">Not Sure Yet</option>
                    <option value="2-3 years">2-3 years</option>
                    <option value="4-5 years">4-5 years</option>
                    <option value="Grade 1-3">Grade 1-3</option>
                    <option value="Grade 4-7">Grade 4-7</option>
                    <option value="High School">High School</option>
                  </select>
                  <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                maxLength={500}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-[#0a192f] transition-colors resize-none"
                placeholder="Tell us about your requirements, questions, or any specific needs..."
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.message.length}/500 characters
              </div>
            </div>

            {submitStatus && (
              <div className={`mb-6 p-4 ${submitStatus.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {submitStatus}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0a192f] text-white px-8 py-4 hover:bg-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-semibold uppercase tracking-[0.18em] text-sm"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}