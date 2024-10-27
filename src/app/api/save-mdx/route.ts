import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const { content, fileName } = await req.json()
  const filePath = path.join(process.cwd(), 'src', 'app', 'blogs', `${fileName}.mdx`)

  try {
    await fs.writeFile(filePath, content)
    return NextResponse.json({ message: 'File saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json({ message: 'Error saving file' }, { status: 500 })
  }
}