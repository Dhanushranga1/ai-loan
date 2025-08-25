-- AI Loan Approval System Database Schema
-- Phase 2: Supabase Auth & Schema

-- Enable RLS (Row Level Security) for all tables
alter table auth.users add column if not exists raw_app_meta_data jsonb;
alter table auth.users add column if not exists raw_user_meta_data jsonb;

-- Create custom types
create type user_role as enum ('user', 'admin');
create type loan_status as enum ('pending', 'approved', 'rejected', 'under_review');
create type application_status as enum ('draft', 'submitted', 'processing', 'completed', 'cancelled');

-- Users table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  date_of_birth date,
  role user_role default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Profiles RLS policies
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Loan applications table
create table if not exists loan_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Loan details
  amount decimal(12,2) not null check (amount > 0),
  tenure_months integer not null check (tenure_months > 0),
  purpose text not null,

  -- Applicant details
  monthly_income decimal(10,2) not null check (monthly_income > 0),
  existing_debts decimal(10,2) default 0 check (existing_debts >= 0),
  credit_score integer check (credit_score >= 300 and credit_score <= 900),
  employment_type text not null,
  employment_years decimal(3,1) check (employment_years >= 0),

  -- Application status
  status application_status default 'draft',

  -- AI Decision
  ai_decision loan_status,
  ai_confidence decimal(3,2) check (ai_confidence >= 0 and ai_confidence <= 1),
  ai_reasoning text,

  -- EMI and DTI calculations
  calculated_emi decimal(10,2),
  debt_to_income_ratio decimal(5,2),

  -- Admin override
  admin_decision loan_status,
  admin_notes text,
  admin_user_id uuid references auth.users(id),

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  submitted_at timestamp with time zone,
  decided_at timestamp with time zone
);

-- Enable RLS on loan_applications
alter table loan_applications enable row level security;

-- Loan applications RLS policies
create policy "Users can view their own applications" on loan_applications
  for select using (auth.uid() = user_id);

create policy "Users can create their own applications" on loan_applications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own draft applications" on loan_applications
  for update using (auth.uid() = user_id and status = 'draft');

create policy "Admins can view all applications" on loan_applications
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Decisions table (AI scoring results)
create table if not exists decisions (
  id uuid default gen_random_uuid() primary key,
  loan_id uuid references loan_applications(id) on delete cascade not null,
  decision text not null check (decision in ('approve', 'reject', 'needs_review')),
  score decimal(3,2) not null check (score >= 0 and score <= 1),
  reasons text[] not null,
  input_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on decisions
alter table decisions enable row level security;

-- Decisions RLS policies
create policy "Users can view decisions for their applications" on decisions
  for select using (
    exists (
      select 1 from loan_applications
      where id = loan_id and user_id = auth.uid()
    )
  );

create policy "Owners and admins can create decisions" on decisions
  for insert with check (
    exists (
      select 1 from loan_applications la
      left join profiles p on p.id = auth.uid()
      where la.id = loan_id
      and (la.user_id = auth.uid() or p.role = 'admin')
    )
  );

create policy "Admins can view all decisions" on decisions
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Application documents table (for future file uploads)
create table if not exists application_documents (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references loan_applications(id) on delete cascade not null,
  document_type text not null,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  mime_type text not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on application_documents
alter table application_documents enable row level security;

-- Application documents RLS policies
create policy "Users can view documents for their applications" on application_documents
  for select using (
    exists (
      select 1 from loan_applications
      where id = application_id and user_id = auth.uid()
    )
  );

create policy "Users can upload documents for their applications" on application_documents
  for insert with check (
    exists (
      select 1 from loan_applications
      where id = application_id and user_id = auth.uid()
    )
  );

create policy "Admins can view all documents" on application_documents
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Audit log table
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  table_name text not null,
  record_id uuid not null,
  action text not null, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values jsonb,
  new_values jsonb,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on audit_logs (admin only)
alter table audit_logs enable row level security;

create policy "Only admins can view audit logs" on audit_logs
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Indexes for performance
create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_role on profiles(role);

create index if not exists idx_loan_applications_user_id on loan_applications(user_id);
create index if not exists idx_loan_applications_status on loan_applications(status);
create index if not exists idx_loan_applications_ai_decision on loan_applications(ai_decision);
create index if not exists idx_loan_applications_created_at on loan_applications(created_at);
create index if not exists idx_loan_applications_submitted_at on loan_applications(submitted_at);

create index if not exists idx_decisions_loan_id on decisions(loan_id);
create index if not exists idx_decisions_created_at on decisions(created_at desc);
create index if not exists idx_decisions_loan_hash on decisions(loan_id, input_hash);

create index if not exists idx_application_documents_application_id on application_documents(application_id);
create index if not exists idx_application_documents_document_type on application_documents(document_type);

create index if not exists idx_audit_logs_table_record on audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_user_id on audit_logs(user_id);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at);

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_loan_applications_updated_at
  before update on loan_applications
  for each row execute function update_updated_at_column();

-- Function to create a profile when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Sample data for development (optional)
-- This will be inserted after the first admin user is created

-- Insert admin user profile (update the UUID with your actual admin user ID)
-- insert into profiles (id, email, full_name, role)
-- values (
--   'your-admin-user-uuid-here',
--   'admin@ailoanapproval.com',
--   'System Administrator',
--   'admin'
-- ) on conflict (id) do update set role = 'admin';

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Final notes:
-- 1. Remember to set up Supabase Auth providers (email/password, OAuth)
-- 2. Configure email templates for auth flows
-- 3. Set up storage bucket for document uploads
-- 4. Configure RLS policies as needed
-- 5. Add the admin user UUID after first signup
