import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    const { stdout, stderr } = await execAsync('bunx tsx prisma/seed.ts', {
      cwd: process.cwd(),
    })
    console.log('Seed stdout:', stdout)
    if (stderr) console.log('Seed stderr:', stderr)
    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Seed error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
