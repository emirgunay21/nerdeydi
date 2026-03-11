import { useEffect, useMemo, useRef, useState } from "react"
import AlarmPopup from "./assets/components/AlarmPopUp.jsx"
import BottomMenu from "./assets/components/BottomMenu.jsx"
import CategoryFilter from "./assets/components/CategoryFilter.jsx"
import ItemCard from "./assets/components/ItemCard.jsx"
import RecordModal from "./assets/components/RecordModal.jsx"
import SearchBar from "./assets/components/SearchBar.jsx"

const defaultItems = [
  {
    id: 1,
    title: "Pasaport",
    category: "Eşya",
    where: "Yatak odası dolabı üst çekmecesi",
    when: "",
    alarmTime: "",
    withWho: "",
    note: "Siyah dosyanın içinde",
    pinned: true,
    alarm: false,
    notified: false,
    ringing: false,
  },
  {
    id: 2,
    title: "Veteriner Randevusu",
    category: "Randevu",
    where: "Kadıköy Veteriner Kliniği",
    when: "2026-03-20T14:00",
    alarmTime: "2026-03-20T13:30",
    withWho: "Chico",
    note: "Kontrol muayenesi",
    pinned: false,
    alarm: true,
    notified: false,
    ringing: false,
  },
  {
    id: 3,
    title: "Kira Ödemesi",
    category: "Ödeme",
    where: "Ev sahibi IBAN",
    when: "2026-03-15T12:00",
    alarmTime: "2026-03-15T10:00",
    withWho: "",
    note: "Açıklamaya daire no yaz",
    pinned: true,
    alarm: true,
    notified: false,
    ringing: false,
  },
]

const categories = [
  "Tümü",
  "Eşya",
  "Randevu",
  "Ödeme",
  "Hatırlatıcı",
  "Buluşma",
  "Not",
  "Diğer",
]

const emptyForm = {
  title: "",
  category: "Eşya",
  where: "",
  when: "",
  alarmTime: "",
  withWho: "",
  note: "",
  pinned: false,
  alarm: false,
}

function App() {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem("ladesItems")
    return savedItems ? JSON.parse(savedItems) : defaultItems
  })

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ladesTheme") || "light"
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tümü")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [activeTab, setActiveTab] = useState("all")
  const [alarmPopup, setAlarmPopup] = useState(null)

  const audioContextRef = useRef(null)
  const alarmIntervalRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem("ladesItems", JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem("ladesTheme", theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const playSingleBeep = () => {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext

      if (!AudioContextClass) return

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass()
      }

      const audioContext = audioContextRef.current

      if (audioContext.state === "suspended") {
        audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.22,
        audioContext.currentTime + 0.02
      )
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.35
      )

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.35)
    } catch (error) {
      console.error("Alarm sesi çalınamadı:", error)
    }
  }

  const startAlarmSound = () => {
    stopAlarmSound()
    playSingleBeep()

    alarmIntervalRef.current = setInterval(() => {
      playSingleBeep()
    }, 900)
  }

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current)
      alarmIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => stopAlarmSound()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()

      setItems((prevItems) => {
        let changed = false
        let triggeredItem = null

        const updatedItems = prevItems.map((item) => {
          if (!item.alarm || !item.alarmTime || item.notified) return item

          const alarmDate = parseDate(item.alarmTime)
          if (!alarmDate) return item

          const diff = alarmDate.getTime() - now

          if (diff <= 0 && diff > -60000) {
            changed = true
            triggeredItem = item

            return {
              ...item,
              notified: true,
              ringing: true,
            }
          }

          return item
        })

        if (triggeredItem) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Lades Hatırlatma", {
              body: `${triggeredItem.title} alarm zamanı geldi.`,
            })
          }

          setAlarmPopup(triggeredItem)
          startAlarmSound()
        }

        return changed ? updatedItems : prevItems
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const filteredItems = useMemo(() => {
    let result = [...items]

    result = result.filter((item) => {
      const matchesCategory =
        selectedCategory === "Tümü" || item.category === selectedCategory

      const searchValue = searchTerm.toLowerCase().trim()

      const matchesSearch =
        item.title.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue) ||
        item.where.toLowerCase().includes(searchValue) ||
        item.when.toLowerCase().includes(searchValue) ||
        item.alarmTime.toLowerCase().includes(searchValue) ||
        item.withWho.toLowerCase().includes(searchValue) ||
        item.note.toLowerCase().includes(searchValue)

      return matchesCategory && matchesSearch
    })

    if (activeTab === "recent") {
      result.sort((a, b) => b.id - a.id)
    } else if (activeTab === "pinned") {
      result = result.filter((item) => item.pinned)
      result.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.id - a.id)
    } else if (activeTab === "reminders") {
      result = result.filter((item) => item.when || item.alarmTime)
      result.sort((a, b) => {
        const aDate = parseDate(a.alarmTime || a.when)
        const bDate = parseDate(b.alarmTime || b.when)
        if (!aDate && !bDate) return b.id - a.id
        if (!aDate) return 1
        if (!bDate) return -1
        return aDate.getTime() - bDate.getTime()
      })
    } else {
      result.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.id - a.id)
    }

    return result
  }, [items, searchTerm, selectedCategory, activeTab])

  const openAddForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (item) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      category: item.category,
      where: item.where,
      when: item.when,
      alarmTime: item.alarmTime || "",
      withWho: item.withWho,
      note: item.note,
      pinned: !!item.pinned,
      alarm: !!item.alarm,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  const handleDelete = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const handleTogglePinned = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      )
    )
  }

  const stopAlarmForItem = (id) => {
    stopAlarmSound()
    setAlarmPopup(null)

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, ringing: false } : item
      )
    )
  }

  const handleSave = () => {
    if (!formData.title.trim()) return

    const cleanedData = {
      title: formData.title.trim(),
      category: formData.category,
      where: formData.where.trim(),
      when: formData.when,
      alarmTime: formData.alarm ? formData.alarmTime : "",
      withWho: formData.withWho.trim(),
      note: formData.note.trim(),
      pinned: formData.pinned,
      alarm: formData.alarm,
      notified: false,
      ringing: false,
    }

    if (editingId) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...cleanedData,
              }
            : item
        )
      )
    } else {
      const newRecord = {
        id: Date.now(),
        ...cleanedData,
      }

      setItems((prevItems) => [newRecord, ...prevItems])
    }

    closeForm()
    setSelectedCategory("Tümü")
    setSearchTerm("")
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "lades-kayitlar.json"
    link.click()

    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result)
        if (!Array.isArray(parsed)) {
          alert("Geçersiz dosya formatı.")
          return
        }

        const normalized = parsed.map((item) => ({
          id: item.id || Date.now() + Math.random(),
          title: item.title || "",
          category: item.category || "Diğer",
          where: item.where || "",
          when: item.when || "",
          alarmTime: item.alarmTime || "",
          withWho: item.withWho || "",
          note: item.note || "",
          pinned: !!item.pinned,
          alarm: !!item.alarm,
          notified: false,
          ringing: false,
        }))

        setItems(normalized)
        alert("Kayıtlar başarıyla içe aktarıldı.")
      } catch {
        alert("Dosya okunamadı. Geçerli bir JSON dosyası seç.")
      }
    }

    reader.readAsText(file)
    event.target.value = ""
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <h1 className="logo-title">Lades</h1>

          <div className="hero-actions">
            <button className="ghost-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            <button className="ghost-btn" onClick={handleExport}>
              Dışa Aktar
            </button>

            <button className="ghost-btn" onClick={handleImportClick}>
              İçe Aktar
            </button>

            <button className="add-btn" onClick={openAddForm}>
              + Yeni Kayıt Ekle
            </button>
          </div>
        </div>

        <p>Unutmamak için kaydet</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
      </header>

      <main className="container">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="card-grid">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              openEditForm={openEditForm}
              handleDelete={handleDelete}
              handleTogglePinned={handleTogglePinned}
              isUpcoming={isUpcoming}
              isOverdue={isOverdue}
              formatDate={formatDate}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <h3>Hiç kayıt bulunamadı</h3>
            <p>Arama veya kategoriye uygun kayıt yok.</p>
          </div>
        )}

        <BottomMenu activeTab={activeTab} setActiveTab={setActiveTab} />

        <RecordModal
          showForm={showForm}
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          handleSave={handleSave}
          closeForm={closeForm}
        />

        <AlarmPopup alarmPopup={alarmPopup} stopAlarmForItem={stopAlarmForItem} />
      </main>
    </div>
  )
}

export default App