import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config();

const url = process.env.DATABASE_URL as string;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url,
  },
  migrate: {
    async adapter() {
      return new PrismaPg({ connectionString: url });
    },
  },
});
