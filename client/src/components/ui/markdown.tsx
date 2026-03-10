import { openUrl } from "@tauri-apps/plugin-opener";
import { Info } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = "" }: MarkdownProps) {
  const [linkToConfirm, setLinkToConfirm] = useState<string | null>(null);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href?: string,
  ) => {
    // We ALWAYS prevent default to ensure the Tauri webview never actually navigates.
    e.preventDefault();

    if (!href) return;

    // Check if it's an external link (http/https)
    // Only these are allowed to be opened, and they go through the external link warning mask
    if (href.startsWith("http://") || href.startsWith("https://")) {
      setLinkToConfirm(href);
    }
  };

  const handleConfirmLink = async () => {
    if (linkToConfirm) {
      try {
        await openUrl(linkToConfirm);
      } catch (error) {
        console.error("Failed to open link:", error);
      }
      setLinkToConfirm(null);
    }
  };

  return (
    <>
      <div
        className={`prose prose-neutral dark:prose-invert prose-sm min-w-full ${className}`}
      >
        <ReactMarkdown
          // Use remarkGfm to support basic tables, tasks, etc...
          remarkPlugins={[remarkGfm]}
          // ...but manually strip out tables and task list checkboxes if desired
          disallowedElements={[
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "input",
          ]}
          components={{
            // Intercept links to look like shadcn buttons/links and handle external navigation
            a: ({ node, href, ...props }) => (
              <a
                href={href}
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => handleLinkClick(e, href)}
                {...props}
              />
            ),
            // Intercept blockquotes to give them a primary colored border
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-primary pl-3 not-italic"
                {...props}
              />
            ),
            // Intercept code to look like shadcn inline code or code blocks
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;
              if (isInline) {
                return (
                  <code
                    className="relative rounded bg-primary text-primary-foreground px-1.5 py-1 font-mono text-sm font-medium"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code
                  className="relative rounded bg-transparent p-0 font-mono text-sm text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Intercept pre to provide the shadcn card-like background
            pre: ({ node, children, ...props }) => (
              <pre
                className="overflow-x-auto rounded-lg border bg-card p-4 mt-4 mb-4"
                {...props}
              >
                {children}
              </pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <AlertDialog
        open={!!linkToConfirm}
        onOpenChange={(open) => !open && setLinkToConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>External Link Warning</AlertDialogTitle>
            <AlertDialogDescription className="break-all">
              This link will take you out of the application to an external
              website:
              <br />
              <br />
              <strong className="text-foreground">{linkToConfirm}</strong>
              <br />
              <br />
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLink}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function MarkdownGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "gap-2 shrink-0",
        })}
      >
        <Info className="h-4 w-4" />
        Formatting Help
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader tabIndex={0} className="focus:outline-none">
          <DialogTitle>Markdown Formatting Guide</DialogTitle>
          <DialogDescription>
            We support standard Markdown (GFM) to help your posts stand out!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-muted/50 border">
            <span className="font-mono text-sm text-muted-foreground">
              # H1
            </span>
            <Markdown
              content="# Heading 1"
              className="[&>h1]:!mb-0 [&>h1]:!mt-0"
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-muted/50 border">
            <span className="font-mono text-sm text-muted-foreground">
              **Bold**
            </span>
            <Markdown content="**Bold Text**" className="[&>p]:!m-0" />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-muted/50 border">
            <span className="font-mono text-sm text-muted-foreground">
              *Italic*
            </span>
            <Markdown content="*Italic Text*" className="[&>p]:!m-0" />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-muted/50 border">
            <span className="font-mono text-sm text-muted-foreground">
              ~~Strike~~
            </span>
            <Markdown content="~~Strikethrough~~" className="[&>p]:!m-0" />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-muted/50 border">
            <span className="font-mono text-sm text-muted-foreground">
              &gt; Quote
            </span>
            <Markdown
              content="> This is a blockquote. Use it to quote other players or emphasize a specific rule."
              className="[&>blockquote]:!mt-0 [&>blockquote]:!mb-0"
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-muted/50 border">
            <span className="font-mono text-sm text-muted-foreground">
              - List
            </span>
            <Markdown content="- Item 1&#10;- Item 2" className="[&>ul]:!m-0" />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-muted/50 border">
            <span className="font-mono text-sm text-muted-foreground">
              `Code`
            </span>
            <Markdown
              content="Use `inline code` for items or specific builds."
              className="[&>p]:!m-0"
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center p-3 rounded-md bg-muted/50 border">
            <span className="font-mono text-sm text-muted-foreground">
              [Link](url)
            </span>
            {/* TODO: Add a link to our website */}
            <Markdown
              content="[Clickable Link](https://example.com)"
              className="[&>p]:!m-0"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
