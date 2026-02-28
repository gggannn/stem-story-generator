import React, { useState, useMemo } from 'react';
import { ReadingStory } from '@/types';
import { ArrowLeft, Printer, RefreshCw, Loader2, BookOpen, Eye, EyeOff } from 'lucide-react';
import { PinyinText } from './PinyinText';
import { CosmicVoid } from './CosmicVoid';

interface ReadingResultProps {
  story: ReadingStory;
  onBack: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

export function ReadingResult({ story, onBack, onRegenerate, isLoading }: ReadingResultProps) {
  const [showPinyin, setShowPinyin] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <CosmicVoid />
      <div className="min-h-screen py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto print:max-w-none">
        {/* Header with back button - hidden in print */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">阅读材料</span>
            </div>
            {/* Pinyin Toggle - hidden in print */}
            <button
              onClick={() => setShowPinyin(!showPinyin)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all print:hidden"
            >
              {showPinyin ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{showPinyin ? '隐藏拼音' : '显示拼音'}</span>
            </button>
          </div>
        </div>

        {/* Print Header - only visible when printing */}
        <div className="hidden print:block border-b-2 border-orange-500 pb-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">EasySTEM | 科学探险报告</span>
            <span className="text-sm text-slate-600">{today}</span>
          </div>
        </div>

        {/* Story Content - Print-optimized */}
        <div className={`bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 md:p-8 print:bg-white print:border-none print:shadow-none print:rounded-none print:p-0 ${!showPinyin ? 'hide-pinyin' : ''}`}>
          {/* Title with orange underline */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-100 mb-4 print:text-black print:font-serif">
            <PinyinText text={story.title} className="pinyin-content" />
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mb-6 print:from-slate-800"></div>

          {/* Intro */}
          <p className="text-slate-300 text-lg mb-6 text-center italic print:text-slate-700 print:leading-relaxed">
            <PinyinText text={story.reading_pack.intro} className="pinyin-content" />
          </p>

          {/* Sections */}
          <div className="space-y-8 mb-8">
            {story.reading_pack.sections.map((section, index) => (
              <div key={index} className="break-inside-avoid">
                <h2 className="text-xl font-semibold text-orange-400 mb-3 print:text-slate-800">
                  <PinyinText text={section.h} className="pinyin-content" />
                </h2>
                <p className="text-slate-300 leading-relaxed print:text-slate-700 print:leading-loose pinyin-content">
                  <PinyinText text={section.p} />
                </p>
              </div>
            ))}
          </div>

          {/* Vocabulary Box */}
          <div className="bg-slate-800/50 rounded-2xl p-5 mb-8 break-inside-avoid print:bg-white print:border-2 print:border-dashed print:border-slate-300 print:mb-6">
            <h3 className="font-semibold text-orange-400 mb-3 print:text-slate-800 print:font-bold">
              📝 词汇盒
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {story.reading_pack.vocab.map((item, index) => (
                <div key={index} className="bg-slate-900/50 rounded-xl p-3 print:bg-transparent print:border print:border-slate-200">
                  <span className="font-semibold text-orange-300 print:text-slate-800 print:font-bold pinyin-content">
                    <PinyinText text={item.term} />
                  </span>
                  <p className="text-sm text-slate-400 print:text-slate-600">{item.explain}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Section */}
          <div className="bg-slate-800/50 rounded-2xl p-5 mb-8 break-inside-avoid print:bg-white print:border-2 print:border-slate-200 print:mb-6">
            <h3 className="font-semibold text-emerald-400 mb-4 print:text-slate-800 print:font-bold">
              📝 阅读理解
            </h3>

            {/* MCQ Questions */}
            {story.reading_pack.quiz
              .filter(q => q.type === 'mcq')
              .map((q, index) => {
                const mcq = q as { type: 'mcq'; q: string; options: string[]; answer: string };
                return (
                  <div key={index} className="mb-4">
                    <p className="font-medium text-slate-200 mb-2 print:text-slate-700">
                      {index + 1}. {mcq.q}
                    </p>
                    <div className="space-y-1 ml-4">
                      {mcq.options.map((option, optIndex) => (
                        <p key={optIndex} className="text-sm text-slate-400 print:text-slate-600">
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}

            {/* Short Answer Questions */}
            {story.reading_pack.quiz
              .filter(q => q.type === 'short')
              .map((q, index) => {
                const short = q as { type: 'short'; q: string; answer_key: string };
                const mcqCount = story.reading_pack.quiz.filter(q => q.type === 'mcq').length;
                return (
                  <div key={index} className="mb-4">
                    <p className="font-medium text-slate-200 mb-2 print:text-slate-700">
                      {mcqCount + index + 1}. {short.q}
                    </p>
                    <p className="text-sm text-slate-500 italic ml-4 print:text-slate-500">
                      答案提示: {short.answer_key}
                    </p>
                  </div>
                );
              })}
          </div>

          {/* Scientific Notes Section - New Feature */}
          <div className="border-2 border-dashed border-orange-500/50 rounded-2xl p-5 mb-8 break-inside-avoid print:border-slate-300 print:mb-6">
            <h3 className="font-semibold text-orange-400 mb-4 print:text-slate-800 print:font-bold">
              🔬 探险发现 (Scientific Notes)
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-dashed border-slate-700/50 pb-2 print:border-slate-200">
                  <span className="text-slate-600 print:text-slate-400">● 我的新发现 {i}: </span>
                  <div className="h-4"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Print Footer - only visible when printing */}
          <div className="hidden print:block mt-8 pt-2 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-500">
              <span>第 1 页</span>
              <span>由 EasySTEM AI 生成</span>
            </div>
          </div>

          {/* Source Footer - hidden in print */}
          {story.source && (
            <p className="text-xs text-slate-500 text-center mt-4 print:hidden">
              来源: {story.source}
            </p>
          )}
        </div>

        {/* Action Buttons - hidden in print */}
        <div className="flex gap-3 mt-6 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FE6845] via-[#FF8C42] to-[#FFB347] text-white py-3 px-4 rounded-2xl font-semibold hover:from-[#E85A3A] hover:via-[#FF7A30] hover:to-[#FFA030] transition-all shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(254, 104, 69, 0.3)' }}
          >
            <Printer className="w-5 h-5" />
            打印
          </button>
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-slate-300 py-3 px-4 rounded-2xl font-semibold border border-slate-700 hover:bg-slate-700 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            再来一篇
          </button>
        </div>
      </div>

      {/* Ruby pinyin styles */}
      <style jsx global>{`
        /* Wrapper for each character+pinyin to ensure perfect centering */
        .pinyin-char {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          vertical-align: bottom;
          line-height: 1;
          margin: 0 0.1em;
        }
        .pinyin-char .char {
          font-size: 1em;
          line-height: 1;
        }
        .pinyin-char .pinyin {
          font-size: 0.4em;
          font-family: "Helvetica Neue", Arial, sans-serif;
          color: #64748b;
          font-weight: 500;
          text-align: center;
          line-height: 1.3;
          white-space: nowrap;
          margin-top: 0.15em;
          letter-spacing: 0;
        }
        /* Punctuation and spaces - align with bottom of characters */
        .pinyin-space {
          display: inline;
          vertical-align: bottom;
          line-height: 1;
        }
        /* Increase line height for paragraphs */
        .pinyin-content {
          line-height: 2.6 !important;
        }
        /* Hide pinyin when toggle is off */
        .hide-pinyin rt {
          display: none !important;
        }
        /* Hide pinyin when toggle is off */
        .hide-pinyin .pinyin {
          display: none !important;
        }
        /* Print mode - always show pinyin */
        @media print {
          .pinyin-char {
            line-height: 1;
            margin: 0 0.1em;
          }
          .pinyin-char .pinyin {
            color: #333333 !important;
            font-size: 0.65em !important;
            font-family: Arial, sans-serif !important;
            font-weight: 600 !important;
          }
          .pinyin-char .char {
            font-size: 1em;
          }
          .pinyin-content {
            line-height: 3.2 !important;
          }
        }
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .print\\:block {
            display: block !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:bg-white {
            background-color: white !important;
          }

          .print\\:text-black {
            color: black !important;
          }

          .print\\:text-slate-700 {
            color: #334155 !important;
          }

          .print\\:text-slate-600 {
            color: #475569 !important;
          }

          .print\\:text-slate-800 {
            color: #1e293b !important;
          }

          .print\\:border-slate-200 {
            border-color: #e2e8f0 !important;
          }

          .print\\:font-serif {
            font-family: Georgia, 'Times New Roman', serif !important;
          }

          .print\\:leading-loose {
            line-height: 1.75 !important;
          }

          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          h1 {
            font-size: 24pt !important;
            margin-bottom: 12pt !important;
          }
          h1 .pinyin-char .pinyin {
            font-size: 0.6em !important;
          }

          h2 {
            font-size: 14pt !important;
            margin-top: 12pt !important;
            margin-bottom: 8pt !important;
          }

          p {
            margin-bottom: 10pt !important;
          }
        }
      `}</style>
      </div>
    </>
  );
}
