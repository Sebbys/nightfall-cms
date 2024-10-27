import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

// Validate environment variables
if (!process.env.GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN is not set in environment variables')
}

const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN,
})

export async function POST(req: Request) {
  try {
    // First, verify the token is present
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ 
        message: 'GitHub token is not configured',
        error: 'GITHUB_TOKEN environment variable is missing'
      }, { status: 500 })
    }

    const { content, fileName } = await req.json()
    
    // Validate input
    if (!content || !fileName) {
      return NextResponse.json({ 
        message: 'Content and fileName are required' 
      }, { status: 400 })
    }

    // Repository configuration
    const owner = 'Sebbys'
    const repo = 'blog_nightfall'
    const path = `${fileName}.mdx` // Note: removed double 'contents' in path
    const branch = 'main'

    // Verify repository access
    try {
      await octokit.rest.repos.get({
        owner,
        repo,
      })
    } catch (error: any) {
      return NextResponse.json({ 
        message: 'Unable to access repository',
        error: error.message,
        details: 'Please verify repository name and token permissions'
      }, { status: 403 })
    }

    const encodedContent = Buffer.from(content).toString('base64')

    // Create or update file
    const result = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Add/update blog post: ${fileName}.mdx`,
      content: encodedContent,
      branch,
    })

    return NextResponse.json({ 
      message: 'File saved successfully',
      sha: result.data.content?.sha,
      url: result.data.content?.html_url,
      commit: result.data.commit
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data
    })

    // More specific error messages based on status codes
    const errorMessage = error.status === 404 
      ? 'Repository or file path not found. Please verify repository name and path.'
      : error.status === 403 
      ? 'Permission denied. Please check your GitHub token permissions.'
      : 'Error saving file to GitHub'

    return NextResponse.json({ 
      message: errorMessage,
      error: error.message,
      details: error.response?.data
    }, { status: error.status || 500 })
  }
}