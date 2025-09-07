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
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=512x512&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&style=feature:poi|visibility:on&style=feature:transit|visibility:on&style=feature:road|element:labels|visibility:on&key=${mapsApiKey}`;
        
        // 2. Convert the fetched image to base64
        const mapImageBase64 = await urlToBase64(mapUrl);
        const imageMimeType = "image/jpeg";

        // 3. Prepare the prompt and image parts for the API
        let styleDescription = '';
        switch(style.toLowerCase()) {
            case 'realistic':
                styleDescription = 'Maintain photorealistic quality with natural lighting and realistic textures';
                break;
            case 'anime':
                styleDescription = 'Render everything in anime/manga style with large expressive eyes, vibrant colors, and characteristic anime aesthetic';
                break;
            case 'comic':
                styleDescription = 'Render everything in vibrant cartoon/comic book style with bold colors, exaggerated features, and comic book aesthetic';
                break;
            case 'pixel art':
                styleDescription = 'Transform everything into retro 8-bit/16-bit pixel art style with pixelated textures, limited color palette, and classic video game aesthetic';
                break;
            case 'oil painting':
                styleDescription = 'Render everything as a classical oil painting with rich textures, visible brushstrokes, and the warm aesthetic of traditional fine art';
                break;
            default:
                styleDescription = `Strong ${style} aesthetic applied to the entire scene`;
        }

        let prompt = `Generate a street-level photo from the red marker location. Show a ${style} scene populated EXCLUSIVELY
         by ${population} population. ${styleDescription}. CRITICAL: The scene must ONLY contain ${population} population as 
         inhabitants - they should be humanized (walking, dressed like humans, acting like people). NO humans, NO other creatures, 
         ONLY ${population} population. View from human eye level. Create visual image only.`;

        if (timePeriod !== 'Present Day') {
            prompt += ` Set the scene in the ${timePeriod} era with appropriate architecture, clothing, and atmosphere for the ${population} population.`;
        }

        prompt += ` Remember: ONLY ${population} population acting as the inhabitants. Generate image only - no text or descriptions.`;

        const imageParts = [fileToGenerativePart(mapImageBase64, imageMimeType)];

        // 4. Call the model with the prompt and image
        const result = await model.generateContent([prompt, ...imageParts]);
        
        // Log the full response for debugging
        console.log("Full Gemini API response:", JSON.stringify(result.response, null, 2));
        console.log("Response candidates:", result.response.candidates);
        
        // 5. Process the response to extract the generated image
        const parts = result.response.candidates?.[0].content.parts || [];
        console.log("All parts:", parts);
        
        // Find the part with inlineData (the image)
        const generatedImagePart = parts.find(part => 'inlineData' in part);
        console.log("Generated image part:", generatedImagePart);

        if (generatedImagePart && 'inlineData' in generatedImagePart && generatedImagePart.inlineData) {
            const base64ImageData = generatedImagePart.inlineData.data;
            const mimeType = generatedImagePart.inlineData.mimeType || 'image/png';
            const imageDataUrl = `data:${mimeType};base64,${base64ImageData}`;
            console.log("Successfully generated image with mimeType:", mimeType);
            console.log("Image data length:", base64ImageData.length);
            return NextResponse.json({ 
                imageData: imageDataUrl,
                referenceMapUrl: mapUrl 
            });
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