function BottomMenu({ activeTab, setActiveTab }) {
  return (
    <div className="bottom-menu">
      <button
        className={`bottom-tab ${activeTab === "recent" ? "active" : ""}`}
        onClick={() => setActiveTab("recent")}
      >
        Son Eklenenler
      </button>

      <button
        className={`bottom-tab ${activeTab === "pinned" ? "active" : ""}`}
        onClick={() => setActiveTab("pinned")}
      >
        Önemliler
      </button>

      <button
        className={`bottom-tab ${activeTab === "reminders" ? "active" : ""}`}
        onClick={() => setActiveTab("reminders")}
      >
        Hatırlatıcılar
      </button>

      <button
        className={`bottom-tab ${activeTab === "all" ? "active" : ""}`}
        onClick={() => setActiveTab("all")}
      >
        Tümü
      </button>
    </div>
  )
}

export default BottomMenu