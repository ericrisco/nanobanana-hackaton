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

        let prompt = `Using this reference image as a base, CREATE A COMPLETELY NEW HIGH-RESOLUTION IMAGE that recreates the same scene with full detail. Do not modify the original - instead, generate an entirely new detailed image that uses the reference as inspiration for layout and composition. Render everything in ${style} style and populate EXCLUSIVELY with ${population} population. ${styleDescription}. 

RECREATION RULES FOR NEW IMAGE GENERATION:
- RECREATE: Same number of buildings, structures, and elements in identical positions and scale with FULL DETAIL
- RECREATE: Same roads, landscape, and overall scene layout with enhanced detail and clarity
- RECREATE: Same camera angle, perspective, and viewpoint but with crisp, high-resolution quality
- RECREATE: Same lighting conditions and time of day with realistic lighting effects
- PRESERVE LANDMARKS: Keep any iconic/famous buildings (Eiffel Tower, Big Ben, Sagrada Familia, etc.) recognizable with their distinctive features
- ADD RICH DETAIL: Include textures, shadows, atmospheric effects, and environmental details not visible in the low-resolution reference
- POPULATION ABSOLUTE RULE: Scene must contain EXCLUSIVELY AND ONLY ${population} as inhabitants - THIS IS NON-NEGOTIABLE
- IF population is NOT "Real persons": ABSOLUTELY ZERO humans allowed - NOT A SINGLE HUMAN BEING
- ZERO other creatures, animals, beings, or life forms allowed - ONLY ${population} - NO EXCEPTIONS WHATSOEVER
- FORBIDDEN: Any other type of inhabitant than ${population} - this rule CANNOT be broken under any circumstances
- MANDATORY: All ${population} must be humanized (walking upright, dressed appropriately for the time period, acting like people) with individual characteristics
- STRICT ENFORCEMENT: If you see ANY other type of being in the reference image, you MUST replace them ALL with ${population} - NO exceptions
- CREATE ENTIRELY NEW IMAGE: Do not edit the reference - generate a completely new detailed interpretation`;

        if (timePeriod !== 'Present Day') {
            let periodDetails = '';
            switch(timePeriod) {
                case 'Prehistoric':
                    periodDetails = 'Replace modern buildings with primitive huts, caves, or basic stone structures. Add natural vegetation, dirt paths instead of paved roads, primitive tools and fire pits.';
                    break;
                case 'Ancient Rome':
                    periodDetails = 'Transform buildings into Roman architecture with columns, marble, terracotta roofs, aqueducts, Roman roads with cobblestones, forums, and classical proportions.';
                    break;
                case 'Medieval Times':
                    periodDetails = 'Redesign as medieval architecture with stone castles, wooden houses with thatched roofs, narrow cobblestone streets, market squares, and Gothic elements.';
                    break;
                case 'Renaissance':
                    periodDetails = 'Style buildings with Renaissance architecture featuring symmetry, arches, domes, ornate facades, classical proportions, and elegant urban planning.';
                    break;
                case '1920':
                    periodDetails = 'Transform into 1920s Art Deco architecture with geometric patterns, vertical emphasis, ornate metalwork, and period-appropriate signage and vehicles.';
                    break;
                case '1940':
                    periodDetails = 'Style as 1940s architecture with streamline moderne, brick buildings, period-appropriate cars, wartime atmosphere, and mid-century urban design.';
                    break;
                case '1950':
                    periodDetails = 'Redesign with 1950s suburban/urban architecture, ranch-style buildings, classic cars, neon signs, and post-war optimistic styling.';
                    break;
                case '1980':
                    periodDetails = 'Transform into 1980s architecture with postmodern design, bold colors, geometric shapes, neon lighting, and characteristic 80s urban aesthetic.';
                    break;
                default:
                    periodDetails = `Adapt architecture and environment to authentic ${timePeriod} period styling`;
            }
            prompt += ` COMPLETE PERIOD TRANSFORMATION: ${periodDetails} Keep the same building positions, scale, and scene layout, but completely transform EVERYTHING to be historically accurate for ${timePeriod}. 
            
            STRICT ANACHRONISM ELIMINATION FOR ${timePeriod}:
            - COMPLETELY REMOVE ALL modern elements: no modern cars, signs, technology, clothing, materials, or objects from later periods
            - REPLACE ALL vehicles with period-appropriate transportation (horses, carriages, boats, etc. for early periods)
            - REPLACE ALL signage, lighting, and infrastructure with period-accurate alternatives  
            - REPLACE ALL modern materials (concrete, steel, glass) with period materials (stone, wood, thatch, etc.)
            - REMOVE power lines, modern street lights, traffic signals, and contemporary urban furniture
            - If there are iconic landmarks, keep them recognizable but remove any surrounding modern elements
            - The scene must look like it was authentically photographed in ${timePeriod} - ZERO anachronisms allowed`;
        }

        prompt += ` 

        CRITICAL POPULATION WARNING: The image must show ONLY ${population} as inhabitants. If ${population} is "Bananas", show ONLY humanized bananas. If ${population} is "Robots", show ONLY robots. If ${population} is "Zoo animals", show ONLY zoo animals. NO mixing of populations allowed. NO humans unless specifically "Real persons" is selected.

        FINAL VERIFICATION CHECKLIST FOR NEW HIGH-RESOLUTION RECREATION:
        ✓ Completely new detailed image generated (not modification of original)
        ✓ Same scene layout and building positions as reference but with full detail
        ✓ EXCLUSIVELY ${population} population visible - ZERO other inhabitants of any type allowed
        ✓ All modern elements removed if time period is historical
        ✓ Architecture and materials authentic to ${timePeriod} with rich textures and detail
        ✓ ${style} artistic style applied throughout with high-resolution quality
        ✓ Enhanced environmental details, lighting, shadows, and atmospheric effects
        ✓ Zero anachronisms - everything must belong to the specified time period`;

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