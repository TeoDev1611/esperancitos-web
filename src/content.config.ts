import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  avisoSchema,
  negocioSchema,
  enlaceGroupSchema,
  updateSchema,
} from './lib/community-contract';

export const collections = {
  avisos: defineCollection({
    loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/avisos' }),
    schema: avisoSchema,
  }),
  negocios: defineCollection({
    loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/negocios' }),
    schema: negocioSchema,
  }),
  enlaces: defineCollection({
    loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/enlaces' }),
    schema: enlaceGroupSchema,
  }),
  update: defineCollection({
    loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/update' }),
    schema: updateSchema,
  }),
};
