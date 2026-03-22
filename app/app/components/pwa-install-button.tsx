'use client'

import { useEffect, useState } from 'react'

type DeferredPrompt = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  };
  

export default function PwaInstallButton() {
    const [installPrompt, setInstallPrompt] = useState<DeferredPrompt | null>(null);

    useEffect(() => {
        console.log("1");
        const handleBeforeInstallPrompt = (e: Event) => {
            console.log("pwa설치 가능");
            e.preventDefault();
            setInstallPrompt(e as DeferredPrompt);
        };

        window.addEventListener("beforeinstallprompt", () => {
            handleBeforeInstallPrompt;
            console.log("2");
    });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        }
    }, []);

    const handlePWAInstall = async () => {
        if(!installPrompt) return;

        await installPrompt.prompt();

        setInstallPrompt(null);
    }

    return (
        <button onClick={handlePWAInstall} 
        disabled={!installPrompt} 
        id="pwa-install-btn"
        className="px-4 py-2 rounded text-white bg-blue-500 disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed">
        앱 설치
        </button>
    )
}