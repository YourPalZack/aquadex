// Basic Haversine test using Node's built-in test runner
// Ensures our expected earth-distance logic stays correct in future refactors
const test = require('node:test')
const assert = require('node:assert/strict')

// Haversine in kilometers
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

test('haversine distance SF -> LA ~ 559 km', () => {
  // San Francisco, CA
  const sf = { lat: 37.7749, lon: -122.4194 }
  // Los Angeles, CA
  const la = { lat: 34.0522, lon: -118.2437 }

  const d = haversineKm(sf.lat, sf.lon, la.lat, la.lon)

  // Use a tolerance because earth radius varies slightly and rounding differs
  assert.ok(d > 540 && d < 580, `Expected ~559km, got ${d}`)
})

test('haversine zero distance when same point', () => {
  const a = { lat: 10, lon: 20 }
  const b = { lat: 10, lon: 20 }
  const d = haversineKm(a.lat, a.lon, b.lat, b.lon)
  assert.equal(Math.round(d), 0)
})
