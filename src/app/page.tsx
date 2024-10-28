'use client'

import React, { useState, useCallback } from 'react'
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
import { Save, Settings, X, Eye, Edit, Plus,Wand2, Image as ImageIcon } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const CATEGORIES = [
  "Technology",
  "Programming",
  "Web Development",
  "Design",
  "Tutorial",
  "Opinion",
  "News",
] as const

type Category = typeof CATEGORIES[number]

interface Frontmatter {
  title: string;
  date: string;
  description: string;
  author: string;
  category: Category[];
  status: 'draft' | 'published' | 'archived';
}

interface PreviewProps {
  content: string;
  frontmatter: Frontmatter;
}

const Preview: React.FC<PreviewProps> = ({ content, frontmatter }) => {
  const renderContent = () => {
    let rendered = content
      .replace(/^### (.*$)/gim, '<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\* (.*$)/gim, '<li class="mt-2">$1</li>')
      .replace(/^\d\. (.*$)/gim, '<li class="mt-2">$1</li>')
      .replace(/```([\s\S]*?)```/gm, '<pre class="mb-4 mt-6 overflow-x-auto rounded-lg bg-muted p-4"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">$1</code>')
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="font-medium text-primary underline underline-offset-4">$1</a>')
      .replace(/!\[([^\]]+)\]$$([^)]+)$$/g, '<img src="$2" alt="$1" class="rounded-md border" />')
      .replace(/^> (.*$)/gim, '<blockquote class="mt-6 border-l-2 pl-6 italic">$1</blockquote>')
      .replace(/\|(.+)\|/g, (match, p1) => {
        const cells = p1.split('|').map((cell: string) => cell.trim());
        const isHeader = cells.every((cell: string) => cell.startsWith('---'));
        if (isHeader) {
          return '';
        }
        const rowContent = cells.map((cell: any) => `<td class="p-2 border">${cell}</td>`).join('');
        return `<tr>${rowContent}</tr>`;
      })
      .replace(/^(.+\|.+)$/gm, (match, p1) => {
        if (p1.includes('|---')) {
          const headerCells = p1.split('|').filter(Boolean).map((cell: string) => cell.trim());
          const headerContent = headerCells.map((cell: any) => `<th class="p-2 font-bold border">${cell}</th>`).join('');
          return `<table class="w-full border-collapse border"><thead><tr>${headerContent}</tr></thead><tbody>`;
        }
        return match;
      })
      .replace(/<\/tbody><\/table>\s*<table/g, '');

    return rendered;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{frontmatter.title}</h1>
        <div className="flex gap-2 my-4">
          {frontmatter.category.map(cat => (
            <Badge key={cat} variant="secondary">{cat}</Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {frontmatter.author} • {new Date(frontmatter.date).toLocaleDateString()}
        </p>
        {frontmatter.description && (
          <p className="text-xl text-muted-foreground mt-2">{frontmatter.description}</p>
        )}
      </div>
      <div 
        className="mt-8"
        dangerouslySetInnerHTML={{ __html: renderContent() }}
      />
    </div>
  )
}

const MDXEditor: React.FC = () => {
  const [frontmatter, setFrontmatter] = useState<Frontmatter>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    author: '',
    category: [],
    status: 'draft',
  })
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [darkMode, setDarkMode] = useState(false)
  const [articleIdea, setArticleIdea] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleFrontmatterChange = (name: keyof Frontmatter, value: string | Category[]) => {
    setFrontmatter(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addCategory = (category: Category) => {
    if (!frontmatter.category.includes(category)) {
      handleFrontmatterChange('category', [...frontmatter.category, category])
    }
  }

  const removeCategory = (categoryToRemove: Category) => {
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

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = new Image()
        img.onload = () => {
          const imgTag = `![${file.name}](${event.target?.result as string})`
          setContent(prevContent => prevContent + '\n\n' + imgTag)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const insertTable = () => {
    const tableTemplate = `
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
`
    setContent(prevContent => prevContent + '\n' + tableTemplate + '\n')
  }

  const generateArticle = async () => {
    if (!articleIdea) {
      toast({
        title: "Error",
        description: "Please enter an article idea.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/gen-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: articleIdea }),
      })

      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
        setFrontmatter(prev => ({
          ...prev,
          title: data.title,
          description: data.description,
        }))
        toast({
          title: "Success",
          description: "Article generated successfully.",
        })
      } else {
        throw new Error('Failed to generate article')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="text-muted-foreground">Create and edit your MDX blog posts</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
            <Label htmlFor="dark-mode">Dark Mode</Label>
          </div>
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
                    onValueChange={v => handleFrontmatterChange('status', v as 'draft' | 'published' | 'archived')}
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
            <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'edit' | 'preview')} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="edit" className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('image-upload')?.click()}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button variant="outline" size="sm" onClick={insertTable}>
                    <Plus className="mr-2 h-4 w-4" />
                    Insert Table
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Article
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate Article</DialogTitle>
                        <DialogDescription>
                          Enter your article idea and we'll generate content for you using AI.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="article-idea" className="text-right">
                            Article Idea
                          </Label>
                          <Input
                            id="article-idea"
                            value={articleIdea}
                            onChange={(e) => setArticleIdea(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <Button onClick={generateArticle} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Generate'}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <Textarea
                  placeholder="Write your blog post content here in Markdown/MDX format..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="min-h-[500px] font-mono"
                />
              </TabsContent>
              <TabsContent value="preview">
                <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                  <Preview content={content} frontmatter={frontmatter} />
                </ScrollArea>
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
              <Separator />
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
                <Select onValueChange={(value: string) => addCategory(value as Category)}>
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
                      <X className="ml-1 h-3 w-4" />
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

export default MDXEditor