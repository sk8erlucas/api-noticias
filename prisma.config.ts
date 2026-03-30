import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

config();

const url = process.env.DATABASE_URL as string;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url,
  },
});
