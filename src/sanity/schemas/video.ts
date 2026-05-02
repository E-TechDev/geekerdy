import { defineType, defineField } from 'sanity';

export const videoSchema = defineType({
  name: 'video',
  title: 'Video',
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
      validation: Rule => Rule.required(),
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
      name: 'thumbnail',
      title: 'Thumbnail URL',
      type: 'url',
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'YouTube', value: 'YouTube' },
          { title: 'Vimeo', value: 'Vimeo' },
          { title: 'Other', value: 'Other' },
        ],
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Music Videos', value: 'music-videos' },
          { title: 'Live Performances', value: 'live-performances' },
          { title: 'Freestyles', value: 'freestyles' },
          { title: 'Behind The Scenes', value: 'behind-scenes' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'uploadDate',
      title: 'Upload Date',
      type: 'date',
      validation: Rule => Rule.required(),
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