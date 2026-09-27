import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

const TagOverview: QuartzComponent = ({
  allFiles,
  fileData,
  cfg,
  displayClass,
}: QuartzComponentProps) => {
  const counts = new Map<string, number>()
  for (const page of allFiles) {
    for (const tag of page.frontmatter?.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  if (counts.size === 0) {
    return null
  }

  const tags = [...counts].sort(
    ([tagA, countA], [tagB, countB]) => countB - countA || tagA.localeCompare(tagB, cfg.locale),
  )
  return (
    <nav class={classNames(displayClass, "tag-overview")} aria-labelledby="tag-overview-title">
      <h3 id="tag-overview-title">{i18n(cfg.locale).pages.tagContent.tag}</h3>
      <ul class="tags">
        {tags.map(([tag, count]) => (
          <li>
            <a
              class="internal tag-link"
              href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
            >
              {tag}
              <span class="tag-count">{count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default (() => TagOverview) satisfies QuartzComponentConstructor
