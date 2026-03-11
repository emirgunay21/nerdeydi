function getBadgeClass(category) {
  if (category === "Eşya") return "esya"
  if (category === "Randevu") return "randevu"
  if (category === "Ödeme") return "odeme"
  if (category === "Hatırlatıcı") return "hatirlatici"
  if (category === "Buluşma") return "bulusma"
  if (category === "Not") return "not"
  return "diger"
}

function ItemCard({
  item,
  openEditForm,
  handleDelete,
  handleTogglePinned,
  isUpcoming,
  isOverdue,
  formatDate,
}) {
  return (
    <div
      className={`item-card 
        ${isUpcoming(item.when) ? "upcoming" : ""} 
        ${isOverdue(item.when) ? "overdue" : ""} 
        ${item.ringing ? "ringing-card" : ""}
      `}
    >
      <div className="card-top">
        <h2>{item.title}</h2>

        <button
          className={`pin-btn ${item.pinned ? "active" : ""}`}
          onClick={() => handleTogglePinned(item.id)}
          title="Önemli olarak işaretle"
        >
          {item.pinned ? "★" : "☆"}
        </button>
      </div>

      <span className={`badge ${getBadgeClass(item.category)}`}>
        {item.category}
      </span>

      {item.alarm && <span className="alarm-badge">🔔 Alarm açık</span>}

      {item.where && (
        <>
          <div className="divider"></div>
          <p>
            <strong>Nerede / Detay:</strong> {item.where}
          </p>
        </>
      )}

      {item.when && (
        <>
          <div className="divider"></div>
          <p>
            <strong>Ne zaman:</strong> {formatDate(item.when)}
          </p>
        </>
      )}

      {item.alarm && item.alarmTime && (
        <>
          <div className="divider"></div>
          <p>
            <strong>Alarm zamanı:</strong> {formatDate(item.alarmTime)}
          </p>
        </>
      )}

      {item.withWho && (
        <>
          <div className="divider"></div>
          <p>
            <strong>Kimle:</strong> {item.withWho}
          </p>
        </>
      )}

      {item.note && (
        <>
          <div className="divider"></div>
          <p>
            <strong>Not:</strong> {item.note}
          </p>
        </>
      )}

      {item.ringing && (
        <>
          <div className="divider"></div>
          <p className="danger-text">Alarm çalıyor</p>
        </>
      )}

      {isUpcoming(item.when) && !item.ringing && (
        <>
          <div className="divider"></div>
          <p className="warning-text">Yaklaşıyor</p>
        </>
      )}

      {isOverdue(item.when) && !item.ringing && (
        <>
          <div className="divider"></div>
          <p className="danger-text">Tarihi geçmiş olabilir</p>
        </>
      )}

      <div className="divider"></div>

      <div className="card-actions">
        <button className="edit-btn" onClick={() => openEditForm(item)}>
          Düzenle
        </button>

        <button className="delete-btn" onClick={() => handleDelete(item.id)}>
          Sil
        </button>
      </div>
    </div>
  )
}

export default ItemCard