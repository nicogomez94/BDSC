CREATE TABLE "virtual_library_sections" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "virtual_library_sections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "virtual_library_sections_slug_key"
ON "virtual_library_sections"("slug");

CREATE TABLE "virtual_library_categories" (
  "id" SERIAL NOT NULL,
  "sectionId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "virtual_library_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "virtual_library_categories_sectionId_slug_key"
ON "virtual_library_categories"("sectionId", "slug");

CREATE TABLE "virtual_library_videos" (
  "id" SERIAL NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "virtual_library_videos_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "virtual_library_categories"
ADD CONSTRAINT "virtual_library_categories_sectionId_fkey"
FOREIGN KEY ("sectionId")
REFERENCES "virtual_library_sections"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "virtual_library_videos"
ADD CONSTRAINT "virtual_library_videos_categoryId_fkey"
FOREIGN KEY ("categoryId")
REFERENCES "virtual_library_categories"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
