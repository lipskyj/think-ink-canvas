import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowLeft, ArrowRight, Home, Play } from "lucide-react";
import { DEMO_STEPS } from "@/lib/demoSteps";

export default function Walkthrough() {
  const [idx, setIdx] = useState(0);
  const step = DEMO_STEPS[idx];
  const total = DEMO_STEPS.length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="text-center mb-8">
          <span className="pill-chip pill-chip-coral mb-3 inline-block">דוגמה מקצה לקצה</span>
          <h1 className="display-huge mb-2">איך נראה תהליך שלם?</h1>
          <p className="font-hand text-lg text-muted-foreground">
            צופים בקבוצה שעוברת מבעיה ("תלמידים נכשלים במתמטיקה") עד להגשת אפליקציה. שלב אחרי שלב.
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-6 flex-wrap">
          {DEMO_STEPS.map((s, i) => (
            <button
              key={s.num}
              onClick={() => setIdx(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === idx ? "w-8 bg-foreground" : i < idx ? "w-2.5 bg-foreground/60" : "w-2.5 bg-foreground/20"
              }`}
              aria-label={`שלב ${s.num}`}
              title={s.title}
            />
          ))}
        </div>

        <div className="sketch-card p-6 md:p-8 mb-6 bg-background animate-fade-in" key={step.num}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`pill-chip ${step.phaseColor}`}>{step.phase}</span>
            <span className="pill-chip pill-chip-outline">שלב {step.num} מתוך {total}</span>
          </div>
          <h2 className="display-huge mb-3">{step.title}</h2>
          <p className="font-hand text-lg text-foreground/75 mb-5 leading-snug">
            <strong>מה עושים:</strong> {step.what}
          </p>
          <div className="sketch-border-thin p-4 md:p-5 bg-secondary/30">
            <div className="text-xs font-sketch tracking-wider uppercase text-muted-foreground mb-3">
              מה הקבוצה כתבה
            </div>
            {step.output}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="sketch-btn-outline inline-flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-4 w-4" />
            הקודם
          </button>

          {idx === total - 1 ? (
            <Link to="/" className="sketch-btn inline-flex items-center gap-2">
              <Home className="h-4 w-4" /> חזרה למפת השלבים
            </Link>
          ) : (
            <button onClick={() => setIdx(Math.min(total - 1, idx + 1))} className="sketch-btn inline-flex items-center gap-2">
              סיימתי, המשך הלאה
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="text-center mt-10">
          <Link to="/user-persona" className="sketch-btn-outline inline-flex items-center gap-2">
            <Play className="h-4 w-4" /> מוכנים? התחילו תהליך אמיתי משלכם
          </Link>
        </div>
      </div>
    </Layout>
  );
}
