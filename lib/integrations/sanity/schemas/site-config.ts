import { defineField, defineType } from 'sanity'

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Site Configuration',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Site Name',
      type: 'string',
      description: 'Your name or site title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'A short tagline or subtitle',
    }),
    defineField({
      name: 'aboutText',
      title: 'About Text',
      type: 'text',
      rows: 5,
      description: 'A brief bio or about section',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Contact email address',
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      description: 'Link to your GitHub profile',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
      description: 'Link to your LinkedIn profile',
    }),
  ],
  preview: {
    select: {
      title: 'name',
    },
    prepare({ title }) {
      return {
        title: title || 'Site Configuration',
        subtitle: 'Global site settings',
      }
    },
  },
})
