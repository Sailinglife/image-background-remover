"use client";

import { useState, useRef, useCallback } from "react";

type ImageState = {
  original: string | null;
  processed: string | null;
  loading: boolean;
  error: string | null;
};

const MAX_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function Home() {
  const [state, setState] = useState<ImageState>({
    original: null,
    processed: null,
    loading: false,
    error: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "仅支持 PNG、JPG、WEBP 格式";
    }
    if (file.size > MAX_SIZE) {
      return "图片大小不能超过 1MB";
    }
    return null;
  };

  const processImage = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setState((prev) => ({ ...prev, error }));
      return;
    }

    // Create original preview
    const originalUrl = URL.createObjectURL(file);

    setState({
      original: originalUrl,
      processed: null,
      loading: true,
      error: null,
    });

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];

      try {
        // Call remove.bg API
        const response = await fetch("/api/remove-bg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        if (!response.ok) {
          throw new Error("图片处理失败，请重试");
        }

        const data = await response.json();
        
        setState((prev) => ({
          ...prev,
          processed: data.result,
          loading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "处理失败",
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleDownload = () => {
    if (!state.processed) return;
    
    const link = document.createElement("a");
    link.href = state.processed;
    link.download = "removed-bg.png";
    link.click();
  };

  const handleReset = () => {
    if (state.original) URL.revokeObjectURL(state.original);
    if (state.processed) URL.revokeObjectURL(state.processed);
    setState({ original: null, processed: null, loading: false, error: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            🖼️ Image Background Remover
          </h1>
          <p className="text-gray-500 mt-1">快速、免注册、即时去除图片背景</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Area */}
        {!state.original && (
          <div
            className={`drop-zone ${isDragOver ? "drag-over" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg font-medium">拖拽图片到这里</p>
              <p className="text-sm mt-2">或点击选择文件</p>
              <p className="text-xs mt-4 text-gray-400">
                支持 PNG、JPG、WEBP，最大 1MB
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{state.error}</p>
            <button
              onClick={handleReset}
              className="mt-2 text-sm text-red-500 hover:underline"
            >
              重新上传
            </button>
          </div>
        )}

        {/* Loading */}
        {state.loading && (
          <div className="mt-8 text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">处理中...</p>
          </div>
        )}

        {/* Result Preview */}
        {state.original && state.processed && !state.loading && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">处理结果</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500 mb-2">原图</p>
                <img
                  src={state.original!}
                  alt="Original"
                  className="w-full h-auto"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500 mb-2">去除背景后</p>
                <img
                  src={state.processed!}
                  alt="Processed"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                下载 PNG
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                重新上传
              </button>
            </div>
          </div>
        )}

        {/* Feature List */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            "✅ 拖拽上传",
            "✅ 点击上传",
            "✅ 双图对比",
            "✅ 一键下载",
          ].map((item) => (
            <div key={item} className="text-sm text-gray-600">
              {item}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
