import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "Giant's Blog",
    pageTitleSuffix: " | Giant's Blog",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: null,
    },
    locale: "zh-CN",
    baseUrl: "blog.giantgkl.xyz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Playfair Display",
        body: "Inter",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#FDFBF7",
          lightgray: "#EDE8DE",
          gray: "#B0A99C",
          darkgray: "#5C5548",
          dark: "#1A1712",
          secondary: "#D97706",
          tertiary: "#B45309",
          highlight: "rgba(217, 119, 6, 0.06)",
          textHighlight: "#FDE68A40",
        },
        darkMode: {
          light: "#0F0D0A",
          lightgray: "#26231E",
          gray: "#787165",
          darkgray: "#D6D0C5",
          dark: "#FDFBF7",
          secondary: "#F59E0B",
          tertiary: "#D97706",
          highlight: "rgba(245, 158, 11, 0.06)",
          textHighlight: "#F59E0B20",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
