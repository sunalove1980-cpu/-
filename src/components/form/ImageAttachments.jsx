import { useEffect, useRef, useState } from 'react';
import { resizeImageFile } from '../../utils/imageUtils.js';
import { createId } from '../../utils/id.js';
import './ImageAttachments.css';

// 인상 깊은 장면 사진 등을 여러 장 첨부할 수 있는 입력.
// 갤러리 선택과 카메라 촬영을 모두 지원하고, 원본은 리사이즈해 IndexedDB 용량을 아낀다.
export default function ImageAttachments({ images, onChange }) {
  const inputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [urlMap, setUrlMap] = useState({});

  useEffect(() => {
    const nextUrls = {};
    images.forEach((img) => {
      nextUrls[img.id] = urlMap[img.id] || URL.createObjectURL(img.blob);
    });
    setUrlMap(nextUrls);
    return () => {
      Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    setIsProcessing(true);
    try {
      const newImages = [];
      for (const file of files) {
        const blob = await resizeImageFile(file);
        newImages.push({ id: createId(), blob, caption: '', addedAt: Date.now() });
      }
      onChange([...images, ...newImages]);
    } catch (err) {
      window.alert(err.message || '이미지를 추가하지 못했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = (id) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const updateCaption = (id, caption) => {
    onChange(images.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  return (
    <div className="image-attachments">
      <div className="image-attachments__head">
        <span className="image-attachments__label">사진 첨부</span>
        <div className="image-attachments__buttons">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isProcessing}>
            <span aria-hidden="true">📷</span> {isProcessing ? '처리 중…' : '사진 추가'}
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFiles}
        className="visually-hidden"
      />
      {images.length > 0 && (
        <ul className="image-attachments__grid">
          {images.map((img) => (
            <li key={img.id} className="image-attachments__item">
              <div className="image-attachments__thumb-wrap">
                {urlMap[img.id] && <img src={urlMap[img.id]} alt={img.caption || '첨부 이미지'} />}
                <button
                  type="button"
                  className="image-attachments__remove"
                  onClick={() => removeImage(img.id)}
                  aria-label="이미지 삭제"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                className="image-attachments__caption"
                placeholder="이 장면에 대한 메모 (선택)"
                value={img.caption}
                onChange={(event) => updateCaption(img.id, event.target.value)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
