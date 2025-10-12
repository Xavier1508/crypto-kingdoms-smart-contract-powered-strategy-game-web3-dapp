import GameMap from "../components/GameMap";

const HomePage = () => {
  return (
    <main className="w-full h-screen bg-gray-800 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Crypto Kingdoms</h1>
      <div className="border-4 border-gray-600">
        <GameMap />
      </div>
    </main>
  );
};

export default HomePage;