import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/eden";

export function PostsPage() {
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

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full p-8 overflow-y-auto h-full">
      <Card>
        <CardHeader>
          <CardTitle>Create a new Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LF act 1 run"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="content">Description</Label>
                <Textarea
                  id="content"
                  className="min-h-[100px] resize-y"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide details about your party request..."
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <Button type="submit" disabled={createPost.isPending}>
                {createPost.isPending ? "Posting..." : "Create Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center py-16 px-8 text-muted-foreground border rounded-xl bg-card border-dashed">
            Loading posts...
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-16 px-8 text-muted-foreground border rounded-xl bg-card border-dashed">
            No posts yet. Be the first to create one!
          </div>
        ) : (
          posts?.map(
            (post: {
              id: string | number;
              title: string;
              content: string;
              createdAt: string | Date;
            }) => (
              <Card
                key={post.id}
                className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>
                    Posted on {new Date(post.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-card-foreground">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            ),
          )
        )}
      </div>
    </div>
  );
}
