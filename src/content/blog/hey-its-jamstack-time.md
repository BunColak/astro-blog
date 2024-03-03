---
tags: ["sanity","graphql","cms"]
title: Hey, it's Jamstack time
description: I made this blog with Gatsby on February (Edit 2021, not anymore). I though 2020 would be a good year, I would write more and have a healthier life...
pubDatetime: 2020-10-25
---
I made this blog with Gatsby on February (Edit 2021, not anymore). I though 2020 would be a good year, I would write more and have a healthier life. Well jump to October: I don't need to explain 2020 and I gained much more weight that I would like to admit. Oh no, anyway. This blog used to be just markdown files, parsed with Gatsby and served with Vercel. I decided maybe it is time to switch to some CMS. I am planning to add some portfolio here, so a CMS would make content management easier.

When you think about CMS, especially for free it is Wordpress. It is feature rich, has probably one of the biggest community behind it as well. But, I don't need that feature richness. I just want a fast website with some custom data types to my need. Enter Jamstack.

## What is Jamstack?
Jamstack is Javascript, Api, Markup stack. Basically you have your data as markup or a similar way, serve it with APIs and prerender during build time to have static-ish websites. My blog was already in Jamstack. I had my posts in markdown and with some transformers I had fed them to Gatsby. Then it was compiled into HTML files which I had served them over CDN. So I just need to slap a CMS into it.

## Sanity.io
I chose [Sanity.io](sanity.io) for my CMS needs. There was two main reasons for it:

+ Free tier is super flexible and have a really generous data quotas. 
+ Support for custom fields and it being code based helps extensibility.

Installation is really simple. Just installed the CLI explained in their website and created a project. I just have 2 schemas right now: Blog Post and Tags. Defining them is similar how you would do it with Sequelize:
````
export default {
    title: 'Blog Post',
    name: 'blogPost',
    type: 'document',
    fields: [
        {
            title: 'Title',
            name: 'title',
            type: 'string',
            validation: Rule => Rule.required()
        },
        {
            title: 'Slug',
            name: 'slug',
            type: 'slug',
            options: {
                source: 'title'
            }
        },
        {
            title: 'Content',
            name: 'content',
            type: 'markdown',
            validation: Rule => Rule.required()
        },
        {
            title: 'Tags',
            name: 'tags',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{type: 'tag'}]
            }]
        },
        {
            title: 'Release Date',
            name: 'releaseDate',
            type: 'date'
        }
    ]
}
````

After defining the schemas, I just deployed my CMS to Sanity with a single command. Also deployed the GraphQL api as well with an additional command and it was done. Neat! Obviously I had to change how this blog would fetch its data, but it merely took 30 minutes. 

Now the trick. You need something on your frontend to trigger a new build when you publish/update/delete something on your CMS. Thankfully, every CI/CD provider supports **webhooks** to trigger builds. I just created a webhook with Sanity CLI and added to my Vercel build triggers. So whenever I do something on my CMS, it does a new build.

I am planning to update this website with some portfolio items, therefore this CMS change was really helpful. I may do some extensive work to prove its use even more. 

Fun times. :)