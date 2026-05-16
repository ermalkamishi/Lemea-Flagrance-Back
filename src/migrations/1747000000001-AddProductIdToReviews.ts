import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductIdToReviews1747000000001 implements MigrationInterface {
  name = 'AddProductIdToReviews1747000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reviews" 
      ADD COLUMN IF NOT EXISTS "productId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD CONSTRAINT "FK_reviews_productId" FOREIGN KEY ("productId") 
      REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_productId"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN IF EXISTS "productId"`);
  }
}
