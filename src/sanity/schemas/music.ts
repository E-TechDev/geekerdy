import { defineType, defineField } from 'sanity';

export const musicSchema = defineType({
  name: 'music',
  title: 'Music',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Optional duration (e.g., "3:45")',
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Album or single cover image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'url',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link URL',
      type: 'url',
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Spotify', value: 'spotify' },
          { title: 'Boomplay', value: 'boomplay' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date',
      description: 'Optional release date',
    }),
    defineField({
      name: 'latestRelease',
      title: 'Latest Release',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});