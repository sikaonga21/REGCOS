'use client';

import { useEffect, useState } from 'react';
import { blogPlaceholderImages } from '@/lib/blog-placeholder-data';
import { uploadFileToMediaBucket } from '@/lib/supabase-upload';

type BlogPostForm = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  featured_image: string;
  featured_image_alt: string;
  featured_images: string[];
  status: 'draft' | 'published';
  is_featured: boolean;
};

const emptyForm: BlogPostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category_id: '',
  featured_image: '',
  featured_image_alt: '',
  featured_images: [],
  status: 'draft',
  is_featured: false,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [form, setForm] = useState<BlogPostForm>(emptyForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const presetImages = blogPlaceholderImages;

  const fetchPosts = async () => {
    const response = await fetch('/api/admin/blog');
    const result = await response.json();
    setPosts(result.data ?? []);
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const handleInputChange = (field: keyof BlogPostForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage(`Uploading image ${index + 1}...`);

      const publicUrl = await uploadFileToMediaBucket(file, 'blog');
      setForm((current) => {
        const nextImages = [...(current.featured_images || [])];
        nextImages[index] = publicUrl;
        while (nextImages.length < 5) nextImages.push('');
        return {
          ...current,
          featured_images: nextImages,
          featured_image: publicUrl,
        };
      });
      setMessage(`Image ${index + 1} uploaded successfully.`);
    } catch (error: any) {
      setMessage(error.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const normalizedImages = (form.featured_images || []).filter(Boolean);
    const payload = {
      ...form,
      featured_images: normalizedImages.length > 0 ? normalizedImages : (form.featured_image ? [form.featured_image] : []),
      featured_image: normalizedImages[0] || form.featured_image || 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
      featured_image_alt: form.featured_image_alt || form.title,
    };

    const url = form.id ? `/api/admin/blog/${form.id}` : '/api/admin/blog';
    const method = form.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || 'Unable to save blog post.');
      setLoading(false);
      return;
    }

    setMessage(form.id ? 'Blog post updated.' : 'Blog post created.');
    await fetchPosts();
    resetForm();
    setLoading(false);
  };

  const handleEdit = (post: any) => {
    setForm({
      id: post.id,
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category_id: post.category_id || '',
      featured_image: post.featured_image || post.featured_images?.[0] || '',
      featured_image_alt: post.featured_image_alt || '',
      featured_images: Array.isArray(post.featured_images) && post.featured_images.length > 0
        ? post.featured_images
        : (post.featured_image ? [post.featured_image] : Array(5).fill('')),
      status: post.status === 'published' ? 'published' : 'draft',
      is_featured: Boolean(post.is_featured),
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this blog post?');
    if (!confirmed) return;

    const response = await fetch(`/api/admin/blog/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      setMessage('Unable to delete blog post.');
      return;
    }

    setMessage('Blog post deleted.');
    await fetchPosts();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Content</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Blog management</h2>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">{form.id ? 'Edit blog post' : 'Create new blog post'}</h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Title</label>
                <input
                  value={form.title}
                  onChange={(event) => handleInputChange('title', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Slug</label>
                <input
                  value={form.slug}
                  onChange={(event) => handleInputChange('slug', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => handleInputChange('status', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(event) => handleInputChange('excerpt', event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Content</label>
                <textarea
                  value={form.content}
                  onChange={(event) => handleInputChange('content', event.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Featured image uploads (up to 5)</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className="rounded-xl border border-white/10 bg-slate-900 p-3">
                      <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Image {index + 1}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageUpload(event, index)}
                        className="w-full text-xs text-white file:mr-3 file:rounded file:border-0 file:bg-cyan-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                      />
                      <input
                        type="url"
                        value={form.featured_images[index] || ''}
                        onChange={(event) => {
                          const next = [...(form.featured_images || [])];
                          next[index] = event.target.value;
                          setForm((current) => ({ ...current, featured_images: next, featured_image: next.find(Boolean) || current.featured_image }));
                        }}
                        placeholder="Or paste image URL"
                        className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
                {uploading ? <p className="mt-2 text-xs text-cyan-300">Uploading image...</p> : null}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Use a placeholder</label>
                <div className="flex flex-wrap gap-2">
                  {presetImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => {
                        const next = [...(form.featured_images || [])];
                        const openIndex = next.findIndex((item) => !item);
                        const imageIndex = openIndex === -1 ? 0 : openIndex;
                        next[imageIndex] = image;
                        setForm((current) => ({ ...current, featured_images: next, featured_image: image }));
                        handleInputChange('featured_image_alt', `Placeholder image ${index + 1}`);
                      }}
                      className="h-14 w-20 overflow-hidden rounded-lg border border-white/10 bg-slate-900 p-0"
                    >
                      <img src={image} alt={`Placeholder ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Featured image URL</label>
                <input
                  value={form.featured_image}
                  onChange={(event) => handleInputChange('featured_image', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  placeholder="Primary image URL"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Image alt text</label>
                <input
                  value={form.featured_image_alt}
                  onChange={(event) => handleInputChange('featured_image_alt', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(event) => handleInputChange('is_featured', event.target.checked)}
                    className="h-4 w-4"
                  />
                  Mark as featured
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
              >
                {loading ? 'Saving...' : form.id ? 'Update post' : 'Create post'}
              </button>

              {form.id ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
          <p className="mt-4 text-xs text-slate-400">
            Uploads are saved to the Supabase media bucket. Create a public bucket named <strong>media</strong> in Supabase first.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Existing posts</h3>
          <div className="mt-5 space-y-4">
            {posts.length === 0 ? (
              <p className="text-slate-400">No blog posts yet.</p>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{post.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-300">{post.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="rounded-md border border-red-400/40 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{post.excerpt || 'No excerpt provided.'}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
