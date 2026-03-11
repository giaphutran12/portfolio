import { defineField, defineType } from 'sanity'

export const experience = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      description: 'Name of the company',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Job title or role',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      description: 'When you started this role',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      description: 'When you ended this role (leave empty if current)',
    }),
    defineField({
      name: 'current',
      title: 'Currently Working Here',
      type: 'boolean',
      description: 'Is this your current role?',
      initialValue: false,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      description: 'Details about your responsibilities and achievements',
    }),
  ],
  preview: {
    select: {
      company: 'company',
      role: 'role',
      current: 'current',
    },
    prepare({ company, role, current }) {
      return {
        title: role || 'Untitled',
        subtitle: company
          ? `${company}${current ? ' (Current)' : ''}`
          : 'No company',
      }
    },
  },
  orderings: [
    {
      title: 'Start Date, Recent',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
    {
      title: 'Start Date, Oldest',
      name: 'startDateAsc',
      by: [{ field: 'startDate', direction: 'asc' }],
    },
  ],
})
