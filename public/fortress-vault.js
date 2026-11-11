/* Keeps Fortress and tenant records on this device. A cache clear does not remove them. */
(function () {
  var DB_NAME = 'fortress-ceo-vault'
  var STORE = 'records'

  function keep(key) {
    key = String(key || '')
    return (
      key.indexOf('fortress-') === 0 ||
      key.indexOf('prixburg') === 0 ||
      key.indexOf('tenant:') === 0
    )
  }

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error('no indexedDB'))
        return
      }
      var request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = function () {
        var db = request.result
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
      }
      request.onsuccess = function () {
        resolve(request.result)
      }
      request.onerror = function () {
        reject(request.error)
      }
    })
  }

  function putRecord(db, key, value) {
    return new Promise(function (resolve) {
      try {
        var tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put({ value: String(value), savedAt: Date.now() }, key)
        tx.oncomplete = function () {
          resolve()
        }
        tx.onerror = function () {
          resolve()
        }
      } catch (err) {
        resolve()
      }
    })
  }

  function readAll(db) {
    return new Promise(function (resolve) {
      var rows = []
      try {
        var tx = db.transaction(STORE, 'readonly')
        var request = tx.objectStore(STORE).openCursor()
        request.onsuccess = function () {
          var cursor = request.result
          if (!cursor) return
          rows.push({ key: cursor.key, record: cursor.value })
          cursor.continue()
        }
        tx.oncomplete = function () {
          resolve(rows)
        }
        tx.onerror = function () {
          resolve(rows)
        }
      } catch (err) {
        resolve(rows)
      }
    })
  }

  var nativeSet = Storage.prototype.setItem
  Storage.prototype.setItem = function (key, value) {
    nativeSet.call(this, key, value)
    if (this !== window.localStorage || !keep(key) || !window.__fortressVaultDb) return
    putRecord(window.__fortressVaultDb, key, value)
  }

  window.fortressVaultReady = openDb()
    .then(function (db) {
      window.__fortressVaultDb = db
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(function () {})
      }
      return readAll(db).then(function (rows) {
        rows.forEach(function (row) {
          if (!row || !keep(row.key) || !row.record) return
          var current = null
          try {
            current = localStorage.getItem(row.key)
          } catch (err) {
            current = null
          }
          if (current == null && row.record.value != null) {
            try {
              nativeSet.call(localStorage, row.key, row.record.value)
            } catch (err) {
              /* The device vault still holds the record. */
            }
          }
        })
      })
    })
    .catch(function () {})
})()
