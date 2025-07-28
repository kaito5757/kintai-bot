export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">勤怠管理システム</h1>
        <p className="text-gray-600 mb-8">Slack連携による簡単な勤怠記録</p>
        <a
          href="/attendance"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          勤怠管理画面へ
        </a>
      </div>
    </div>
  );
}