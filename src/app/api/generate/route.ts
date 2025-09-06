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
        const { latitude, longitude, style, population, timePeriod, apiKey, mapsApiKey } = await request.json();
        
        console.log("Request parameters:", { latitude, longitude, style, population, timePeriod });

        if (!latitude || !longitude || !style || !population || !timePeriod || !apiKey || !mapsApiKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Using the exact model name from the user's latest instruction
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

        // 1. Fetch the map image from Google Maps Static API
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=18&size=600x400&maptype=satellite&key=${mapsApiKey}`;
        
        // 2. Convert the fetched image to base64
        const mapImageBase64 = await urlToBase64(mapUrl);
        const imageMimeType = "image/jpeg";

        // 3. Prepare the prompt and image parts for the API
        let prompt = `GENERATE AN IMAGE ONLY. Based on this satellite image location, create a street-level view as if you were standing on the ground at this exact place. Show a ${style} style scene populated by ${population}.`;

        if (timePeriod !== 'Present Day') {
            prompt += ` Set the scene in the ${timePeriod} era with appropriate architecture, clothing, and atmosphere.`;
        }

        prompt += ` The image should show what someone would see walking on the streets or standing in this location - buildings, streets, environment from ground level perspective. Do not show satellite/aerial views. IMPORTANT: Return only an image, no text response.`;

        const imageParts = [fileToGenerativePart(mapImageBase64, imageMimeType)];

        // 4. Call the model with the prompt and image
        const result = await model.generateContent([prompt, ...imageParts]);
        
        // Log the full response for debugging
        console.log("Full Gemini API response:", JSON.stringify(result.response, null, 2));
        console.log("Response candidates:", result.response.candidates);
        
        // 5. Process the response to extract the generated image
        const generatedImagePart = result.response.candidates?.[0].content.parts[0];
        console.log("Generated image part:", generatedImagePart);

        if (generatedImagePart && 'inlineData' in generatedImagePart && generatedImagePart.inlineData) {
            const base64ImageData = generatedImagePart.inlineData.data;
            const mimeType = generatedImagePart.inlineData.mimeType || 'image/png';
            const imageDataUrl = `data:${mimeType};base64,${base64ImageData}`;
            console.log("Successfully generated image with mimeType:", mimeType);
            console.log("Image data length:", base64ImageData.length);
            return NextResponse.json({ imageData: imageDataUrl });
        } else {
            const textResponse = result.response.text();
            console.error("API did not return an image. Text response:", textResponse);
            console.error("Response structure:", {
                candidates: result.response.candidates,
                parts: result.response.candidates?.[0]?.content?.parts
            });
            return NextResponse.json({ 
                error: "Unable to generate image for this location/style combination. Try a different location or style.", 
                message: "The AI couldn't create an image based on the current settings. This can happen with certain locations or style combinations.",
                details: textResponse 
            }, { status: 400 });
        }

    } catch (error: unknown) {
        console.error("Error in /api/generate:", error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}