
import React from 'react';
import AnimatedElement from '../components/ui/AnimatedElement.tsx';
import { useI18n } from '../context/I18nContext.tsx';

interface ContactsPageProps {
  onNavigate?: (page: 'home' | 'service' | 'contacts' | 'blog' | 'article', serviceId?: string | null) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();

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

      {/* Featured Blog Articles - Internal Links for SEO */}
      <section className="max-w-5xl mx-auto mb-16">
        <AnimatedElement>
          <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">📚 Learn from Our Blog</h2>
          <p className="text-center text-slate-300 mb-12 max-w-3xl mx-auto">
            Dive into our in-depth guides covering cloud infrastructure, ML operations, security best practices, and enterprise networking.
          </p>
        </AnimatedElement>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Article 1 */}
          <AnimatedElement delay={300}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-blue-400 transition cursor-pointer group"
                 onClick={() => onNavigate?.('article', 'server-for-ml')}>
              <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 mb-3">
                🖥️ How to Choose a Server for ML Workloads
              </h3>
              <p className="text-slate-400 mb-4">
                Complete guide to CPU vs GPU selection, architecture comparison, and configuration recommendations for different ML projects.
              </p>
              <span className="text-blue-400 text-sm font-semibold">Read Article →</span>
            </div>
          </AnimatedElement>

          {/* Article 2 */}
          <AnimatedElement delay={400}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-blue-400 transition cursor-pointer group"
                 onClick={() => onNavigate?.('article', 'terraform-iac')}>
              <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 mb-3">
                ⚙️ Terraform for ML Infrastructure
              </h3>
              <p className="text-slate-400 mb-4">
                Infrastructure as Code best practices: VPC setup, EC2 instances, S3 storage, state management, and Terraform workflows.
              </p>
              <span className="text-blue-400 text-sm font-semibold">Read Article →</span>
            </div>
          </AnimatedElement>

          {/* Article 3 */}
          <AnimatedElement delay={500}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-blue-400 transition cursor-pointer group"
                 onClick={() => onNavigate?.('article', 'vault-secrets')}>
              <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 mb-3">
                🔐 Secret Management in the Cloud
              </h3>
              <p className="text-slate-400 mb-4">
                HashiCorp Vault setup: dynamic secrets, authentication methods, policies, audit logging, and production patterns.
              </p>
              <span className="text-blue-400 text-sm font-semibold">Read Article →</span>
            </div>
          </AnimatedElement>

          {/* Article 4 */}
          <AnimatedElement delay={600}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-blue-400 transition cursor-pointer group"
                 onClick={() => onNavigate?.('article', 'monitoring-stack')}>
              <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 mb-3">
                📊 Monitoring ML Models in Production
              </h3>
              <p className="text-slate-400 mb-4">
                Complete monitoring stack: Prometheus, Grafana, ELK Stack, data drift detection, alerting rules, and Docker deployment.
              </p>
              <span className="text-blue-400 text-sm font-semibold">Read Article →</span>
            </div>
          </AnimatedElement>

          {/* Article 5 */}
          <AnimatedElement delay={700}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-blue-400 transition cursor-pointer group"
                 onClick={() => onNavigate?.('article', 'corporate-networks')}>
              <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 mb-3">
                🌐 Enterprise Networks in the Cloud
              </h3>
              <p className="text-slate-400 mb-4">
                VPC architecture, security groups, NACLs, VPN connectivity, VPC Peering, PrivateLink, and multi-AZ design.
              </p>
              <span className="text-blue-400 text-sm font-semibold">Read Article →</span>
            </div>
          </AnimatedElement>

          {/* Blog Hub */}
          <AnimatedElement delay={800}>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-green-400 transition cursor-pointer group"
                 onClick={() => onNavigate?.('blog')}>
              <h3 className="text-xl font-bold text-green-400 group-hover:text-green-300 mb-3">
                📖 View All Blog Articles
              </h3>
              <p className="text-slate-400 mb-4">
                Explore our complete library of technical articles covering cloud infrastructure, ML operations, DevOps, security, and more.
              </p>
              <span className="text-green-400 text-sm font-semibold">Go to Blog →</span>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* Services Section - Internal Links */}
      <section className="max-w-5xl mx-auto mb-16">
        <AnimatedElement>
          <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">🚀 Our Services</h2>
          <p className="text-center text-slate-300 mb-12 max-w-3xl mx-auto">
            Comprehensive cloud infrastructure, development, and data solutions for your business needs.
          </p>
        </AnimatedElement>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Services - Grid of 6 key services */}
          {[
            { id: 'server', name: '🖥️ Cloud Servers', desc: 'Scalable compute infrastructure with GPU support' },
            { id: 'devops', name: '⚙️ DevOps', desc: 'Infrastructure automation and continuous deployment' },
            { id: 'analytics', name: '📊 Data Analytics', desc: 'ML pipelines and data engineering solutions' },
            { id: 'web', name: '🌐 Web Apps', desc: 'Full-stack web application development' },
            { id: 'scraping', name: '🕷️ Web Scraping', desc: 'Distributed data collection and processing' },
            { id: 'integration', name: '🔌 API Integration', desc: 'Seamless service connectivity and orchestration' }
          ].map((service, idx) => (
            <AnimatedElement key={service.id} delay={300 + idx * 100}>
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-orange-400 transition cursor-pointer group"
                   onClick={() => onNavigate?.('service', service.id)}>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-orange-400 mb-2 transition">
                  {service.name}
                </h3>
                <p className="text-slate-400 text-sm">
                  {service.desc}
                </p>
              </div>
            </AnimatedElement>
          ))}
        </div>
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
