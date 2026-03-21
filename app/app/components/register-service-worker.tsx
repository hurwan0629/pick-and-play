'use client'

import { useEffect } from 'react'

export default function RegisterServiceWorker() {
    useEffect(() => {
        if("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/service-worker.js")
            .then(() => console.log("SW 등록 완료"))
            .catch((err) => console.error("SW 등록 실패", err));
        }
    }, []);

    return null;
}