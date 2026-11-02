import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, Check, Feather, Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '../../../api/client';
import { ErrorState, FeedSkeleton, NotFound } from '../../../components/common/states';
import { Button } from '../../../components/ui/button';
import { useSession } from '../../auth/hooks';
import { postsApi } from '../api';
import { usePost } from '../hooks';
import type { Post, PostValues } from '../types';

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give your post a title.')
    .max(200, 'Keep your title under 200 characters.'),
  content: z
    .string()
    .trim()
    .min(1, 'Your perspective belongs here. Write a little something.')
    .max(20000, 'Keep your post under 20,000 characters.'),
});

function EditorForm({ post }: { post?: Post }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const form = useForm<PostValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: post?.title ?? '', content: post?.content ?? '' },
  });
  const mutation = useMutation({
    mutationFn: (values: PostValues) =>
      post ? postsApi.update(post.id, values) : postsApi.create(values),
    onSuccess: async (saved) => {
      await client.invalidateQueries({ queryKey: ['posts'] });
      await client.invalidateQueries({ queryKey: ['user'] });
      client.setQueryData(['posts', 'detail', saved.id], saved);
      toast.success(
        post ? 'Your post has a fresh coat of thought.' : 'Your perspective is out in the world.',
      );
      navigate(`/posts/${saved.id}`);
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401)
        void client.invalidateQueries({ queryKey: ['session'] });
      toast.error(e.message);
    },
  });
  const title = useWatch({ control: form.control, name: 'title' });
  const content = useWatch({ control: form.control, name: 'content' });
  return (
    <form
      className="editor-card"
      noValidate
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
    >
      <div className="editor-topline">
        <span>
          <Feather size={16} />
          TEXT POST
        </span>
        <span>Your words. Your perspective.</span>
      </div>
      <div className="editor-fields">
        <div className="field">
          <div className="label-row">
            <label htmlFor="post-title">Title</label>
            <span>{title.length}/200</span>
          </div>
          <input
            className="title-input"
            id="post-title"
            placeholder="Start with a good thought…"
            maxLength={200}
            aria-invalid={!!form.formState.errors.title}
            aria-describedby="title-error"
            {...form.register('title')}
          />
          <span id="title-error" className="field-error">
            {form.formState.errors.title?.message}
          </span>
        </div>
        <div className="field">
          <div className="label-row">
            <label htmlFor="post-content">Your perspective</label>
            <span>Plain text, endless possibilities</span>
          </div>
          <textarea
            id="post-content"
            rows={12}
            placeholder="An idea. A story. Something you can’t stop thinking about. Make it yours."
            maxLength={20000}
            aria-invalid={!!form.formState.errors.content}
            aria-describedby="content-error"
            {...form.register('content')}
          />
          <span id="content-error" className="field-error">
            {form.formState.errors.content?.message}
          </span>
          <span className="field-hint content-count">
            {content.length.toLocaleString()}/20,000 characters
          </span>
        </div>
      </div>
      {mutation.error && (
        <p className="form-error editor-error" role="alert">
          {mutation.error.message}
        </p>
      )}
      <div className="editor-bottom">
        <Button
          variant="ghost"
          type="button"
          onClick={() => navigate(post ? `/posts/${post.id}` : '/')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 size={17} className="spin" />
          ) : post ? (
            <Check size={17} />
          ) : (
            <ArrowUpRight size={17} />
          )}
          {post ? 'Save changes' : 'Publish post'}
        </Button>
      </div>
    </form>
  );
}

export function EditorPage() {
  const { id } = useParams();
  const post = usePost(id);
  const { data: user } = useSession();
  if (id && post.isPending) return <FeedSkeleton />;
  if (post.error)
    return post.error instanceof ApiError && post.error.status === 404 ? (
      <NotFound />
    ) : (
      <ErrorState message={post.error.message} retry={() => void post.refetch()} />
    );
  if (id && post.data?.author.id !== user?.id)
    return <ErrorState message="Only the author can edit this post." />;
  return (
    <>
      <Link className="back-link" to={id ? `/posts/${id}` : '/'}>
        <ArrowLeft size={16} />
        {id ? 'Back to post' : 'Back to the feed'}
      </Link>
      <div className="page-heading">
        <span className="section-kicker">
          {id ? 'A FRESH COAT OF THOUGHT' : 'MAKE YOURSELF HEARD'}
        </span>
        <h1>
          {id ? 'A little refinement' : 'What’s on your mind'}
          <span>{id ? '.' : '?'}</span>
        </h1>
        <p>
          {id
            ? 'Good ideas evolve. Give yours a little room to grow.'
            : 'No perfect words needed. Just your point of view.'}
        </p>
      </div>
      <EditorForm key={id ?? 'new'} post={post.data} />
      <p className="editor-footnote">
        <Check size={14} />A thoughtful space starts with thoughtful people. Share with kindness.
      </p>
    </>
  );
}
