import rss from '@astrojs/rss';


const postImportResult = import.meta.globEager('./*.md');
const posts = Object.values(postImportResult);

export const get = () => rss({
    // `<title>` field in output xml
    title: 'Bün Colak’s Blog',
    // `<description>` field in output xml
    description: 'Personal website for Bün Colak. Development tips and personal opinions.',
    // base URL for RSS <item> links
    // SITE will use "site" from your project's astro.config.
    site: import.meta.env.SITE,
    // list of `<item>`s in output xml
    // simple example: generate items for every md file in /src/pages
    // see "Generating items" section for required frontmatter and advanced use cases
    items: posts.map((post) => {
        return {
            link: post.url,
            title: post.frontmatter.title,
            pubDate: post.frontmatter.releaseDate,
        }
    }),
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
});