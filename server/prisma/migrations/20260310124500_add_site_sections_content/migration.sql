CREATE TYPE "SiteSectionKey" AS ENUM ('COORDINACION', 'RECURSOS');

CREATE TABLE "site_subdivisions" (
  "id" SERIAL NOT NULL,
  "sectionKey" "SiteSectionKey" NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_subdivisions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_subdivisions_sectionKey_slug_key"
ON "site_subdivisions"("sectionKey", "slug");

CREATE TABLE "site_pages" (
  "id" SERIAL NOT NULL,
  "subdivisionId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT,
  "content" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_pages_subdivisionId_slug_key"
ON "site_pages"("subdivisionId", "slug");

ALTER TABLE "site_pages"
ADD CONSTRAINT "site_pages_subdivisionId_fkey"
FOREIGN KEY ("subdivisionId")
REFERENCES "site_subdivisions"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
