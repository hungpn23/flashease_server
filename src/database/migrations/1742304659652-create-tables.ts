import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1742304659652 implements MigrationInterface {
  name = 'CreateTables1742304659652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "card" (
                "id" SERIAL NOT NULL,
                "term" character varying NOT NULL,
                "definition" character varying NOT NULL,
                "correct_count" integer,
                "set_id" integer,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_by" character varying,
                CONSTRAINT "PK_card_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "session" (
                "id" SERIAL NOT NULL,
                "signature" character varying NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "user_id" integer,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_by" character varying,
                CONSTRAINT "PK_session_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "is_email_verified" boolean NOT NULL DEFAULT false,
                "password" character varying,
                "bio" text,
                "avatar" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_by" character varying,
                CONSTRAINT "UQ_user_username" UNIQUE ("username"),
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."set_visible_to_enum" AS ENUM('everyone', 'just me', 'people with a passcode')
        `);
    await queryRunner.query(`
            CREATE TABLE "set" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "author" character varying NOT NULL,
                "visible_to" "public"."set_visible_to_enum" NOT NULL DEFAULT 'just me',
                "passcode" character varying,
                "folder_id" integer,
                "user_id" integer,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_by" character varying,
                CONSTRAINT "PK_set_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "folder" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_by" character varying,
                CONSTRAINT "PK_folder_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "card"
            ADD CONSTRAINT "FK_card_set_id_set_id" FOREIGN KEY ("set_id") REFERENCES "set"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "FK_session_user_id_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "set"
            ADD CONSTRAINT "FK_set_folder_id_folder_id" FOREIGN KEY ("folder_id") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "set"
            ADD CONSTRAINT "FK_set_user_id_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "set" DROP CONSTRAINT "FK_set_user_id_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "set" DROP CONSTRAINT "FK_set_folder_id_folder_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "FK_session_user_id_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "card" DROP CONSTRAINT "FK_card_set_id_set_id"
        `);
    await queryRunner.query(`
            DROP TABLE "folder"
        `);
    await queryRunner.query(`
            DROP TABLE "set"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."set_visible_to_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "session"
        `);
    await queryRunner.query(`
            DROP TABLE "card"
        `);
  }
}
