/**
 * Create 30 fictional Town accounts for development/testing.
 *
 * Run from the repository root:
 *   SUPABASE_URL=https://<project-ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role-secret> \
 *   node scripts/create-test-users.mjs
 *
 * On Windows PowerShell:
 *   $env:SUPABASE_URL="https://<project-ref>.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="<service-role-secret>"
 *   node scripts/create-test-users.mjs
 *
 * Credentials are written to test-users-credentials.csv (never commit that file).
 */
import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.')
  process.exit(1)
}

const users = [
  ['Maya Chen', 'maya_chen'],
  ['Arjun Mehta', 'arjun_mehta'],
  ['Aisha Khan', 'aisha_khan'],
  ['Rohan Iyer', 'rohan_iyer'],
  ['Zara Patel', 'zara_patel'],
  ['Kabir Rao', 'kabir_rao'],
  ['Ananya Das', 'ananya_das'],
  ['Ishaan Kapoor', 'ishaan_kapoor'],
  ['Meera Nair', 'meera_nair'],
  ['Dev Malhotra', 'dev_malhotra'],
  ['Sara Thomas', 'sara_thomas'],
  ['Aditya Bose', 'aditya_bose'],
  ['Nisha Reddy', 'nisha_reddy'],
  ['Vihaan Shah', 'vihaan_shah'],
  ['Tara Menon', 'tara_menon'],
  ['Neil Fernandes', 'neil_fernandes'],
  ['Diya Kulkarni', 'diya_kulkarni'],
  ['Reyansh Gupta', 'reyansh_gupta'],
  ['Ira Mukherjee', 'ira_mukherjee'],
  ['Kian D’Souza', 'kian_dsouza'],
  ['Sana Ali', 'sana_ali'],
  ['Atharv Joshi', 'atharv_joshi'],
  ['Riya Pillai', 'riya_pillai'],
  ['Aarav Sinha', 'aarav_sinha'],
  ['Mira Krishnan', 'mira_krishnan'],
  ['Yash Verma', 'yash_verma'],
  ['Kiara Bhat', 'kiara_bhat'],
  ['Dhruv Anand', 'dhruv_anand'],
  ['Avni Ghosh', 'avni_ghosh'],
  ['Samir Roy', 'samir_roy'],
]

async function adminRequest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = body.msg || body.message || body.error_description || body.error || response.statusText
    throw new Error(`${response.status}: ${message}`)
  }
  return body
}

const existing = new Set()
for (let page = 1; ; page += 1) {
  const result = await adminRequest(`/auth/v1/admin/users?page=${page}&per_page=100`)
  const batch = result.users ?? []
  for (const user of batch) if (user.email) existing.add(user.email.toLowerCase())
  if (batch.length < 100) break
}

const credentials = [['name', 'username', 'email', 'temporary_password', 'status']]
let created = 0
let skipped = 0
let failed = 0

for (const [name, username] of users) {
  const email = `${username}@example.com`
  if (existing.has(email)) {
    console.log(`SKIP  ${email} already exists`)
    skipped += 1
    continue
  }

  const password = `Tn!${randomBytes(18).toString('base64url')}9a`
  try {
    const result = await adminRequest('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, display_name: name, is_test_account: true },
      }),
    })
    if (!result.id) throw new Error('Auth API returned no user ID')

    // The project's handle_new_user trigger creates the matching public.profiles row.
    credentials.push([name, username, email, password, 'created'])
    console.log(`CREATED ${email}`)
    created += 1
  } catch (error) {
    console.error(`FAILED ${email}: ${error.message}`)
    credentials.push([name, username, email, '', `failed: ${error.message}`])
    failed += 1
  }
}

const csv = credentials
  .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
  .join('\n')
await writeFile('test-users-credentials.csv', `${csv}\n`, { mode: 0o600 })

console.log(`\nFinished. Created: ${created}; already existed: ${skipped}; failed: ${failed}.`)
console.log('Credentials saved to test-users-credentials.csv. Keep this file private and do not commit it.')
if (failed) process.exitCode = 1
