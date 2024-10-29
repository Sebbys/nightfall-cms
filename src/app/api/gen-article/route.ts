import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt is required' },
        { status: 400 }
      );
    }

    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct", // Updated from deprecated davinci-002
      prompt: `Write a blog post about: ${prompt}\n\nTitle: \nDescription: \nContent:, MDX format is a must. Make it fun and use emojis and also do some easy analogy to make it easier to understand. Use bullet points and lists to make it more readable and add separations. For bullets point just use ## as H2, for each heading remember to add spacing between the heading and the content. \n\n`,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const generatedText = completion.choices[0].text || '';
    const [title, description, ...contentParts] = generatedText.split('\n').filter(Boolean);

    return NextResponse.json({
      title: title.replace('Title:', ''),
      description: description.replace('Description:', ''),
      content: contentParts.join('\n').replace('', '').trim(),
    });

  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { message: 'Error generating article' },
      { status: 500 }
    );
  }
}