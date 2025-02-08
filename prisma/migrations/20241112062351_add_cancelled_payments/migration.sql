-- CreateTable
CREATE TABLE "PartyCancelledPayment" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "partyId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PartyCancelledPayment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PartyCancelledPayment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
