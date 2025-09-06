import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// This implementation is based on the user's final, detailed code snippet.

// Function to fetch an image from a URL and return its base64 representation
async function urlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${url}. Status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
}

// Function to create the generative part for the API call
function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
}

export async function POST(request: Request) {
    try {
        const { latitude, longitude, style, population, timePeriod, apiKey } = await request.json();

        if (!latitude || !longitude || !style || !population || !timePeriod || !apiKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Using the exact model name from the user's latest instruction
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

        // 1. Fetch the map image from Google Maps Static API
        const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!mapsApiKey) {
            throw new Error("Google Maps API key is not configured on the server.");
        }
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=18&size=600x400&maptype=satellite&key=${mapsApiKey}`;
        
        // 2. Convert the fetched image to base64
        const mapImageBase64 = await urlToBase64(mapUrl);
        const imageMimeType = "image/jpeg";

        // 3. Prepare the prompt and image parts for the API
        let prompt = `Based on this satellite image, generate a new, highly detailed image in a ${style} style, populated by ${population}.`;

        if (timePeriod !== 'Present Day') {
            prompt += ` Imagine the scene is taking place in the ${timePeriod} era.`;
        }

        prompt += ` The result should be a creative interpretation, not a literal copy. Do not include any text, labels, or map artifacts in the final image.`;

        const imageParts = [fileToGenerativePart(mapImageBase64, imageMimeType)];

        // 4. Call the model with the prompt and image
        const result = await model.generateContent([prompt, ...imageParts]);
        
        // 5. Process the response to extract the generated image
        const generatedImagePart = result.response.candidates?.[0].content.parts[0];

        if (generatedImagePart && 'inlineData' in generatedImagePart && generatedImagePart.inlineData) {
            const base64ImageData = generatedImagePart.inlineData.data;
            const mimeType = generatedImagePart.inlineData.mimeType || 'image/png';
            const imageDataUrl = `data:${mimeType};base64,${base64ImageData}`;
            return NextResponse.json({ imageData: imageDataUrl });
        } else {
            const textResponse = result.response.text();
            console.error("API did not return an image. Text response:", textResponse);
            return NextResponse.json({ error: "The API did not return a valid image. It may have responded with text.", details: textResponse }, { status: 500 });
        }

    } catch (error: unknown) {
        console.error("Error in /api/generate:", error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}