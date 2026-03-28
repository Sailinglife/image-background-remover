'use client'

import { useState } from 'react'

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    
    if (file.size > 1024 * 1024) {
      alert('Image must be less than 1MB')
      return
    }

    // Preview original
    const reader = new FileReader()
    reader.onload = (e) => setOriginalImage(e.target?.result as string)
    reader.readAsDataURL(file)

    setLoading(true)
    setResultImage(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Failed to process image')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setResultImage(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = 'removed-bg.png'
    link.click()
  }

  const handleReset = () => {
    setOriginalImage(null)
    setResultImage(null)
  }

  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Background Remover
      </h1>
      <p className="text-gray-400 mb-8">Remove image backgrounds instantly</p>

      {!originalImage ? (
        <div className="w-full max-w-xl flex flex-col items-center gap-4">
          <label htmlFor="fileInput" className="drop-zone w-full h-64 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-500/10 transition">
            <svg className="w-16 h-16 text-indigo-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg text-gray-300">Click to select image</p>
            <p className="text-sm text-gray-500 mt-2">Max 1MB • PNG, JPG, WEBP</p>
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <p className="text-sm text-gray-400 mb-2">Original</p>
              <img src={originalImage} alt="Original" className="w-full rounded-lg" />
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <p className="text-sm text-gray-400 mb-2">Result</p>
              {loading ? (
                <div className="w-full h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : resultImage ? (
                <img src={resultImage} alt="Result" className="w-full rounded-lg" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center text-gray-500">
                  Processing...
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            {resultImage && (
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium hover:opacity-90 transition"
              >
                Download
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-700 rounded-xl font-medium hover:bg-gray-600 transition"
            >
              Upload New
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
