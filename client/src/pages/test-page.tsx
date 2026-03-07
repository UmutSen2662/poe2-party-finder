import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function TestPage() {
  const [markdown, setMarkdown] = useState("");

  return (
    <div className="flex flex-col h-full w-full gap-6 p-6 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Playground</h1>
        <p className="text-muted-foreground mt-2">
          Test out components and features here. Currently testing the "Raw
          Markdown" text editor experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* The Editor & Preview Area */}
        <Card>
          <CardHeader>
            <CardTitle>Post Description</CardTitle>
            <CardDescription>Describe your party requirements.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit">
                <Textarea
                  placeholder="e.g. LF1M **DPS** for *Vaal Temple* mapping. Must have 4.5+ rating."
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                />
              </TabsContent>

              <TabsContent
                value="preview"
                className="flex-1 min-h-0 mt-0 overflow-y-auto rounded-md border bg-muted/30 p-4 prose prose-neutral dark:prose-invert prose-sm min-w-full"
              >
                {markdown ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdown}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic mt-0">
                    Nothing to preview yet...
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* The Instructions/Preview Area */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Markdown Formatting Guide</CardTitle>
            <CardDescription>
              We support standard Discord/Reddit style Markdown to help your
              posts stand out!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-background border">
                <span className="font-mono text-sm text-muted-foreground">
                  **Bold**
                </span>
                <span className="font-bold">Bold Text</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-background border">
                <span className="font-mono text-sm text-muted-foreground">
                  *Italic*
                </span>
                <span className="italic">Italic Text</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-background border">
                <span className="font-mono text-sm text-muted-foreground">
                  __Underline__
                </span>
                <span className="underline">Underlined Text</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-background border">
                <span className="font-mono text-sm text-muted-foreground">
                  ~~Strike~~
                </span>
                <span className="line-through">Strikethrough</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 items-start p-3 rounded-md bg-background border">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-sm text-muted-foreground">
                    &gt; Quote
                  </span>
                </div>
                <div className="border-l-4 border-primary pl-4 py-1 text-muted-foreground italic">
                  This is a blockquote. Use it to quote other players or
                  emphasize a specific rule.
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-background border">
                <span className="font-mono text-sm text-muted-foreground">
                  `Code`
                </span>
                <span>
                  Use{" "}
                  <code className="bg-muted px-[0.3rem] py-[0.2rem] rounded text-sm font-mono text-foreground font-semibold">
                    inline code
                  </code>{" "}
                  for items or specific builds.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
