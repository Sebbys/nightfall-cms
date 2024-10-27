'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Save } from 'lucide-react'

export default function Component() {
  const [frontmatter, setFrontmatter] = useState({
    title: '',
    date: '',
    description: '',
    author: '',
    category: [],
  })
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const { toast } = useToast()

  const handleFrontmatterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFrontmatter(prev => ({
      ...prev,
      [name]: name === 'category' ? value.split(',').map(cat => cat.trim()) : value
    }))
  }

  const handleSave = async () => {
    if (!fileName) {
      toast({
        title: "Error",
        description: "Please enter a file name.",
        variant: "destructive",
      })
      return
    }

    const mdxContent = `---
title: "${frontmatter.title}"
date: "${frontmatter.date}"
description: "${frontmatter.description}"
author: ${frontmatter.author}
category: [${frontmatter.category.join(', ')}]
---

${content}`

    try {
      const response = await fetch('/api/save-mdx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: mdxContent, fileName }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `File ${fileName}.mdx saved successfully.`,
        })
      } else {
        throw new Error('Failed to save file')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Blog Post Template</h1>
      <div className="mb-4 space-y-2">
        <Input
          type="text"
          placeholder="Enter file name (without .mdx)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <Input
          type="text"
          name="title"
          placeholder="Title"
          value={frontmatter.title}
          onChange={handleFrontmatterChange}
        />
        <Input
          type="date"
          name="date"
          value={frontmatter.date}
          onChange={handleFrontmatterChange}
        />
        <Input
          type="text"
          name="description"
          placeholder="Description"
          value={frontmatter.description}
          onChange={handleFrontmatterChange}
        />
        <Input
          type="text"
          name="author"
          placeholder="Author"
          value={frontmatter.author}
          onChange={handleFrontmatterChange}
        />
        <Input
          type="text"
          name="category"
          placeholder="Categories (comma-separated)"
          value={frontmatter.category.join(', ')}
          onChange={handleFrontmatterChange}
        />
      </div>
      <Textarea
        placeholder="Write your blog post content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
        className="w-full p-2 border rounded mb-4"
      />
      <Button onClick={handleSave} className="w-full">
        <Save className="mr-2 h-4 w-4" /> Save Blog Post
      </Button>
    </div>
  )
}