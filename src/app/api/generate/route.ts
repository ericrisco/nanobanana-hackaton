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
        const { latitude, longitude, style, population, timePeriod, streetViewPov, apiKey, mapsApiKey } = await request.json();
        
        console.log("Request parameters:", { latitude, longitude, style, population, timePeriod, streetViewPov });

        if (!latitude || !longitude || !style || !population || !timePeriod || !apiKey || !mapsApiKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Using the exact model name from the user's latest instruction
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

        // 1. Try to fetch Street View image first, fallback to roadmap
        let referenceImageUrl = '';
        let imageBase64 = '';
        const imageMimeType = "image/jpeg";
        
        // Try Street View first
        const heading = streetViewPov?.heading ?? 0;
        const pitch = streetViewPov?.pitch ?? 0;
        const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=512x512&location=${latitude},${longitude}&fov=90&pitch=${pitch}&heading=${heading}&key=${mapsApiKey}`;
        
        console.log("Street View POV:", streetViewPov, "-> heading:", heading, "pitch:", pitch);
        
        try {
            console.log("Trying Street View:", streetViewUrl);
            imageBase64 = await urlToBase64(streetViewUrl);
            referenceImageUrl = streetViewUrl;
            console.log("Street View image loaded successfully");
        } catch (streetViewError: unknown) {
            console.log("Street View failed, falling back to roadmap:", streetViewError instanceof Error ? streetViewError.message : String(streetViewError));
            
            // Fallback to roadmap
            const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=512x512&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&style=feature:poi|visibility:on&style=feature:transit|visibility:on&style=feature:road|element:labels|visibility:on&key=${mapsApiKey}`;
            
            imageBase64 = await urlToBase64(mapUrl);
            referenceImageUrl = mapUrl;
            console.log("Roadmap image loaded as fallback");
        }

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

        let prompt = `Based on this reference image, create a faithful recreation that maintains the EXACT same scene composition, architecture, and environment but rendered in ${style} style and populated EXCLUSIVELY by ${population} population. ${styleDescription}. 

CRITICAL RULES:
- Keep the SAME buildings, structures, roads, and landscape as shown in the reference image
- DO NOT add new buildings, structures, or elements that aren't in the original
- DO NOT remove or significantly alter existing architecture 
- The scene must ONLY contain ${population} population as inhabitants - humanized (walking, dressed appropriately, acting like people)
- NO humans, NO other creatures, ONLY ${population} population
- Maintain the same camera angle, perspective, and viewpoint as the reference
- Keep the same lighting conditions and time of day
- Create visual image only.`;

        if (timePeriod !== 'Present Day') {
            prompt += ` EXCEPTION: You may adapt clothing and small period-appropriate details for the ${timePeriod} era, but keep the core architecture and scene structure identical.`;
        }

        prompt += ` Remember: Stay faithful to the reference image structure while applying the ${style} style and ${population} population replacement only.`;

        const imageParts = [fileToGenerativePart(imageBase64, imageMimeType)];

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
                referenceMapUrl: referenceImageUrl 
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