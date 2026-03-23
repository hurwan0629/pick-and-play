"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PwaInstallButton from "./components/pwa-install-button";

type Game = {
  id: string | number;
  name: string;
  image: string | null;
  genres?: string[];
  rating?: number;
  total_rating_count?: number;
};

export default function Home() {
  const [randomGame, setRandomGame] = useState<Game | null>(null);
  const [debugMessage, setDebugMessage] = useState("");

  useEffect(() => {
    pickRandomGame();
  }, []);

  function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("game-db", 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("games")) {
          const store = db.createObjectStore("games", { keyPath: "id" });
          store.createIndex("name", "name", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getAllGames(): Promise<Game[]> {
    const db = await openDB();
    const tx = db.transaction("games", "readonly");
    const store = tx.objectStore("games");
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as Game[]);
      request.onerror = () => reject(request.error);
    });
  }

  async function getImageFromCache(gameId: string | number) {
    const cache = await caches.open("app-v1");
    const res = await cache.match(`/games-image/${gameId}`);

    if (!res) return null;

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async function pickRandomGame() {
    try {
      setDebugMessage("");

      const games = await getAllGames();

      if (!games || games.length === 0) {
        setRandomGame(null);
        setDebugMessage("저장된 게임이 없습니다. 먼저 게임 최신화를 해주세요.");
        return;
      }

      const randomIndex = Math.floor(Math.random() * games.length);
      const selectedGame = games[randomIndex];

      const imageUrl = await getImageFromCache(selectedGame.id);

      setRandomGame({
        ...selectedGame,
        image: imageUrl,
      });
    } catch (e) {
      console.log(e);
      setDebugMessage("랜덤 게임을 불러오지 못했습니다.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl border rounded-xl p-6 shadow-sm bg-white">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">랜덤 게임 추천</h1>
          <p className="text-gray-600">저장된 게임 목록에서 랜덤으로 1개를 뽑습니다.</p>

          <PwaInstallButton />

          <div className="flex gap-2">
            <button
              onClick={pickRandomGame}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              다시 뽑기
            </button>

            <Link
              href="/gamelist"
              className="px-4 py-2 border rounded"
            >
              게임 목록으로 이동
            </Link>
          </div>

          {debugMessage && (
            <p className="text-red-500 text-sm">{debugMessage}</p>
          )}

          {randomGame && (
            <div className="border rounded-lg p-4 bg-gray-50">
              {randomGame.image ? (
                <img
                  src={randomGame.image}
                  alt={randomGame.name}
                  className="w-full h-128 object-cover rounded mb-4"
                />
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500">
                  이미지 없음
                </div>
              )}

              <h2 className="text-xl font-semibold">{randomGame.name}</h2>
              <p className="mt-2">
                장르: {Array.isArray(randomGame.genres) ? randomGame.genres.join(", ") : ""}
              </p>
              <p>평점: {randomGame.rating ?? "없음"}</p>
              <p>신뢰도: {randomGame.total_rating_count ?? "없음"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}