
export interface ImagePart {
  type: 'image';
  dataUrl: string;
}

export interface TextPart {
  type: 'text';
  text: string;
}

export type EditedContentPart = ImagePart | TextPart;
