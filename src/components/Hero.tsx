import React from 'react';
import { ProblemReport } from '../types';

/** First screen in the reference layout: mixed-weight headline left, a stack of swipe cards right. */
export function Hero({ problems, onStart, onReport }: { problems: ProblemReport[]; onStart: () => void; onReport: () => void }) {
  const cards = problems.filter((p) => p.photoUrls?.length).slice(0, 3);
  return (
    <section className="relative min-h-[calc(100vh-9rem)] flex flex-col">
      <div className="flex-1 grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center py-10">
        <div>
          <p className="text-[13px] text-slate-400 mb-6">Шымкент · городские проблемы</p>
          <h1 className="text-[40px] sm:text-[56px] leading-[1.08] tracking-tight text-white">
            <span className="font-light">Решайте, что</span>
            <br />
            <span className="font-bold">починить в городе</span>
            <br />
            <span className="font-light">в первую очередь</span>
          </h1>
          <p className="text-[15px] text-slate-300 leading-relaxed mt-6 max-w-sm">
            Свайпайте городские проблемы: важные поднимаются выше и автоматически уходят в службу 109.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-9">
            <button
              onClick={onStart}
              className="px-9 py-4 rounded-full bg-cyan-400 text-[#1a1a14] text-[12px] font-bold uppercase tracking-[0.1em] shadow-[0_10px_30px_-10px_rgba(255,210,63,0.6)] hover:brightness-105 transition"
            >
              Начать свайпать
            </button>
            <button onClick={onReport} className="text-sm text-white underline underline-offset-4 decoration-white/40 hover:decoration-white">
              Сообщить о проблеме
            </button>
          </div>
        </div>

        <div className="relative h-[420px] hidden lg:block">
          {cards.map((p, i) => (
            <div
              key={p.id}
              className="absolute w-[300px] rounded-2xl overflow-hidden border border-white/10 bg-[#18213a] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)]"
              style={{ top: `${[30, 0, 60][i]}px`, left: `${[22, 2, 42][i]}%`, transform: `rotate(${[-2, -6, 5][i]}deg)`, zIndex: i === 0 ? 3 : 2 - i }}
            >
              <img src={p.photoUrls[0]} alt="" className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{p.title}</p>
                <p className="text-xs text-slate-400 mt-1 truncate">{p.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onStart} className="mx-auto mb-2 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition">
        <span className="w-4 h-6 rounded-full border border-current grid justify-items-center pt-1">
          <span className="w-0.5 h-1.5 rounded-full bg-current animate-bounce" />
        </span>
        Листайте вниз
      </button>
    </section>
  );
}
