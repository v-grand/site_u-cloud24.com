import React, { useState, useEffect } from 'react';
import { BLOG_ARTICLES } from '../constants.ts';
import Button from '../components/ui/Button.tsx';
import { useI18n } from '../context/I18nContext.tsx';

type Page = 'home' | 'service' | 'contacts' | 'blog' | 'article';

interface BlogArticlePageProps {
  articleSlug: string;
  onNavigate: (page: Page, articleSlug?: string | null) => void;
}

const getTranslation = (value: any, language: string): string => {
  if (typeof value === 'object' && value !== null) {
    return value[language as keyof typeof value] || value.en;
  }
  return value;
};

const BlogArticlePage: React.FC<BlogArticlePageProps> = ({ articleSlug, onNavigate }) => {
  const { t, language } = useI18n();
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const article = BLOG_ARTICLES.find(a => a.slug === articleSlug);

  useEffect(() => {
    if (!article) {
      setError(true);
      setIsLoading(false);
      return;
    }

    // Load markdown content from public/blog directory
    fetch(`/blog/${article.slug}.md`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load article');
        return response.text();
      })
      .then(markdown => {
        setContent(markdown);
        setIsLoading(false);
        // Update page title
        const articleTitle = getTranslation(article.title, language);
        document.title = `U-Cloud 24 | ${articleTitle}`;
        // Scroll to top
        window.scrollTo(0, 0);
      })
      .catch(err => {
        console.error('Error loading article:', err);
        setError(true);
        setIsLoading(false);
      });
  }, [articleSlug, article]);

  if (!article) {
    return (
      <div className="text-center py-32">
        <h1 className="text-3xl font-bold text-slate-100 mb-4">{t('blog_article_not_found')}</h1>
        <p className="text-slate-400 mb-8">{t('blog_article_not_found_desc')}</p>
        <Button onClick={() => onNavigate('blog')}>{t('blog_back')}</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-32">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">{t('blog_loading')}</h1>
        <div className="inline-block animate-spin">
          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="text-center py-32">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">{t('blog_error_loading')}</h1>
        <p className="text-slate-400 mb-8">{t('blog_error_desc')}</p>
        <Button onClick={() => onNavigate('blog')}>{t('blog_back')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-16 md:py-24">
      {/* Article Header */}
      <header className="mb-12">
        <button
          onClick={() => onNavigate('blog')}
          className="text-cyan-400 hover:text-orange-400 transition-colors duration-200 text-sm font-medium mb-6 inline-flex items-center"
        >
          ← {t('blog_back')}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
            {article.section}
          </span>
          <span className="text-xs text-slate-500">
            {getTranslation(article.readTime, language)}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-6">
          {getTranslation(article.title, language)}
        </h1>

        <p className="text-lg text-slate-400 mb-6">
          {getTranslation(article.description, language)}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-8 border-b border-slate-700/50">
          <span>{t('blog_by_author')} {article.author}</span>
          <span>•</span>
          <span>
            {new Date(article.publishedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span>•</span>
          <span>{getTranslation(article.readTime, language)}</span>
        </div>
      </header>

      {/* Article Content - Markdown */}
      <article className="prose prose-invert max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-strong:text-cyan-400 prose-code:text-orange-400 prose-pre:bg-slate-800/50 prose-a:text-cyan-400 hover:prose-a:text-orange-400">
        <div
          dangerouslySetInnerHTML={{
            __html: parseMarkdownToHTML(content)
          }}
        />
      </article>

      {/* Article Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-700/50">
        <div className="bg-gradient-to-r from-cyan-500/10 to-orange-500/10 border border-slate-700/50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-slate-100 mb-3">
            {t('blog_helpful_question')}
          </h3>
          <p className="text-slate-400 mb-6">
            {t('blog_helpful_description')}
          </p>
          <Button onClick={() => onNavigate('contacts')}>{t('blog_schedule_consultation')}</Button>
        </div>
      </footer>

      {/* Related Articles */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-100 mb-8">{t('blog_related_articles')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_ARTICLES.filter(
            a => a.slug !== articleSlug && a.section === article.section
          )
            .slice(0, 2)
            .map(relatedArticle => (
              <article
                key={relatedArticle.slug}
                className="group bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer"
                onClick={() => onNavigate('article', relatedArticle.slug)}
              >
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-200 mb-2">
                  {getTranslation(relatedArticle.title, language)}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {getTranslation(relatedArticle.description, language)}
                </p>
                <span className="text-cyan-400 text-sm font-medium">
                  {t('blog_read_more')}
                </span>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
};

// Simple markdown to HTML parser
function parseMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-12 mb-6">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```(.*?)\n([\s\S]*?)```/gm, '<pre class="bg-slate-800/50 border border-slate-700/50 rounded p-4 my-4 overflow-x-auto"><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-800/50 px-2 py-1 rounded text-sm">$1</code>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-cyan-400 hover:text-orange-400" target="_blank" rel="noopener noreferrer">$1</a>');

  // Lists
  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-6 my-2">$1</li>');
  html = html.replace(/^\- (.*?)$/gm, '<li class="ml-6 my-2">$1</li>');
  html = html.replace(/^\d+\. (.*?)$/gm, '<li class="ml-6 my-2">$1</li>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.match(/^<[hplu]/) || para.match(/^```/)) {
      return para;
    }
    return `<p class="my-4">${para}</p>`;
  }).join('');

  // Tables (simple support)
  html = html.replace(/^\|(.+)\|$/gm, () => {
    const rows = html.split('\n').filter(line => line.match(/^\|(.+)\|$/));
    const tableHTML = `<table class="w-full border-collapse border border-slate-700/50 my-6"><tbody>${rows.map(row => {
      const cells = row.split('|').filter(cell => cell.trim());
      return `<tr>${cells.map(cell => `<td class="border border-slate-700/50 p-2">${cell.trim()}</td>`).join('')}</tr>`;
    }).join('')}</tbody></table>`;
    return tableHTML;
  });

  return html;
}

export default BlogArticlePage;
