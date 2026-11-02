// 세션의 글(top-level + 답글)을 TXT/CSV로 내보내기 위한 공통 로직.
// 자유 게시판 구간은 글 하나하나로, 워드클라우드 질문 구간은 빈도 요약으로 정리한다.
// (담당자에게 공유할 때 워드클라우드는 개별 글보다 '단어 — 횟수' 요약이 훨씬 유용하다.)
import { tally } from './wordcloud';
import { formatTime } from './dates';

/** 질문 단위(또는 질문 없는 자유 글)로 top-level 글을 순서대로 묶는다. */
function groupByQuestion(top) {
  const order = [];
  const groups = new Map();
  for (const m of top) {
    const key = m.questionId || '_free';
    if (!groups.has(key)) {
      groups.set(key, { questionText: m.questionText, questionType: m.questionType, messages: [] });
      order.push(key);
    }
    groups.get(key).messages.push(m);
  }
  return order.map((key) => groups.get(key));
}

export function buildExportText({ title, top, repliesByParent }) {
  const groups = groupByQuestion(top);
  const lines = [title, `총 ${top.length}개의 글`, '─'.repeat(40)];

  for (const g of groups) {
    lines.push('');
    lines.push(g.questionText ? `[질문] ${g.questionText}${g.questionType === 'wordcloud' ? ' (워드클라우드)' : ''}` : '[자유 게시판]');

    if (g.questionType === 'wordcloud') {
      for (const w of tally(g.messages)) lines.push(`  ${w.text}  —  ${w.count}회`);
    } else {
      for (const m of g.messages) {
        lines.push(`  [${formatTime(m.createdAt)}] ${m.name}: ${m.text}  ♥${m.likes || 0}`);
        for (const r of repliesByParent.get(m.id) ?? []) {
          lines.push(`      ↳ [${formatTime(r.createdAt)}] ${r.name}: ${r.text}  ♥${r.likes || 0}`);
        }
      }
    }
  }
  return lines.join('\n');
}

export function buildExportCsv({ top, repliesByParent }) {
  const esc = (s) => `"${String(s ?? '').replaceAll('"', '""')}"`;
  const groups = groupByQuestion(top);
  const rows = [['구분', '질문', '시간', '이름', '내용', '좋아요']];

  for (const g of groups) {
    const qLabel = g.questionText || '';
    if (g.questionType === 'wordcloud') {
      for (const w of tally(g.messages)) {
        rows.push([esc('워드클라우드 요약'), esc(qLabel), esc(''), esc(''), esc(`${w.text} (${w.count}회)`), esc('')]);
      }
    } else {
      for (const m of g.messages) {
        rows.push([esc(m.questionId ? '답변' : '글'), esc(qLabel), esc(formatTime(m.createdAt)), esc(m.name), esc(m.text), esc(m.likes || 0)]);
        for (const r of repliesByParent.get(m.id) ?? []) {
          rows.push([esc('답글'), esc(qLabel), esc(formatTime(r.createdAt)), esc(r.name), esc(r.text), esc(r.likes || 0)]);
        }
      }
    }
  }
  // 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다.
  return `﻿${rows.map((r) => r.join(',')).join('\n')}`;
}
