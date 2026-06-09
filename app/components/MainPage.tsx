interface MainPageProps {
  title: string;
  description: string;
}

export default function MainPage({ title, description }: MainPageProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-2xl transition-shadow">
      <h2 className="text-xl font-bold text-orange-800">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>
      <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
        Completar 🔥
      </button>
    </div>
  );
}