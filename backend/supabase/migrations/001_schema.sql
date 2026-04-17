-- ═══════════════════════════════════════════════════════════════
-- 0001 — Enable pgvector
-- ═══════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 0002 — Interviews table
-- (candidates are handled by Supabase Auth — auth.users)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS interviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  resume_url    TEXT,
  resume_highlights TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'completed')),
  overall_score NUMERIC(5,2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX idx_interviews_status    ON interviews(status);

-- ═══════════════════════════════════════════════════════════════
-- 0003 — Questions table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id  UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_index   INTEGER NOT NULL,
  topic         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_interview ON questions(interview_id);

-- ═══════════════════════════════════════════════════════════════
-- 0004 — Evaluations table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS evaluations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id           UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  interview_id          UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  answer_text           TEXT NOT NULL,
  score                 NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  feedback              TEXT NOT NULL,
  criteria_scores       JSONB,
  competency_assessment JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evaluations_interview ON evaluations(interview_id);
CREATE INDEX idx_evaluations_question  ON evaluations(question_id);

-- ═══════════════════════════════════════════════════════════════
-- 0005 — Audio recordings table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audio_recordings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_id  UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  file_url     TEXT NOT NULL,
  transcript   TEXT,
  confidence   NUMERIC(4,3),
  sentiment    TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audio_interview ON audio_recordings(interview_id);

-- ═══════════════════════════════════════════════════════════════
-- 0006 — RAG: resume chunks
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS resume_chunks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'other'
                 CHECK (section_type IN ('experience','skills','education','projects','summary','other')),
  metadata     JSONB DEFAULT '{}',
  embedding    vector(1536),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resume_chunks_interview ON resume_chunks(interview_id);
CREATE INDEX idx_resume_chunks_embedding ON resume_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════
-- 0007 — RAG: JD chunks
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS jd_chunks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id     UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  content          TEXT NOT NULL,
  requirement_type TEXT NOT NULL DEFAULT 'other'
                     CHECK (requirement_type IN ('required','preferred','responsibility','other')),
  metadata         JSONB DEFAULT '{}',
  embedding        vector(1536),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jd_chunks_interview ON jd_chunks(interview_id);
CREATE INDEX idx_jd_chunks_embedding ON jd_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════
-- 0008 — RAG: question bank
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS question_bank (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  domain        TEXT NOT NULL,
  difficulty    TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  competency    TEXT NOT NULL,
  embedding     vector(1536),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_bank_embedding ON question_bank USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════
-- 0009 — RAG: rubrics
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rubrics (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competency   TEXT NOT NULL,
  criteria     TEXT NOT NULL,
  scoring_guide TEXT NOT NULL,
  embedding    vector(1536),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rubrics_embedding ON rubrics USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════
-- 0010 — RAG: interview turns (for conversation history RAG)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS interview_turns (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id  UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text   TEXT NOT NULL,
  score         NUMERIC(5,2),
  embedding     vector(1536),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_turns_interview ON interview_turns(interview_id);
CREATE INDEX idx_turns_embedding ON interview_turns USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════
-- 0011 — pgvector similarity search RPCs
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION match_resume_chunks(
  query_embedding    vector(1536),
  match_interview_id UUID,
  match_count        INT DEFAULT 4
)
RETURNS TABLE (
  id           UUID,
  content      TEXT,
  section_type TEXT,
  metadata     JSONB,
  similarity   FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT id, content, section_type, metadata,
         1 - (embedding <=> query_embedding) AS similarity
  FROM   resume_chunks
  WHERE  interview_id = match_interview_id
    AND  embedding IS NOT NULL
  ORDER  BY embedding <=> query_embedding
  LIMIT  match_count;
$$;

CREATE OR REPLACE FUNCTION match_jd_chunks(
  query_embedding    vector(1536),
  match_interview_id UUID,
  match_count        INT DEFAULT 4
)
RETURNS TABLE (
  id               UUID,
  content          TEXT,
  requirement_type TEXT,
  metadata         JSONB,
  similarity       FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT id, content, requirement_type, metadata,
         1 - (embedding <=> query_embedding) AS similarity
  FROM   jd_chunks
  WHERE  interview_id = match_interview_id
    AND  embedding IS NOT NULL
  ORDER  BY embedding <=> query_embedding
  LIMIT  match_count;
$$;

CREATE OR REPLACE FUNCTION match_question_bank(
  query_embedding vector(1536),
  match_count     INT DEFAULT 5
)
RETURNS TABLE (
  id            UUID,
  question_text TEXT,
  domain        TEXT,
  difficulty    TEXT,
  competency    TEXT,
  similarity    FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT id, question_text, domain, difficulty, competency,
         1 - (embedding <=> query_embedding) AS similarity
  FROM   question_bank
  WHERE  embedding IS NOT NULL
  ORDER  BY embedding <=> query_embedding
  LIMIT  match_count;
$$;

CREATE OR REPLACE FUNCTION match_rubric(
  query_embedding vector(1536),
  match_count     INT DEFAULT 1
)
RETURNS TABLE (
  id            UUID,
  competency    TEXT,
  criteria      TEXT,
  scoring_guide TEXT,
  similarity    FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT id, competency, criteria, scoring_guide,
         1 - (embedding <=> query_embedding) AS similarity
  FROM   rubrics
  WHERE  embedding IS NOT NULL
  ORDER  BY embedding <=> query_embedding
  LIMIT  match_count;
$$;

CREATE OR REPLACE FUNCTION match_interview_turns(
  query_embedding    vector(1536),
  match_interview_id UUID,
  match_count        INT DEFAULT 3
)
RETURNS TABLE (
  id            UUID,
  question_text TEXT,
  answer_text   TEXT,
  score         NUMERIC,
  similarity    FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT id, question_text, answer_text, score,
         1 - (embedding <=> query_embedding) AS similarity
  FROM   interview_turns
  WHERE  interview_id = match_interview_id
    AND  embedding IS NOT NULL
  ORDER  BY embedding <=> query_embedding
  LIMIT  match_count;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 0012 — Row Level Security
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE interviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_recordings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_chunks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_chunks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_turns   ENABLE ROW LEVEL SECURITY;

-- Interviews: users see only their own
CREATE POLICY "interviews_own" ON interviews
  FOR ALL USING (candidate_id = auth.uid());

-- Questions: users see only questions for their own interviews
CREATE POLICY "questions_own" ON questions
  FOR ALL USING (
    interview_id IN (SELECT id FROM interviews WHERE candidate_id = auth.uid())
  );

-- Evaluations: same pattern
CREATE POLICY "evaluations_own" ON evaluations
  FOR ALL USING (
    interview_id IN (SELECT id FROM interviews WHERE candidate_id = auth.uid())
  );

-- Audio: same pattern
CREATE POLICY "audio_own" ON audio_recordings
  FOR ALL USING (
    interview_id IN (SELECT id FROM interviews WHERE candidate_id = auth.uid())
  );

-- Resume chunks
CREATE POLICY "resume_chunks_own" ON resume_chunks
  FOR ALL USING (candidate_id = auth.uid());

-- JD chunks
CREATE POLICY "jd_chunks_own" ON jd_chunks
  FOR ALL USING (
    interview_id IN (SELECT id FROM interviews WHERE candidate_id = auth.uid())
  );

-- Interview turns
CREATE POLICY "turns_own" ON interview_turns
  FOR ALL USING (
    interview_id IN (SELECT id FROM interviews WHERE candidate_id = auth.uid())
  );

-- question_bank and rubrics are public read
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "question_bank_read" ON question_bank FOR SELECT USING (true);
CREATE POLICY "rubrics_read"       ON rubrics       FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 0013 — Storage buckets (run in Supabase dashboard or CLI)
-- ═══════════════════════════════════════════════════════════════
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', false);

-- updated_at auto-trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();