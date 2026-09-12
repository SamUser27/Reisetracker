-- CreateTable
CREATE TABLE "ExpensePayment" (
    "expenseId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "paidAmount" REAL NOT NULL,

    PRIMARY KEY ("expenseId", "personId"),
    CONSTRAINT "ExpensePayment_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExpensePayment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate data: existing single payer becomes one full-amount payment per expense
INSERT INTO "ExpensePayment" ("expenseId", "personId", "paidAmount")
SELECT "id", "paidById", "amount" FROM "Expense";

-- RedefineTable (drop paidById column, now replaced by ExpensePayment)
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("id", "tripId", "date", "description", "amount", "currency", "category", "createdAt")
SELECT "id", "tripId", "date", "description", "amount", "currency", "category", "createdAt" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE INDEX "Expense_tripId_idx" ON "Expense"("tripId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
