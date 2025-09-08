import type { APIRoute } from 'astro'
import { serverAuth } from '@firebase/server'
import { logError } from '@utils/logHelpers'
import { tokenToUid } from '@utils/server/auth/tokenToUid'

export const GET: APIRoute = async ({ request }) => {
  try {
    const uid = await tokenToUid(request)

    if (!uid) {
      return new Response(
        JSON.stringify({
          loggedIn: false,
          eula_accepted: false,
          account_created: false,
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const user = await serverAuth.getUser(uid)
    const claims = user.customClaims || {}

    const { eula_accepted = false, account_created = false } = claims

    return new Response(
      JSON.stringify({
        loggedIn: true,
        eula_accepted,
        account_created,
        uid,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    logError('api/auth/status', 'Error fetching user status:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
