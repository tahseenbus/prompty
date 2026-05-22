import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PromptCard } from './components/PromptCard';
import { fallbackCategories, fallbackPrompts } from './data/fallbackPrompts';
import { hasSupabaseEnv, supabase } from './lib/supabase';
import type { Category, PromptItem } from './types';

const ALL_CATEGORY = 'all';

function App() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [prompts, setPrompts] = useState<PromptItem[]>(fallbackPrompts);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!supabase || !hasSupabaseEnv) {
        setLoading(false);
        setError('اعرضنا بيانات تجريبية لأن متغيرات Supabase غير مضبوطة بعد.');
        return;
      }

      setLoading(true);
      setError(null);

      const [{ data: categoryRows, error: categoryError }, { data: promptRows, error: promptError }] =
        await Promise.all([
          supabase.from('categories').select('*').order('order', { ascending: true }),
          supabase.from('prompts').select('*').order('created_at', { ascending: false }),
        ]);

      if (ignore) {
        return;
      }

      if (categoryError || promptError) {
        setError('تعذر جلب البيانات من Supabase. يتم عرض بيانات تجريبية مؤقتًا.');
        setCategories(fallbackCategories);
        setPrompts(fallbackPrompts);
      } else {
        setCategories(categoryRows ?? fallbackCategories);
        setPrompts(promptRows ?? fallbackPrompts);
      }

      setLoading(false);
    }

    void loadData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!copiedId) {
      return;
    }

    const timer = window.setTimeout(() => setCopiedId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const categoriesWithAll = useMemo(
    () => [{ id: ALL_CATEGORY, slug: ALL_CATEGORY, name_ar: 'الكل', order: 0 }, ...categories],
    [categories],
  );

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return prompts.filter((prompt) => {
      const matchesCategory =
        activeCategory === ALL_CATEGORY || prompt.category === activeCategory;

      const haystack = [prompt.title_ar, prompt.prompt_ar, prompt.usage, prompt.tags.join(' ')]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, prompts, query]);

  const groupedPrompts = useMemo(() => {
    return categories.map((category) => ({
      category,
      prompts: filteredPrompts.filter((prompt) => prompt.category === category.slug),
    }));
  }, [categories, filteredPrompts]);

  const totalPromptCount = prompts.length;

  async function handleCopy(promptText: string, promptId: string) {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedId(promptId);
    } catch {
      setCopiedId(null);
    }
  }

  function handleCategoryNavClick(slug: string) {
    setActiveCategory(ALL_CATEGORY);
    requestAnimationFrame(() => {
      const target = document.getElementById(`category-${slug}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <div className="min-h-screen text-ink">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-[#fffaf2]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
          <a href="#top" className="text-lg font-semibold tracking-tight text-ink">
            مكتبة البرومبتات العربية
          </a>
          </div>

          <nav className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => handleCategoryNavClick(category.slug)}
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-ink"
              >
                {category.name_ar}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-hero-glow" />
          <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-16 lg:pt-16">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-bronze/20 bg-white/80 px-4 py-2 text-sm font-medium text-bronze">
                أرشيف عربي جاهز للنسخ والاستخدام
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.35] text-ink sm:text-5xl lg:text-6xl">
                  اكتشف برومبتات عربية عملية للكتابة والبرمجة والتعليم والأعمال
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  مكتبة عربية مصممة لتكون مرجعك السريع للبرومبتات الاحترافية.
                  ابحث، صفِّ، وانسخ النص المناسب فورًا من واجهة خفيفة وسريعة
                  تعمل بالكامل من Supabase.
                </p>
              </div>

              <label className="relative block max-w-2xl">
                <span className="sr-only">ابحث في البرومبتات</span>
                <Search
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث بالعنوان أو النص أو الوسوم..."
                  className="w-full rounded-[26px] border border-white/70 bg-white/90 py-4 pr-12 pl-4 text-base text-ink shadow-soft outline-none transition placeholder:text-slate-400 focus:border-bronze/40 focus:ring-4 focus:ring-bronze/10"
                />
              </label>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="rounded-full bg-white/80 px-4 py-2 shadow-sm">
                  {totalPromptCount} برومبت متاح
                </span>
                <span className="rounded-full bg-white/80 px-4 py-2 shadow-sm">
                  {categories.length} تصنيفات رئيسية
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {categories.slice(0, 4).map((category, index) => (
                <div
                  key={category.slug}
                  className={`rounded-[30px] border border-white/70 p-5 shadow-soft ${
                    index % 2 === 0 ? 'bg-white/80' : 'bg-sand/85'
                  }`}
                >
                  <p className="mb-2 text-sm font-medium text-bronze">
                    {category.name_ar}
                  </p>
                  <h2 className="mb-3 text-xl font-semibold leading-8">
                    {category.slug === 'writing' && 'صياغات جاهزة لمحتوى عربي متقن'}
                    {category.slug === 'coding' && 'برومبتات تساعدك على إنتاج كود أوضح'}
                    {category.slug === 'education' && 'قوالب تعليمية لشرح وتقييم أفضل'}
                    {category.slug === 'business' && 'نماذج عملية للتواصل والتحليل'}
                  </h2>
                  <p className="text-sm leading-7 text-slate-600">
                    تصفح مجموعة مختارة قابلة للنسخ الفوري، مع نصوص استخدام واضحة
                    ووسوم تسهّل العثور على المطلوب.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
            {categoriesWithAll.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                  activeCategory === category.slug
                    ? 'border-olive bg-olive text-white'
                    : 'border-white/70 bg-white/80 text-slate-600 hover:border-bronze/20 hover:text-ink'
                }`}
              >
                {category.name_ar}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          {loading && (
            <div className="rounded-[28px] border border-dashed border-bronze/25 bg-white/70 p-6 text-center text-slate-600">
              جاري تحميل البرومبتات من Supabase...
            </div>
          )}

          {error && (
            <div className="mb-8 rounded-[28px] border border-bronze/15 bg-[#fff8ef] p-5 text-sm leading-7 text-slate-700">
              {error}
            </div>
          )}

          {!loading && filteredPrompts.length === 0 && (
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-8 text-center shadow-soft">
              <h3 className="mb-2 text-xl font-semibold text-ink">
                لا توجد نتائج مطابقة
              </h3>
              <p className="text-slate-600">
                جرّب تغيير عبارة البحث أو العودة إلى تبويب "الكل".
              </p>
            </div>
          )}

          <div className="space-y-12">
            {groupedPrompts.map(({ category, prompts: categoryPrompts }) => {
              if (categoryPrompts.length === 0) {
                return null;
              }

              return (
                <section
                  key={category.slug}
                  id={`category-${category.slug}`}
                  className="scroll-mt-28"
                >
                  <div className="mb-6 flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
                        {category.name_ar}
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        {categoryPrompts.length} برومبت في هذا التصنيف
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(category.slug)}
                      className="rounded-full border border-bronze/20 bg-white/80 px-4 py-2 text-sm font-medium text-bronze transition hover:bg-bronze hover:text-white"
                    >
                      عرض التصنيف فقط
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {categoryPrompts.map((prompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        categoryName={category.name_ar}
                        isCopied={copiedId === prompt.id}
                        onCopy={handleCopy}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
