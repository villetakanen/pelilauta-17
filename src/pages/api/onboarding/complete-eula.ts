import type { APIRoute } from 'astro'
import { serverAuth, serverDB } from '@firebase/server'
import { logError, logDebug } from '@utils/logHelpers'
import { tokenToUid } from '@utils/server/auth/tokenToUid'

export const POST: APIRoute = async ({ request }) => {
  try {
    const uid = await tokenToUid(request)
    if (!uid) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Set custom claims
    await serverAuth.setCustomUserClaims(uid, { eula_accepted: true, account_created: false })
    logDebug('api/onboarding/complete-eula', `Set custom claims for ${uid}`)

    // Create account document in Firestore
    const accountRef = serverDB.collection('accounts').doc(uid)
    await accountRef.set({ createdAt: new Date().toISOString() })
    logDebug('api/onboarding/complete-eula', `Created account document for ${uid}`)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    logError('api/onboarding/complete-eula', 'Error completing EULA:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
