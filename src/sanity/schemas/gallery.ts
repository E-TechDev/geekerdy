import { defineType, defineField } from 'sanity';

export const gallerySchema = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Upload an image from your device',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'link',
      title: 'External Media Link',
      type: 'url',
      description: 'YouTube, Instagram, TikTok, Facebook, or other media links',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
    }),
    defineField({
      name: 'uploadDate',
      title: 'Upload Date',
      type: 'date',
      description: 'Optional upload date',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});