import { toString } from "hast-util-to-string"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import { getDate } from "./Date"
import { unescapeHTML } from "../util/escape"
import { classNames } from "../util/lang"

interface Options {
  /** Heading shown above the list; omitted when empty */
  title?: string
  /** Maximum number of characters quoted from each article */
  excerptLength: number
}

const defaultOptions: Options = {
  excerptLength: 120,
}

function isArticle(page: QuartzPluginData): boolean {
  const slug = page.slug ?? ""
  return slug !== "index" && !slug.endsWith("/index") && !slug.startsWith("tags/")
}

function truncate(text: string, maxLength: number): string {
  const chars = Array.from(text)
  return chars.length > maxLength ? chars.slice(0, maxLength).join("").trimEnd() + "…" : text
}

// Quote the article's own opening paragraphs (or its frontmatter description)
// so the list never shows a summary that the author did not write.
function excerpt(page: QuartzPluginData, maxLength: number): string {
  const own = page.frontmatter?.description
  if (own) return truncate(own, maxLength)

  const paragraphs: string[] = []
  let length = 0
  for (const node of page.htmlAst?.children ?? []) {
    if (node.type !== "element" || node.tagName !== "p") continue
    const text = toString(node).replace(/\s+/g, " ").trim()
    if (!text) continue
    paragraphs.push(text)
    length += text.length
    if (length >= maxLength) break
  }

  // paragraphs ending in full-width punctuation run straight into the next one
  const joined = paragraphs.reduce(
    (text, paragraph) =>
      text === "" || /[。！？：；…）」』”]$/.test(text) ? text + paragraph : `${text} ${paragraph}`,
    "",
  )
  const text = joined || unescapeHTML(page.description ?? "")
  return truncate(text, maxLength)
}

const monthDay = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

export default ((userOpts?: Partial<Options>) => {
  const opts: Options = { ...defaultOptions, ...userOpts }

  const ArticleList: QuartzComponent = ({
    allFiles,
    fileData,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const pages = allFiles.filter(isArticle).sort(byDateAndAlphabetical(cfg))

    // pages are sorted newest first, so each year forms one contiguous run
    const years: { year: string; pages: QuartzPluginData[] }[] = []
    for (const page of pages) {
      const date = getDate(cfg, page)
      const year = date ? String(date.getFullYear()) : ""
      const current = years.at(-1)
      if (current && current.year === year) {
        current.pages.push(page)
      } else {
        years.push({ year, pages: [page] })
      }
    }

    return (
      <section
        class={classNames(displayClass, "article-list")}
        aria-labelledby={opts.title ? "article-list-title" : undefined}
      >
        {opts.title && (
          <h2 id="article-list-title" class="article-list-title">
            {opts.title}
            <span class="article-list-count">{pages.length}</span>
          </h2>
        )}
        {years.map(({ year, pages }) => (
          <section class="article-list-year">
            {year && <h3 class="article-list-year-label">{year}</h3>}
            <ol class="article-list-items">
              {pages.map((page) => {
                const date = getDate(cfg, page)
                const summary = excerpt(page, opts.excerptLength)
                const tags = page.frontmatter?.tags ?? []
                return (
                  <li class="article-list-item">
                    {date && (
                      <time class="article-list-date" datetime={date.toISOString()}>
                        {monthDay(date)}
                      </time>
                    )}
                    <div class="article-list-body">
                      <h4 class="article-list-item-title">
                        <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                          {page.frontmatter?.title}
                        </a>
                      </h4>
                      {summary && <p class="article-list-excerpt">{summary}</p>}
                      {tags.length > 0 && (
                        <ul class="tags">
                          {tags.map((tag) => (
                            <li>
                              <a
                                class="internal tag-link"
                                href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                              >
                                {tag}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </section>
    )
  }

  return ArticleList
}) satisfies QuartzComponentConstructor
