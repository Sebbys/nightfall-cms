'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Save, Settings, X } from 'lucide-react'
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const CATEGORIES = [
  "Technology",
  "Programming",
  "Web Development",
  "Design",
  "Tutorial",
  "Opinion",
  "News",
]

// MDX Preview Components
const PreviewComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
      {children}
    </ol>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mt-6 border-l-2 border-primary pl-6 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-black p-4">
      {children}
    </pre>
  ),
}

// Preview component with enhanced MDX rendering
interface Frontmatter {
  title: string;
  date: string;
  description?: string;
  author: string;
  category: string[];
}

const Preview = ({ content, frontmatter }: { content: string; frontmatter: Frontmatter }) => {
  const renderContent = () => {
    // Simple markdown-like replacements
    let rendered = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d\. (.*$)/gim, '<li>$1</li>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links and Images
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

    return rendered
  }

  return (
    <section className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

    <div className="prose dark:prose-invert max-w-none">
      <div className="mb-8">
        <h1 className="mb-2">{frontmatter.title}</h1>
        <div className="flex gap-2 my-4">
          {frontmatter.category.map(cat => (
            <Badge key={cat} variant="secondary">{cat}</Badge>
          ))}
        </div>
        <p className="text-muted-foreground">
          {frontmatter.author} • {new Date(frontmatter.date).toLocaleDateString()}
        </p>
        {frontmatter.description && (
          <p className="text-lg text-muted-foreground mt-2">{frontmatter.description}</p>
        )}
      </div>
      <div 
        className="mt-8"
        dangerouslySetInnerHTML={{ __html: renderContent() }}
      />

    </div>
    </section>

  )
}

export default function MDXEditor() {
  const [frontmatter, setFrontmatter] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    author: '',
    category: [] as string[],
    status: 'draft',
  })
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [activeTab, setActiveTab] = useState('edit')
  const { toast } = useToast()

  const handleFrontmatterChange = (name: string, value: string | string[]) => {
    setFrontmatter(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addCategory = (category: string) => {
    if (!frontmatter.category.includes(category)) {
      handleFrontmatterChange('category', [...frontmatter.category, category])
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    handleFrontmatterChange(
      'category',
      frontmatter.category.filter(cat => cat !== categoryToRemove)
    )
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
status: ${frontmatter.status}
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="text-muted-foreground">Create and edit your MDX blog posts</p>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Post Settings</SheetTitle>
                <SheetDescription>Configure your post settings here.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Post Status</Label>
                  <Select 
                    value={frontmatter.status} 
                    onValueChange={v => handleFrontmatterChange('status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Write your blog post content here</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="edit" className="flex-1">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Textarea
                  placeholder="Write your blog post content here in Markdown/MDX format..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="min-h-[500px] font-mono"
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-[500px] p-4 border rounded-md overflow-auto">
                  <Preview content={content} frontmatter={frontmatter} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>Configure your post metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>File Name</Label>
                <Input
                  placeholder="Enter file name (without .mdx)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  name="title"
                  placeholder="Post title"
                  value={frontmatter.title}
                  onChange={(e) => handleFrontmatterChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  name="description"
                  placeholder="Brief description of your post"
                  value={frontmatter.description}
                  onChange={(e) => handleFrontmatterChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Publish Date</Label>
                <Input
                  type="date"
                  name="date"
                  value={frontmatter.date}
                  onChange={(e) => handleFrontmatterChange('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  name="author"
                  placeholder="Author name"
                  value={frontmatter.author}
                  onChange={(e) => handleFrontmatterChange('author', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Categories</Label>
                <Select onValueChange={addCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {frontmatter.category.map(category => (
                    <Badge 
                      key={category} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeCategory(category)}
                    >
                      {category}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}