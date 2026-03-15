-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO');

-- CreateEnum
CREATE TYPE "GameState" AS ENUM ('ACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "country" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacher_id" TEXT NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_connections" (
    "id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "class_requester_id" TEXT NOT NULL,
    "class_receiver_id" TEXT NOT NULL,

    CONSTRAINT "class_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "media_type" "MediaType" NOT NULL DEFAULT 'TEXT',
    "media_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hangman_games" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "hint" TEXT,
    "language" TEXT NOT NULL,
    "state" "GameState" NOT NULL DEFAULT 'ACTIVE',
    "max_wrong_guesses" INTEGER NOT NULL DEFAULT 6,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "connection_id" TEXT NOT NULL,
    "proposer_class_id" TEXT NOT NULL,
    "winner_class_id" TEXT,

    CONSTRAINT "hangman_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hangman_guesses" (
    "id" TEXT NOT NULL,
    "letter" CHAR(1) NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "game_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "hangman_guesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "classes_teacher_id_key" ON "classes"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_country_key" ON "classes"("name", "country");

-- CreateIndex
CREATE UNIQUE INDEX "class_connections_class_requester_id_class_receiver_id_key" ON "class_connections"("class_requester_id", "class_receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "hangman_guesses_game_id_letter_key" ON "hangman_guesses"("game_id", "letter");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_connections" ADD CONSTRAINT "class_connections_class_requester_id_fkey" FOREIGN KEY ("class_requester_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_connections" ADD CONSTRAINT "class_connections_class_receiver_id_fkey" FOREIGN KEY ("class_receiver_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hangman_games" ADD CONSTRAINT "hangman_games_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "class_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hangman_games" ADD CONSTRAINT "hangman_games_proposer_class_id_fkey" FOREIGN KEY ("proposer_class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hangman_guesses" ADD CONSTRAINT "hangman_guesses_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "hangman_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hangman_guesses" ADD CONSTRAINT "hangman_guesses_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
