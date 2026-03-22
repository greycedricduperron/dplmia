import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const connectionStatusEnum = pgEnum('connection_status', ['PENDING', 'ACCEPTED', 'REJECTED'])
export const mediaTypeEnum = pgEnum('media_type', ['TEXT', 'IMAGE', 'AUDIO'])
export const gameStateEnum = pgEnum('game_state', ['ACTIVE', 'FINISHED'])

// Tables
export const teachers = pgTable('teachers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  language: varchar('language', { length: 2 }).notNull().default('fr'),
  country: varchar('country', { length: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const classes = pgTable(
  'classes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    country: varchar('country', { length: 2 }).notNull(),
    language: varchar('language', { length: 2 }).notNull().default('fr'),
    teacherId: uuid('teacher_id')
      .notNull()
      .unique()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    nameCountryUnique: unique().on(t.name, t.country),
  }),
)

export const classConnections = pgTable(
  'class_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    status: connectionStatusEnum('status').notNull().default('PENDING'),
    requesterId: uuid('class_requester_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    receiverId: uuid('class_receiver_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    // NOTE: No @updatedAt in Drizzle — set updatedAt: new Date() manually in every update
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    requesterReceiverUnique: unique().on(t.requesterId, t.receiverId),
  }),
)

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content'),
  mediaType: mediaTypeEnum('media_type').notNull().default('TEXT'),
  mediaUrl: text('media_url'),
  classId: uuid('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  classId: uuid('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const hangmanGames = pgTable('hangman_games', {
  id: uuid('id').primaryKey().defaultRandom(),
  word: text('word').notNull(),
  hint: text('hint'),
  language: varchar('language', { length: 2 }).notNull(),
  state: gameStateEnum('state').notNull().default('ACTIVE'),
  maxWrongGuesses: integer('max_wrong_guesses').notNull().default(6),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => classConnections.id, { onDelete: 'cascade' }),
  proposerClassId: uuid('proposer_class_id')
    .notNull()
    .references(() => classes.id),
  winnerClassId: uuid('winner_class_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
})

export const hangmanGuesses = pgTable(
  'hangman_guesses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    letter: varchar('letter', { length: 1 }).notNull(),
    correct: boolean('correct').notNull(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => hangmanGames.id, { onDelete: 'cascade' }),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    gameLetterUnique: unique().on(t.gameId, t.letter),
  }),
)

// Relations
export const teachersRelations = relations(teachers, ({ one }) => ({
  class: one(classes, { fields: [teachers.id], references: [classes.teacherId] }),
}))

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(teachers, { fields: [classes.teacherId], references: [teachers.id] }),
  sentConnections: many(classConnections, { relationName: 'requester' }),
  receivedConnections: many(classConnections, { relationName: 'receiver' }),
  posts: many(posts),
  comments: many(comments),
}))

export const classConnectionsRelations = relations(classConnections, ({ one, many }) => ({
  requester: one(classes, {
    fields: [classConnections.requesterId],
    references: [classes.id],
    relationName: 'requester',
  }),
  receiver: one(classes, {
    fields: [classConnections.receiverId],
    references: [classes.id],
    relationName: 'receiver',
  }),
  hangmanGames: many(hangmanGames),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  class: one(classes, { fields: [posts.classId], references: [classes.id] }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  class: one(classes, { fields: [comments.classId], references: [classes.id] }),
}))

export const hangmanGamesRelations = relations(hangmanGames, ({ one, many }) => ({
  connection: one(classConnections, {
    fields: [hangmanGames.connectionId],
    references: [classConnections.id],
  }),
  proposerClass: one(classes, {
    fields: [hangmanGames.proposerClassId],
    references: [classes.id],
  }),
  guesses: many(hangmanGuesses),
}))

export const hangmanGuessesRelations = relations(hangmanGuesses, ({ one }) => ({
  game: one(hangmanGames, { fields: [hangmanGuesses.gameId], references: [hangmanGames.id] }),
  class: one(classes, { fields: [hangmanGuesses.classId], references: [classes.id] }),
}))
