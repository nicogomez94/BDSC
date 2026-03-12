CREATE TABLE "site_subpages" (
  "id" SERIAL NOT NULL,
  "pageId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT,
  "content" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_subpages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_subpages_pageId_slug_key"
ON "site_subpages"("pageId", "slug");

ALTER TABLE "site_subpages"
ADD CONSTRAINT "site_subpages_pageId_fkey"
FOREIGN KEY ("pageId")
REFERENCES "site_pages"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
