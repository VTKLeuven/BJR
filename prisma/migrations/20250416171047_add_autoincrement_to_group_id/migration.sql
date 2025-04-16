-- AlterTable
CREATE SEQUENCE group_groupnumber_seq;
ALTER TABLE "Group" ALTER COLUMN "groupNumber" SET DEFAULT nextval('group_groupnumber_seq');
ALTER SEQUENCE group_groupnumber_seq OWNED BY "Group"."groupNumber";
