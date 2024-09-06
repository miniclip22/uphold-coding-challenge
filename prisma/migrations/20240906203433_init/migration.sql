-- CreateTable
CREATE TABLE "BotConfig" (
    "id" SERIAL NOT NULL,
    "currencyPairs" TEXT[],
    "fetchInterval" INTEGER NOT NULL,
    "alertThreshold" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BotConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interval" (
    "id" SERIAL NOT NULL,
    "intervalId" INTEGER NOT NULL,
    "botConfigId" INTEGER NOT NULL,

    CONSTRAINT "Interval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "pair" TEXT NOT NULL,
    "rateChange" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botConfigId" INTEGER NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "BotConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "BotConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
