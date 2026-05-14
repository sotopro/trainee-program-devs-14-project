-- Add course/default metadata for learning paths and link enrollments to paths.
ALTER TABLE "LearningPath" ADD COLUMN "courseId" TEXT;
ALTER TABLE "LearningPath" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Enrollment" ADD COLUMN "learningPathId" TEXT;

CREATE INDEX "LearningPath_courseId_idx" ON "LearningPath"("courseId");
CREATE INDEX "Enrollment_learningPathId_idx" ON "Enrollment"("learningPathId");

ALTER TABLE "LearningPath"
  ADD CONSTRAINT "LearningPath_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_learningPathId_fkey"
  FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE SET NULL ON UPDATE CASCADE;
