import { NextRequest, NextResponse } from 'next/server'

function extractUsername(value: string): string {
  const trimmed = value.trim()

  // Si empieza con @, quitarlo
  if (trimmed.startsWith('@')) {
    return trimmed.slice(1)
  }

  try {
    // Intentar parsear como URL
    const url = new URL(trimmed)
    // TikTok suele tener /@username al final
    const parts = url.pathname.split('/').filter(Boolean)
    const last = parts[parts.length - 1] || ''
    if (last.startsWith('@')) {
      return last.slice(1)
    }
    return last || trimmed
  } catch {
    // No es URL, devolver tal cual
    return trimmed
  }
}

function validateTikTokUsername(username: string): string | null {
  if (!username || !username.trim()) {
    return 'Username is required'
  }

  const trimmed = username.trim()

  if (trimmed.length < 2 || trimmed.length > 30) {
    return 'Username must be between 2 and 30 characters'
  }

  const regex = /^[a-zA-Z0-9_.-]+$/
  if (!regex.test(trimmed)) {
    return 'Username can only contain letters, numbers, dots, hyphens and underscores'
  }

  if (trimmed.startsWith('@')) {
    return 'Username should not include @ symbol'
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawUsername = (body.username as string | undefined) ?? (body.value as string | undefined)

    if (!rawUsername || !rawUsername.trim()) {
      return NextResponse.json(
        { error: 'Debes enviar un username o URL de perfil.' },
        { status: 400 },
      )
    }

    const username = extractUsername(rawUsername)

    // Validación estilo tiktokUsernameValidation
    const validationError = validateTikTokUsername(username)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 },
      )
    }

    // Llamar a la API de tu backend solo para mostrar su estado (healthcheck)
    let backendHealth: unknown = null
    try {
      const healthRes = await fetch('http://localhost:3001/health')
      if (healthRes.ok) {
        backendHealth = await healthRes.json()
      } else {
        backendHealth = {
          status: 'error',
          message: `Healthcheck responded with status ${healthRes.status}`,
        }
      }
    } catch (healthError) {
      console.error('Error llamando a /health del backend:', healthError)
      backendHealth = {
        status: 'error',
        message: 'No se pudo conectar a http://localhost:3001/health',
      }
    }

    // Usar la API real de scraping de tu backend (ruta Express: /api/scraping/tiktok)
    try {
      let scrapingRes = await fetch('http://localhost:3001/api/scraping/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos solo username como espera el backend
        body: JSON.stringify({ username }),
      })

      // Si devuelve 404, intentar sin el prefijo /api (por si la ruta real es /scraping/tiktok)
      if (scrapingRes.status === 404) {
        scrapingRes = await fetch('http://localhost:3001/scraping/tiktok', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        })
      }

      if (scrapingRes.ok) {
        const scrapingData = await scrapingRes.json()
        return NextResponse.json(
          {
            message: scrapingData.message ?? `Scraping completado para @${username}`,
            data: scrapingData,
            backendHealth,
          },
          { status: 200 },
        )
      }

      console.error('Scraping API respondió con error:', scrapingRes.status)
    } catch (scrapeError) {
      console.error('Error llamando a /api/scraping del backend:', scrapeError)
    }

    // Si la API real falla, devolvemos error
    return NextResponse.json(
      {
        error: 'No se pudo obtener datos desde la API de scraping.',
        backendHealth,
      },
      { status: 502 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          'Error en la simulación de importación. Revisa el formato del cuerpo o inténtalo de nuevo.',
      },
      { status: 500 },
    )
  }
}


