import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export async function POST(request: Request) {
  const { title, content } = await request.json()

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: 'sebbys',
      repo: 'nightfall-cms',
      path: `src/app/posts/${title.toLowerCase().replace(/\s+/g, '-')}.md`,
      message: `Add new post: ${title}`,
      content: Buffer.from(content).toString('base64'),
      branch: 'main'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating file:', error)
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 })
  }
}