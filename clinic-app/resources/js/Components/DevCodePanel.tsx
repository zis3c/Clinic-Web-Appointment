import { useCallback, useEffect, useRef, useState } from 'react';

type DevCodePanelProps = {
    title: string;
    code?: string | null;
    expiresAt?: string | null;
    label?: string;
};

export default function DevCodePanel({
    title,
    code,
    expiresAt,
    label = 'Dev-only helper',
}: DevCodePanelProps) {
    const [copied, setCopied] = useState(false);
    const autoCopiedRef = useRef(false);

    const copyCode = useCallback(async (shouldReset = true) => {
        try {
            if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
                return;
            }

            await navigator.clipboard.writeText(code);
            setCopied(true);
            if (shouldReset) {
                window.setTimeout(() => setCopied(false), 1500);
            }
        } catch {
            setCopied(false);
        }
    }, [code]);

    useEffect(() => {
        if (autoCopiedRef.current || !code) {
            return;
        }

        autoCopiedRef.current = true;
        void copyCode(false);
    }, [code, copyCode]);

    if (!code) {
        return null;
    }

    return (
        <section className="mt-6 rounded-3xl border border-amber-200/80 bg-amber-50/80 p-4 shadow-sm backdrop-blur dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">
                        {label}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold text-amber-950 dark:text-amber-50">
                        {title}
                    </h4>
                    {expiresAt && (
                        <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
                            Expires at {expiresAt}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => void copyCode()}
                    className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-400/30 dark:bg-slate-900/40 dark:text-amber-100 dark:hover:bg-slate-900/70"
                >
                    {copied ? 'Copied' : 'Copy code'}
                </button>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-amber-300/80 bg-white px-4 py-3 text-center dark:border-amber-400/30 dark:bg-slate-950/40">
                <span className="block text-[11px] font-bold uppercase tracking-[0.35em] text-amber-700 dark:text-amber-300">
                    {title}
                </span>
                <code className="mt-2 block text-3xl font-black tracking-[0.45em] text-slate-900 dark:text-white">
                    {code}
                </code>
            </div>
        </section>
    );
}
