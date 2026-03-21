import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

CLIENT_ID=os.getenv("CLIENT_ID")    
CLIENT_SECRET=os.getenv("CLIENT_SECRET")

print(CLIENT_ID, CLIENT_SECRET)

url = f"https://id.twitch.tv/oauth2/token?client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&grant_type=client_credentials"

res = requests.post(url)
ACCESS_TOKEN = res.json().get("access_token")

url = "https://api.igdb.com/v4/games"
headers = {
    "Client-ID": CLIENT_ID,
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "text/plain"
}

query="""
fields name, genres.name, rating;
where genres = (12);
limit 5;
"""
# 12는 RPG
# sort 정렬;
query = """
fields id, name;
sort id asc;
limit 500;
"""

res = requests.post("https://api.igdb.com/v4/genres", headers=headers, data=query)
genres = res.json()

genre_dict = {item["id"]: item["name"] for item in genres}

print(genre_dict)

res = requests.post("https://api.igdb.com/v4/platforms/", headers=headers, data=query)
platforms = res.json()

platform_dict = {item["id"]: item["name"] for item in platforms}

print(platform_dict)
