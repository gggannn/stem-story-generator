import React from 'react';
import { pinyin } from 'pinyin-pro';

interface PinyinTextProps {
  text: string;
  className?: string;
}

/**
 * Check if a character is Chinese using charCodeAt for proper Unicode comparison
 */
function isChinese(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x4e00 && code <= 0x9fa5;
}

/**
 * Check if a character is punctuation
 * Includes Chinese punctuation and common English punctuation
 */
function isPunctuation(char: string): boolean {
  // Chinese punctuation ranges
  const code = char.charCodeAt(0);
  if (code >= 0x3000 && code <= 0x303f) return true; // CJK symbols and punctuation
  if (code >= 0xff00 && code <= 0xffef) return true;  // Fullwidth forms
  if (code >= 0x2000 && code <= 0x206f) return true; // General punctuation

  // Common ASCII punctuation
  return /[.,!?;:'"()[\]{}<>@#$%^&*\\/_+=|`~]/.test(char);
}

/**
 * PinyinText 组件 - 自动为汉字标注拼音
 *
 * 使用方法: <PinyinText text="飞机为什么能飞上天？" />
 *
 * 输出: 仅汉字(\u4e00-\u9fa5)使用 flex 容器，标点符号与汉字底部对齐
 */
export function PinyinText({ text, className = '' }: PinyinTextProps) {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < text.length) {
    const char = text[i];

    // Use charCodeAt to properly check if character is in Chinese range
    if (isChinese(char)) {
      const py = pinyin(char);
      elements.push(
        <span key={key++} className="pinyin-char">
          <span className="pinyin">{py}</span>
          <span className="char">{char}</span>
        </span>
      );
    } else {
      // All other characters: punctuation, spaces, symbols
      elements.push(
        <span key={key++} className="pinyin-space">
          {char}
        </span>
      );
    }
    i++;
  }

  return (
    <span className={className}>
      {elements}
    </span>
  );
}

/**
 * 纯函数版本: 将文本转换为带拼音的 HTML 字符串
 * 用于 dangerouslySetInnerHTML 或服务端渲染
 */
export function toPinyinHtml(text: string): string {
  if (!text) return text;

  const result: string[] = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Use charCodeAt to properly check if character is in Chinese range
    if (isChinese(char)) {
      const py = pinyin(char);
      result.push(`<span class="pinyin-char"><span class="pinyin">${py}</span><span class="char">${char}</span></span>`);
    } else if (isPunctuation(char)) {
      // Punctuation: wrap in span with baseline alignment
      result.push(`<span class="pinyin-punct">${char}</span>`);
    } else {
      // All other characters: plain text, no wrapper
      result.push(char);
    }
    i++;
  }

  return result.join('');
}
