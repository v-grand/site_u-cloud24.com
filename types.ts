
export interface Service {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.FC<{ className?: string }>;
}

export interface ServiceContent {
  title: string;
  detailedDescription: string;
  features: { title: string; description: string }[];
  useCase: string;
}

export type Language = 'en' | 'ru';

export type Translations = {
  [key: string]: {
    [lang in Language]: string;
  };
};
