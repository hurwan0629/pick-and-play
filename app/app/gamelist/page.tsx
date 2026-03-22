"use client";

import { useState, useEffect } from "react";

export default function GamelistPage() {
  const [debugMessage, setDebugMessage] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  type Game = {
    id: string | number;
    name: string;
    image: string | null;
    genres?: string[];
    rating?: number;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const gameDatas = await getAllGames();
  
        const gamesWithImages = await Promise.all(
          gameDatas.map(async (game: any) => {
            const imageUrl = await getImageFromCache(game.id);
            return {
              ...game,
              image: imageUrl,
            };
          })
        );
  
        setGames(gamesWithImages);
      } catch (e) {
        console.log(e);
        setDebugMessage("저장된 게임을 불러오지 못했습니다.");
      }
    };
  
    init();
  }, []);

  // 첫 로딩 시 캐시에서 게임들 가져오기
  function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("game-db", 1);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        if (!db.objectStoreNames.contains("games")) {
          // db에 games 테이블(객체 저장소)없으면 id를 키로 생성
          const store = db.createObjectStore("games", { keyPath: "id" });
          // name를 통해 검색할걸 대비하여 name에 인덱스 걸기
          store.createIndex("name", "name", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getAllGames(): Promise<any[]> {
    const indexedDB = await openDB();
    const tx = indexedDB.transaction("games", "readonly");
    const store = tx.objectStore("games");
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveGame(game: any) {
    console.log(`게임 저장 ${game.id}`);
    const indexedDB = await openDB();
    const tx = indexedDB.transaction("games", "readwrite");
    const store = tx.objectStore("games");

    game.image = null;

    store.put(game);
  }

  // 이미지 캐싱 함수
  const saveImageToCache = async function (
    cache: any,
    gameId: string,
    imageUrl: string,
  ) {
    try {
      if (imageUrl) {
        const res = await fetch(imageUrl, { mode: "cors" });
        if (!res.ok) {
          console.log("이미지 캐시에 저장중 오류 발생");
          console.log(`이미지 주소: [${imageUrl}]`);
          return;
        }
        cache.put(`/games-image/${gameId}`, res.clone());
      }
    } catch (e) {
      console.log("이미지 캐시에 저장중 오류 발생");
      console.log(`이미지 주소: [${imageUrl}]`);
      console.log(e);
    }
  };

  const getImageFromCache = async function (gameId: string | number) {
    const cache = await caches.open("app-v1");
    const res = await cache.match(`/games-image/${gameId}`);

    if (!res) {
      return null;
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };

  // 게임 최신화하기
  const cacheRefresh = async () => {
    console.log("게임 목록 캐시 업데이트하기");
    const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    try {
      const res = await fetch(`${apiUrl}/games`, {
        method: "GET",
      });
      const data = await res.json();
      setGames(data.games);

      const cache = await caches.open("app-v1");

      data.games.map(function (game: any, idx: number) {
        saveGame(game);
        saveImageToCache(cache, game.id, game.image);
      });
    } catch (e) {
      console.log("최신화 요청중 오류 발생");
      console.log(e);
      setDebugMessage("최신화도중 오류가 발생했습니다.");
    }
  };

  // 캐시에서 게임 리스트 가져오기
  // 게임 이미지, 이름, 장르, 평점, ... 을 카드 형태로 #game-containier에 넣기기
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 상단 고정 영역 */}
      <div className="sticky top-0 z-10 border-b bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="게임을 검색하세요"
            className="w-[260px] border p-2 rounded"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            검색
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={cacheRefresh}
          >
            게임 최신화하기
          </button>
        </div>

        {debugMessage && (
          <p className="mt-2 text-sm text-red-500">{debugMessage}</p>
        )}
      </div>

      {/* 아래 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game: any) => (
            <div key={game.id} className="border p-3 rounded bg-white">
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-64 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{game.name}</h3>
              <p>{Array.isArray(game.genres) ? game.genres.join(", ") : ""}</p>
              <p>⭐ {game.rating}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
