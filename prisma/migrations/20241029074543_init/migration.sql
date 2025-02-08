-- CreateTable
CREATE TABLE "Section" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "sectionName" TEXT NOT NULL,
    "telephone" TEXT,
    "mobileWazir" TEXT,
    "mobileDin" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL DEFAULT '0000'
);

-- CreateTable
CREATE TABLE "Party" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PartyPayment" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "partyId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PartyPayment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PartyPayment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sale" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "truckNumber" TEXT NOT NULL,
    "truckWeight" REAL NOT NULL,
    "rate" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sale_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpensePayment" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "expenseId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExpensePayment_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Labor" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Labor_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LaborPayment" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "laborId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LaborPayment_laborId_fkey" FOREIGN KEY ("laborId") REFERENCES "Labor" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LaborBill" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "laborId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LaborBill_laborId_fkey" FOREIGN KEY ("laborId") REFERENCES "Labor" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_sectionName_key" ON "Section"("sectionName");

-- CreateIndex
CREATE UNIQUE INDEX "Party_name_key" ON "Party"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_name_sectionId_key" ON "Expense"("name", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Labor_name_sectionId_key" ON "Labor"("name", "sectionId");
