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
      description: 'Optional duration (e.g., "5:30")',
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
      name: 'caption',
      title: 'Caption',
      type: 'text',
      description: 'Optional caption to display below the video',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      description: 'Video thumbnail image',
      options: {
        hotspot: true,
      },
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
      description: 'Optional upload date',
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