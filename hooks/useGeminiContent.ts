
import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ServiceContent } from '../types.ts';
import { useI18n } from '../context/I18nContext.tsx';

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

const cache: { [key: string]: ServiceContent } = {};

const useGeminiContent = (serviceId: string, serviceTitle: string) => {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useI18n();

  useEffect(() => {
    const fetchContent = async () => {
      const cacheKey = `${serviceId}-${language}`;
      if (cache[cacheKey]) {
        setContent(cache[cacheKey]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const prompt = `
        Generate detailed content for a technology service page.
        The service is "${serviceTitle}".
        The target audience is developers and tech managers.
        The tone should be professional, informative, and slightly futuristic.
        Provide the response in ${language === 'ru' ? 'Russian' : 'English'}.

        Follow the JSON schema exactly.
        - "title": A catchy, expanded title for the service.
        - "detailedDescription": A 2-3 sentence paragraph explaining the service and its benefits.
        - "features": An array of 3 key features. Each feature should have a "title" and a short "description".
        - "useCase": A short paragraph describing a real-world use case for this service.
      `;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { role: 'user', parts: [{ text: prompt }] },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detailedDescription: { type: Type.STRING },
                features: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['title', 'description'],
                  },
                },
                useCase: { type: Type.STRING },
              },
              required: ['title', 'detailedDescription', 'features', 'useCase'],
            },
          },
        });

        const jsonText = response.text.trim();
        const parsedContent: ServiceContent = JSON.parse(jsonText);
        
        cache[cacheKey] = parsedContent;
        setContent(parsedContent);
      } catch (e) {
        console.error("Gemini API Error:", e);
        setError("Failed to generate content.");
      } finally {
        setLoading(false);
      }
    };

    if (serviceId && serviceTitle) {
      fetchContent();
    }
  }, [serviceId, serviceTitle, language]);

  return { content, loading, error };
};

export default useGeminiContent;
