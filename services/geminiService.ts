
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import type { EditedContentPart } from '../types';

// Utility function to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const transformImage = async (
  imageFile: File,
  prompt: string
): Promise<EditedContentPart[]> => {
  if (!process.env.API_KEY) {
    throw new Error('API 키가 설정되지 않았습니다. process.env.API_KEY를 설정해주세요.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const base64ImageData = await fileToBase64(imageFile);
    const mimeType = imageFile.type;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
      throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
    }

    const contentParts = response.candidates[0].content.parts;
    const editedContent: EditedContentPart[] = [];

    for (const part of contentParts) {
      if (part.text) {
        editedContent.push({ type: 'text', text: part.text });
      } else if (part.inlineData) {
        const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        editedContent.push({ type: 'image', dataUrl });
      }
    }

    if (editedContent.length === 0) {
        throw new Error('모델이 이미지나 텍스트를 반환하지 않았습니다. 프롬프트를 수정해 보세요.');
    }

    return editedContent;
  } catch (error) {
    console.error('Gemini API 호출 중 오류 발생:', error);
    if (error instanceof Error) {
        throw new Error(`이미지 변환에 실패했습니다: ${error.message}`);
    }
    throw new Error('알 수 없는 오류로 이미지 변환에 실패했습니다.');
  }
};
