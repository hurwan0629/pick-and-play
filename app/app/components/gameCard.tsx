
type gameProps = {
    game: Game;
};

export default function GameCard({ game }: gameProps) {
    return (
        <div key={game.id} className="border p-3 rounded bg-white">
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-64 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{game.name}</h3>
              <p>{Array.isArray(game.genres) ? game.genres.join(", ") : ""}</p>
              <p>⭐ {Math.floor(game.rating*100)/100}</p>
              <p>신뢰도 {game.total_rating_count}</p>
        </div>
    )
}