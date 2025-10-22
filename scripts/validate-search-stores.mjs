#!/usr/bin/env node
/**
 * validate-search-stores.mjs
 *
 * Tiny staging validator for the Local Fish Store search.
 * - Verifies Supabase connectivity
 * - Attempts to fetch a few store slugs (from 'stores' table)
 * - Optionally attempts RPC 'search_stores' if present
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
 *   node scripts/validate-search-stores.mjs --lat=37.7749 --lng=-122.4194 --radius=25
 */

import { createClient } from '@supabase/supabase-js'

function getArg(key, def = undefined) {
  const flag = process.argv.find((a) => a.startsWith(`--${key}=`))
  if (!flag) return def
  const [, val] = flag.split('=')
  return val
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !anon) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY envs')
  process.exit(1)
}

const lat = parseFloat(getArg('lat', '0'))
const lng = parseFloat(getArg('lng', '0'))
const radius = parseFloat(getArg('radius', '25'))

const supabase = createClient(url, anon)

async function main() {
  console.log('Checking connectivity and fetching a few store slugs...')
  const { data: slugs, error: slugErr } = await supabase
    .from('stores')
    .select('slug')
    .eq('is_active', true)
    .limit(5)

  if (slugErr) {
    console.warn('Could not fetch slugs from stores table:', slugErr.message)
  } else {
    console.log('Stores (up to 5):', slugs?.map((s) => s.slug))
  }

  console.log('Attempting RPC: search_stores (if available)...')
  try {
    // NOTE: Adjust parameter names to match your actual RPC signature.
    const { data: results, error: rpcErr } = await supabase.rpc('search_stores', {
      lat,
      lng,
      radius_miles: radius,
      // q: null,
      // categories: null,
      // sort: 'nearest',
      // page: 1,
      // page_size: 10,
    })

    if (rpcErr) {
      console.warn('RPC search_stores returned an error (this may be expected if signature differs):', rpcErr.message)
    } else {
      console.log(`RPC search_stores returned ${Array.isArray(results) ? results.length : 0} rows`)
      if (Array.isArray(results) && results[0]) {
        console.log('Sample row keys:', Object.keys(results[0]))
      }
    }
  } catch (e) {
    console.warn('RPC call threw (this may be expected if RPC is not deployed):', e?.message || e)
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error('Unexpected failure:', e)
  process.exit(1)
})
