import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string(),
    tags: z.array(z.string()),
    heroImage: z.string().optional(),
  }),
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    client: z.string(),
    industry: z.string(),
    challenge: z.string(),
    solution: z.string(),
    results: z.array(z.string()),
    technologies: z.array(z.string()),
    heroImage: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

const liveDemos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    complexity: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    duration: z.string(),
    features: z.array(z.string()),
    demoUrl: z.string(),
    videoUrl: z.string(),
    screenshot: z.string(),
    featured: z.boolean().optional(),
    interactive: z.boolean(),
    technologies: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, caseStudies, liveDemos };