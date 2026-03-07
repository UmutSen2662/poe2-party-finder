import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Markdown, MarkdownGuideDialog } from "@/components/ui/markdown";
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
                className="flex-1 min-h-0 mt-0 overflow-y-auto rounded-md border bg-white dark:bg-black p-4 prose prose-neutral dark:prose-invert prose-sm min-w-full"
              >
                {markdown ? (
                  <Markdown content={markdown} />
                ) : (
                  <p className="text-muted-foreground italic mt-0">
                    Nothing to preview yet...
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* The Instructions/Preview Area (Now a Dialog) */}
        <div className="flex flex-col gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">
                Need help with Markdown?
              </CardTitle>
              <CardDescription>
                We now have a reusable modal perfect for any text editor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownGuideDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
