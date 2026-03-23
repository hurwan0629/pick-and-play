from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import requests
import json


load_dotenv()
IGDB_CLIENT_ID=os.getenv("CLIENT_ID")
IGDB_CLIENT_SECRET=os.getenv("CLIENT_SECRET")

# access_token 받기
url = f"https://id.twitch.tv/oauth2/token?client_id={IGDB_CLIENT_ID}&client_secret={IGDB_CLIENT_SECRET}&grant_type=client_credentials"
res = requests.post(url)
IGDB_ACCESS_TOKEN=res.json().get('access_token')

igdb_headers={
    "Client-ID": IGDB_CLIENT_ID,
    "Authorization": f"Bearer {IGDB_ACCESS_TOKEN}",
    "Content-Type": "text/plain"
}

app = FastAPI(
    title="Game API",
    version="1.0.0",
    description="게임 추천 api 서버"
)
origins = [
    "http://localhost:3000",
    "https://friendly-palm-tree-rw6p57rjp7425gq-3000.app.github.dev",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def build_cover_url(image_id: str | None, size: str = "cover_big") -> str | None:
    if not image_id:
        return None
    return f"https://images.igdb.com/igdb/image/upload/t_{size}/{image_id}.png"

@app.get("/games")
def getGameList():
    print("[GET games요청 받음]")
    all_games=[]

    # IGDB에서 게임 데이터 받아오기 
    # id, image, name, genre, rating 받아오기
    url="https://api.igdb.com/v4/games"

    query = "fields *;"
    res = requests.post(url, headers=igdb_headers, data=query)
    res.raise_for_status()
    print(res.json()[1].keys())


    """
    fields id, name, cover.image_id, genres.name, rating, total_rating, popularity;
    where total_rating_count > 50;
    sort total_rating_count desc;
    limit 50;
    """
    query = """
    fields id, cover.image_id, name, genres.name, rating, total_rating, total_rating_count;
    where total_rating_count > 100;
    sort rating desc;
    limit 100;
    """
    """
    where category = 0
          & name != null
          & rating != null
          & cover != null
          & genres != null;
    """

    res=requests.post(url, headers=igdb_headers, data=query)
    res.raise_for_status()
    games = res.json()

    for game in games:
            all_games.append({
                "id": game.get("id"),
                "name": game.get("name"),
                "genres": [g["name"] for g in game.get("genres", [])],
                "rating": game.get("rating"),
                "image": build_cover_url(
                    game.get("cover", {}).get("image_id") if game.get("cover") else None
                ),
                "total_rating": game.get("total_rating"),
                "total_rating_count": game.get("total_rating_count"),
                # "popularity": game.get("popularity"),
                # "follows": game.get("follows")
            })
    
    return {"games": all_games}