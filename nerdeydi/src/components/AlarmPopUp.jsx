function AlarmPopup({ alarmPopup, stopAlarmForItem }) {
  if (!alarmPopup) return null

  return (
    <div className="alarm-popup">
      <div className="alarm-popup-content">
        <h3>🔔 Alarm Zamanı</h3>
        <p>
          <strong>{alarmPopup.title}</strong>
        </p>

        {alarmPopup.where && (
          <p>
            <strong>Detay:</strong> {alarmPopup.where}
          </p>
        )}

        {alarmPopup.withWho && (
          <p>
            <strong>Kimle:</strong> {alarmPopup.withWho}
          </p>
        )}

        <button onClick={() => stopAlarmForItem(alarmPopup.id)}>
          Alarmı Kapat
        </button>
      </div>
    </div>
  )
}

export default AlarmPopup