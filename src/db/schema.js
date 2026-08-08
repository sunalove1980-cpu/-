// IndexedDB 스키마 정의
//
// 이 앱은 회원가입/서버 없이 브라우저의 IndexedDB에만 데이터를 저장한다.
// 앱을 완전히 종료했다가 다시 열어도(핸드폰 재부팅 포함) 기록이 그대로 남아있는 이유가 이것이다.
// (localStorage와 달리 이미지 같은 큰 바이너리(Blob)도 안전하게 저장할 수 있다.)
//
// records 스토어의 레코드 형태:
// {
//   id: string,                 // uuid
//   type: 'movie' | 'drama' | 'book',   // 영화 / 드라마 / 책 (src/utils/recordTypes.js 참고)
//   title: string,              // 제목
//   creator: string,            // 감독/연출 또는 작가 (선택)
//   genre: string,              // 장르/태그 (선택, 콤마로 여러 개 입력 가능)
//   watchedOn: string,          // 감상(관람/완독)한 날짜, YYYY-MM-DD
//   rating: number,             // 내 별점 0~5 (0.5 단위)
//   synopsis: string,           // 줄거리
//   review: string,             // 총평/느낀점
//   memorableScene: string,     // 인상 깊었던 장면 묘사
//   images: [                   // 첨부 이미지 (인상 깊은 장면 사진 등)
//     { id: string, blob: Blob, caption: string, addedAt: number }
//   ],
//   createdAt: number,          // epoch ms
//   updatedAt: number,          // epoch ms
// }
export const DB_NAME = 'gamsang-note-db';
export const DB_VERSION = 1;
export const STORE_RECORDS = 'records';
export const STORE_META = 'meta';
