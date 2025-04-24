export type sitemapItemType = {
  external?: boolean
  title: string
}

export type sitemapType = {
  items: sitemapItemType[]
  title: string
}

export const sitemap: sitemapType[] = [
  {
    title: 'Getting started',
    items: [{ title: 'Installation' }, { title: 'Themes' }],
  },
  {
    title: 'Components',
    items: [
      { title: 'Avatar' },
      { title: 'Banner' },
      { title: 'Button' },
      { title: 'Card' },
      { title: 'DB Card' },
      { title: 'Dropdown' },
      { title: 'Input' },
      { title: 'Interface' },
      { title: 'Label' },
      { title: 'Loader' },
      { title: 'Menu Bar' },
      { title: 'Select' },
      { title: 'Slot' },
      { title: 'Toggle' },
    ],
  },
]
