import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const leads=sqliteTable('workbook_leads',{
 id:text('id').primaryKey(),name:text('name').notNull(),telegram:text('telegram').notNull(),sphere:text('sphere').notNull().default(''),createdAt:integer('created_at').notNull(),consentVersion:text('consent_version').notNull(),tokenHash:text('token_hash').notNull(),expiresAt:integer('expires_at').notNull(),
},t=>[index('workbook_leads_token').on(t.tokenHash),index('workbook_leads_date').on(t.createdAt)]);
