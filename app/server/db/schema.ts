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

// ─── Better Auth tables ────────────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// ─── Teacher profile (language/country collected at onboarding) ────────────

export const teacherProfiles = pgTable('teacher_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 2 }),
  country: varchar('country', { length: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Enums ─────────────────────────────────────────────────────────────────

export const connectionStatusEnum = pgEnum('connection_status', ['PENDING', 'ACCEPTED', 'REJECTED'])
export const mediaTypeEnum = pgEnum('media_type', ['TEXT', 'IMAGE', 'AUDIO'])
export const gameStateEnum = pgEnum('game_state', ['ACTIVE', 'FINISHED'])

// ─── App tables ────────────────────────────────────────────────────────────

export const classes = pgTable(
  'classes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    country: varchar('country', { length: 2 }).notNull(),
    language: varchar('language', { length: 2 }).notNull().default('fr'),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
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

// ─── Relations ─────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ one }) => ({
  profile: one(teacherProfiles, { fields: [user.id], references: [teacherProfiles.userId] }),
  class: one(classes, { fields: [user.id], references: [classes.userId] }),
}))

export const teacherProfilesRelations = relations(teacherProfiles, ({ one }) => ({
  user: one(user, { fields: [teacherProfiles.userId], references: [user.id] }),
}))

export const classesRelations = relations(classes, ({ one, many }) => ({
  user: one(user, { fields: [classes.userId], references: [user.id] }),
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
