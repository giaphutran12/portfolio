import { groq } from 'next-sanity'

// Helper for rich text content with link projections
const richTextWithLinks = `
  content[]{
    ...,
    markDefs[]{
      ...,
      _type == "link" => {
        ...,
        internalLink->{_type, slug, title}
      }
    }
  }
`

const linkWithLabel = `
  link {
    ...,
    internalLink->{_type, slug, title}
  }
`

// Page queries
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    ${richTextWithLinks},
    ${linkWithLabel},
    metadata,
    publishedAt,
    _updatedAt
  }
`

export const pageByIdQuery = groq`
  *[_type == "page" && _id == $id][0] {
    _id,
    title,
    slug,
    ${richTextWithLinks},
    metadata,
    publishedAt,
    _updatedAt
  }
`

// Article queries
export const articleQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    ${richTextWithLinks},
    categories,
    tags,
    author,
    publishedAt,
    metadata,
    _updatedAt
  }
`

export const allArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    categories,
    tags,
    author,
    publishedAt,
    metadata,
    _updatedAt
  }
`

export const articleByIdQuery = groq`
  *[_type == "article" && _id == $id][0] {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    ${richTextWithLinks},
    categories,
    tags,
    author,
    publishedAt,
    metadata,
    _updatedAt
  }
`

// Project queries
export const allProjectsQuery = groq`
  *[_type == "project"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    techStack,
    image,
    liveUrl,
    githubUrl,
    order,
    _updatedAt
  }
`

export const projectQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    techStack,
    image,
    liveUrl,
    githubUrl,
    order,
    _updatedAt
  }
`

export const projectByIdQuery = groq`
  *[_type == "project" && _id == $id][0] {
    _id,
    title,
    slug,
    description,
    techStack,
    image,
    liveUrl,
    githubUrl,
    order,
    _updatedAt
  }
`

// Experience queries
export const allExperienceQuery = groq`
  *[_type == "experience"] | order(startDate desc) {
    _id,
    company,
    role,
    startDate,
    endDate,
    current,
    description,
    _updatedAt
  }
`

export const experienceByIdQuery = groq`
  *[_type == "experience" && _id == $id][0] {
    _id,
    company,
    role,
    startDate,
    endDate,
    current,
    description,
    _updatedAt
  }
`

// Site Config query
export const siteConfigQuery = groq`
  *[_type == "siteConfig"][0] {
    _id,
    name,
    tagline,
    aboutText,
    email,
    githubUrl,
    linkedinUrl,
    _updatedAt
  }
`
