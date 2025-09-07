
import React, { useState, useCallback } from 'react';
import { transformImage } from './services/geminiService';
import type { EditedContentPart, ImagePart, TextPart } from './types';
import { ImageDisplay } from './components/ImageDisplay';
import { SparklesIcon, UploadIcon } from './components/icons';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedContent, setEditedContent] = useState<EditedContentPart[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEditedContent([]); // Clear previous results when a new image is uploaded
    }
  };

  const handleTransform = useCallback(async () => {
    if (!imageFile || !prompt) {
      setError('이미지와 지침을 모두 제공해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedContent([]);

    try {
      const result = await transformImage(imageFile, prompt);
      setEditedContent(result);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt]);

  const transformedImage = editedContent.find((part): part is ImagePart => part.type === 'image');
  const transformedText = editedContent.find((part): part is TextPart => part.type === 'text');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            AI 이미지 변환기
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            이미지를 업로드하고 지침을 입력하면 AI가 마법처럼 이미지를 편집해 드립니다.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">1. 이미지 업로드</h2>
            <label
              htmlFor="file-upload"
              className="group cursor-pointer w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center transition-colors hover:border-blue-500 hover:bg-blue-50"
            >
              {originalImageUrl ? (
                <img src={originalImageUrl} alt="업로드 미리보기" className="h-full w-full object-contain p-2" />
              ) : (
                <>
                  <UploadIcon className="w-10 h-10 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-700">파일을 선택하거나 드래그하세요</span>
                </>
              )}
            </label>
            <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            
            <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-800">2. 지침 입력</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: '배경을 밤하늘로 변경하고 고양이에게 우주 헬멧을 씌워주세요'"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 h-32 resize-none"
            />
            
            <button
              onClick={handleTransform}
              disabled={!imageFile || !prompt || isLoading}
              className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  변환 중...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  이미지 변환하기
                </>
              )}
            </button>
            {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
          </div>

          {/* Results Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageDisplay title="원본 이미지" imageUrl={originalImageUrl} />
            
            <div className="w-full">
               <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">변환된 결과</h2>
               <div className="aspect-square w-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 overflow-hidden p-4">
                  {isLoading && (
                    <div className="text-center text-gray-500">
                        <SparklesIcon className="mx-auto h-16 w-16 animate-pulse text-blue-500"/>
                        <p className="mt-2">AI가 마법을 부리고 있습니다...</p>
                    </div>
                  )}
                  {!isLoading && editedContent.length === 0 && (
                      <div className="text-center text-gray-400">
                        <SparklesIcon className="mx-auto h-16 w-16" />
                        <p className="mt-2">변환된 이미지가 여기에 표시됩니다</p>
                      </div>
                  )}
                  {!isLoading && editedContent.length > 0 && (
                    <div className="w-full h-full flex flex-col justify-center items-center gap-4">
                      {transformedImage && <img src={transformedImage.dataUrl} alt="변환된 이미지" className="max-w-full max-h-[80%] object-contain rounded-lg" />}
                      {transformedText && <p className="text-center text-sm text-gray-600 p-2 bg-blue-50 rounded-md">{transformedText.text}</p>}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
