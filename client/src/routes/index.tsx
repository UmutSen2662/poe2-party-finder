import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "../lib/eden";

export const Route = createFileRoute("/")({
  component: PostsBoard,
});

function PostsBoard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const {
    data: posts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await api.posts.get();
      if (error) throw error;
      return data;
    },
  });

  const createPost = useMutation({
    mutationFn: async (newPost: { title: string; content: string }) => {
      const { data, error } = await api.posts.post(newPost);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setTitle("");
      setContent("");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    createPost.mutate({ title, content });
  };

  const inputClasses =
    "bg-slate-900 border border-slate-700 text-slate-50 rounded-lg px-4 py-3 text-base font-sans transition-all duration-200 outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-500/20";

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-lg">
        <h2 className="mt-0 mb-6 text-xl text-slate-50">Create a new Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 mb-4">
            <label
              htmlFor="title"
              className="text-sm font-medium text-slate-400"
            >
              Title
            </label>
            <input
              id="title"
              className={inputClasses}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LF act 1 run"
              required
            />
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <label
              htmlFor="content"
              className="text-sm font-medium text-slate-400"
            >
              Description
            </label>
            <textarea
              id="content"
              className={`${inputClasses} min-h-[100px] resize-y`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide details about your party request..."
              required
            />
          </div>
          <button
            type="submit"
            className="bg-sky-500 text-white border-none rounded-lg px-6 py-3 text-base font-semibold cursor-pointer transition-all duration-200 inline-flex items-center justify-center hover:bg-sky-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={createPost.isPending}
          >
            {createPost.isPending ? "Posting..." : "Create Post"}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center py-16 px-8 text-slate-400 bg-slate-800 rounded-xl border border-dashed border-slate-700">
            Loading posts...
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-16 px-8 text-slate-400 bg-slate-800 rounded-xl border border-dashed border-slate-700">
            No posts yet. Be the first to create one!
          </div>
        ) : (
          posts?.map((post) => (
            <div
              key={post.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-sky-500"
            >
              <h3 className="m-0 mb-2 text-xl text-slate-50">{post.title}</h3>
              <div className="text-xs text-slate-400 mb-4">
                Posted on {new Date(post.createdAt).toLocaleString()}
              </div>
              <p className="m-0 text-slate-300 leading-relaxed">
                {post.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
