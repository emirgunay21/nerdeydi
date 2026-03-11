function RecordModal({
  showForm,
  editingId,
  formData,
  setFormData,
  handleSave,
  closeForm,
}) {
  if (!showForm) return null

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{editingId ? "Kaydı Düzenle" : "Yeni Kayıt Ekle"}</h2>

        <input
          type="text"
          placeholder="Başlık"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />

        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        >
          <option value="Eşya">Eşya</option>
          <option value="Randevu">Randevu</option>
          <option value="Ödeme">Ödeme</option>
          <option value="Hatırlatıcı">Hatırlatıcı</option>
          <option value="Buluşma">Buluşma</option>
          <option value="Not">Not</option>
          <option value="Diğer">Diğer</option>
        </select>

        <input
          type="text"
          placeholder="Nerede / Detay"
          value={formData.where}
          onChange={(e) =>
            setFormData({ ...formData, where: e.target.value })
          }
        />

        <input
          type="datetime-local"
          value={formData.when}
          onChange={(e) => setFormData({ ...formData, when: e.target.value })}
        />

        <input
          type="text"
          placeholder="Kimle"
          value={formData.withWho}
          onChange={(e) =>
            setFormData({ ...formData, withWho: e.target.value })
          }
        />

        <textarea
          placeholder="Not"
          rows="4"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={formData.pinned}
            onChange={(e) =>
              setFormData({ ...formData, pinned: e.target.checked })
            }
          />
          <span>Önemli olarak işaretle</span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={formData.alarm}
            onChange={(e) =>
              setFormData({
                ...formData,
                alarm: e.target.checked,
                alarmTime: e.target.checked
                  ? formData.alarmTime || formData.when
                  : "",
              })
            }
          />
          <span>Alarm kur</span>
        </label>

        {formData.alarm && (
          <input
            type="datetime-local"
            value={formData.alarmTime}
            onChange={(e) =>
              setFormData({ ...formData, alarmTime: e.target.value })
            }
          />
        )}

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={closeForm}>
            İptal
          </button>

          <button className="modal-save-btn" onClick={handleSave}>
            {editingId ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecordModal