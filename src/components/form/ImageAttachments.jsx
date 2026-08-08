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
  const urlMapRef = useRef(urlMap);
  urlMapRef.current = urlMap;

  // 이미지별 미리보기 object URL 관리.
  // 새로 추가된 이미지에만 URL을 만들고, 목록에서 빠진 이미지의 URL만 골라서 해제한다
  // (표시 중인 URL까지 한꺼번에 해제하면 기존 썸네일이 깨진다).
  useEffect(() => {
    setUrlMap((prev) => {
      const next = {};
      images.forEach((img) => {
        next[img.id] = prev[img.id] || URL.createObjectURL(img.blob);
      });
      Object.entries(prev).forEach(([id, url]) => {
        if (!next[id]) URL.revokeObjectURL(url);
      });
      return next;
    });
  }, [images]);

  // 컴포넌트가 사라질 때(폼 닫기 등) 남아있는 URL을 모두 해제한다.
  useEffect(() => {
    return () => {
      Object.values(urlMapRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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
      {/* capture 속성을 붙이면 안드로이드에서 카메라만 강제로 열려 갤러리 선택이 막히므로,
          속성 없이 두어 브라우저가 '카메라 / 갤러리' 선택지를 띄우게 한다. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
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
