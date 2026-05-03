import { defineType, defineField } from 'sanity';

export const eventSchema = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date & Time',
      type: 'datetime',
      description: 'Optional event date and time',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Event details and description',
    }),
    defineField({
      name: 'ticketLink',
      title: 'Ticket Link',
      type: 'url',
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      description: 'Event banner or thumbnail image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'mediaUrl',
      title: 'Media URL (YouTube, Instagram, TikTok, Facebook)',
      type: 'url',
      description: 'Link to external media (YouTube, Instagram, etc.)',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});