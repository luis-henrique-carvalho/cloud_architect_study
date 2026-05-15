import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { getStudyResourceHref } from "@/lib/utils";
import { cn } from "@/lib/utils";

type MarkdownRendererProps = {
  content: string;
  moduleSlug?: string;
  className?: string;
};

export function MarkdownRenderer({
  content,
  moduleSlug,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "flex max-w-none flex-col gap-5 text-sm leading-7 text-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ href = "", children, ...props }) => {
            const resolvedHref = resolveContentHref(href, moduleSlug);
            const external = isExternalHref(resolvedHref);

            return (
              <a
                className="font-medium text-primary underline underline-offset-4"
                href={resolvedHref}
                rel={external ? "noreferrer" : undefined}
                target={external ? "_blank" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="rounded-md border bg-muted/40 px-4 py-3 text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => (
            <code
              className={cn(
                "rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]",
                className,
              )}
            >
              {children}
            </code>
          ),
          details: ({ children }) => (
            <details className="rounded-md border bg-card p-4 open:flex open:flex-col open:gap-3">
              {children}
            </details>
          ),
          h1: ({ children }) => (
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="pt-4 text-2xl font-semibold leading-tight tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="pt-2 text-xl font-semibold leading-tight">
              {children}
            </h3>
          ),
          hr: () => <div className="h-px bg-border" />,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          ol: ({ children }) => (
            <ol className="flex list-decimal flex-col gap-2 pl-6">
              {children}
            </ol>
          ),
          p: ({ children }) => (
            <p className="text-pretty text-muted-foreground">{children}</p>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm leading-6">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          summary: ({ children }) => (
            <summary className="cursor-pointer font-medium text-foreground">
              {children}
            </summary>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          td: ({ children }) => (
            <td className="border-t px-3 py-2 align-top">{children}</td>
          ),
          th: ({ children }) => (
            <th className="bg-muted px-3 py-2 font-medium">{children}</th>
          ),
          ul: ({ children }) => (
            <ul className="flex list-disc flex-col gap-2 pl-6">{children}</ul>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function resolveContentHref(href: string, moduleSlug?: string) {
  if (!moduleSlug || isExternalHref(href) || href.startsWith("#")) {
    return href;
  }

  if (href.endsWith(".md") && !href.includes("/")) {
    const resourceKey = href.replace(/\.md$/, "");

    return getStudyResourceHref(moduleSlug, resourceKey);
  }

  return href;
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}
