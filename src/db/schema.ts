import { mysqlTable, serial, varchar, text, boolean, timestamp, json } from 'drizzle-orm/mysql-core';

export const reports = mysqlTable('reports', {
  id: serial('id').primaryKey(),
  trackingId: varchar('tracking_id', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  date: varchar('date', { length: 50 }),
  location: varchar('location', { length: 255 }),
  organization: varchar('organization', { length: 255 }),
  status: varchar('status', { length: 50 }).default('Submitted'),
  priority: varchar('priority', { length: 20 }).default('Medium'),
  category: varchar('category', { length: 50 }),
  evidence: json('evidence'),
  isAnonymous: boolean('is_anonymous').default(false),
  reporter: varchar('reporter', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
});

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('Investigator'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
});

export const industries = mysqlTable('industries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export const departments = mysqlTable('departments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});
