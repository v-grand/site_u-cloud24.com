import React from 'react';
import { BLOG_ARTICLES } from '../constants.ts';
import Button from '../components/ui/Button.tsx';
import { useI18n } from '../context/I18nContext.tsx';

type Page = 'home' | 'service' | 'contacts' | 'blog' | 'article';

interface BlogPageProps {
  onNavigate: (page: Page, articleSlug?: string | null) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight">
          {t('blog_title')}
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-300">
          {t('blog_subtitle')}
        </p>
      </section>

      {/* Blog Articles Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10"
            >
              {/* Article Image/Placeholder */}
              <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 border-b border-slate-700/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-cyan-400 text-4xl mb-2">📄</div>
                  <p className="text-slate-400 text-sm">{article.section}</p>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                    {article.section}
                  </span>
                  <span className="text-xs text-slate-500">{article.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-200 mb-2">
                  {article.title}
                </h3>

                <p className="text-slate-400 text-sm mb-4">
                  {article.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                  <span className="text-xs text-slate-500">
                    {new Date(article.publishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => onNavigate('article', article.slug)}
                    className="text-cyan-400 hover:text-orange-400 transition-colors duration-200 text-sm font-medium"
                  >
                    Read More →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-r from-cyan-500/10 to-orange-500/10 border border-slate-700/50 rounded-lg">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">
          Need Expert Help?
        </h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          Our team can help you implement the solutions discussed in our articles.
        </p>
        <Button>Get a Free Consultation</Button>
      </section>
    </div>
  );
};

export default BlogPage;
