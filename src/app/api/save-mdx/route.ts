import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

if (!process.env.GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN is not set in environment variables')
}

const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN,
})

export async function POST(req: Request) {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ 
        message: 'GitHub token is not configured',
        error: 'GITHUB_TOKEN environment variable is missing'
      }, { status: 500 })
    }

    let content: string
    let fileName: string
    let image: File | null = null

    const contentType = req.headers.get('content-type')

    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      content = formData.get('content') as string
      fileName = formData.get('fileName') as string
      image = formData.get('image') as File | null
    } else {
      const jsonData = await req.json()
      content = jsonData.content
      fileName = jsonData.fileName
    }

    if (!content || !fileName) {
      return NextResponse.json({ 
        message: 'Content and fileName are required' 
      }, { status: 400 })
    }

    const owner = 'Sebbys'
    const repo = 'blog_nightfall'
    const branch = 'main'

    try {
      await octokit.rest.repos.get({ owner, repo })
    } catch (error: any) {
      return NextResponse.json({ 
        message: 'Unable to access repository',
        error: error.message,
        details: 'Please verify repository name and token permissions'
      }, { status: 403 })
    }

    let imageUrl = ''
    if (image) {
      const imageBuffer = await image.arrayBuffer()
      const imageContent = Buffer.from(imageBuffer).toString('base64')
      const imagePath = `images/${fileName}-${image.name}`
      
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: imagePath,
        message: `Add image for blog post: ${fileName}`,
        content: imageContent,
        branch,
      })

      imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${imagePath}`
    }

    const updatedContent = imageUrl ? `${content}\n\n![Blog post image](${imageUrl})` : content
    const encodedContent = Buffer.from(updatedContent).toString('base64')

    const result = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `${fileName}.mdx`,
      message: `Add/update blog post: ${fileName}.mdx`,
      content: encodedContent,
      branch,
    })

    return NextResponse.json({ 
      message: 'File and image saved successfully',
      sha: result.data.content?.sha,
      url: result.data.content?.html_url,
      commit: result.data.commit,
      imageUrl
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data
    })

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