
import React, { useState } from 'react';
import AnimatedElement from '../components/ui/AnimatedElement.tsx';
import { useI18n } from '../context/I18nContext.tsx';

const ContactsPage: React.FC = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend or email service
    alert('Form submission not yet configured. Please email us directly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <AnimatedElement>
          <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight">
            {t('contacts_title')}
          </h1>
        </AnimatedElement>
        <AnimatedElement delay={200}>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-300">
            {t('contacts_description')}
          </p>
        </AnimatedElement>
      </section>

      {/* Contact Info Grid */}
      <section className="max-w-5xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Email */}
          <AnimatedElement delay={300}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-slate-100 mb-2">📧 {t('email_label')}</h3>
              <a href="mailto:info@u-cloud24.com" className="text-blue-400 hover:underline text-lg">
                info@u-cloud24.com
              </a>
              <p className="text-slate-400 text-sm mt-2">General inquiries</p>
            </div>
          </AnimatedElement>

          {/* Support */}
          <AnimatedElement delay={400}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-slate-100 mb-2">🆘 Support</h3>
              <a href="mailto:support@u-cloud24.com" className="text-blue-400 hover:underline text-lg">
                support@u-cloud24.com
              </a>
              <p className="text-slate-400 text-sm mt-2">24/7 Technical Support</p>
            </div>
          </AnimatedElement>

          {/* Sales */}
          <AnimatedElement delay={500}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-slate-100 mb-2">💼 Sales</h3>
              <a href="mailto:sales@u-cloud24.com" className="text-blue-400 hover:underline text-lg">
                sales@u-cloud24.com
              </a>
              <p className="text-slate-400 text-sm mt-2">Enterprise solutions</p>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-2xl mx-auto mb-16">
        <AnimatedElement>
          <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:border-blue-400"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </AnimatedElement>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mb-16">
        <AnimatedElement>
          <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">FAQ</h2>
          <div className="space-y-4">
            <details className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-pointer">
              <summary className="font-bold text-slate-100">Response time for inquiries?</summary>
              <p className="text-slate-300 mt-2">We typically respond to inquiries within 2-4 hours during business hours, 24 hours for urgent support.</p>
            </details>
            <details className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-pointer">
              <summary className="font-bold text-slate-100">Do you offer free consultations?</summary>
              <p className="text-slate-300 mt-2">Yes, we offer free 30-minute consultations for new customers to discuss your requirements.</p>
            </details>
            <details className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-pointer">
              <summary className="font-bold text-slate-100">What languages do you support?</summary>
              <p className="text-slate-300 mt-2">We support English, Russian, and Polish. Our support team can assist in all three languages.</p>
            </details>
          </div>
        </AnimatedElement>
      </section>
    </div>
  );
};

export default ContactsPage;
