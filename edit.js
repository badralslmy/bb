// فتح قاعدة بيانات IndexedDB
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ContentDatabase', 3); // زيادة الإصدار إلى 3

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('content')) {
                db.createObjectStore('content', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// استرجاع جميع المحتويات من IndexedDB
const getAllContentFromDB = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('content', 'readonly');
        const store = transaction.objectStore('content');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// تحديث عرض المحتوى
const updateContentGrid = async () => {
    try {
        const content = await getAllContentFromDB();
        const contentGrid = document.getElementById('contentGrid');

        // عرض المحتوى
        contentGrid.innerHTML = content.map(item => `
            <div class="content-item">
                <img src="${item.posterPortraitUrl}" alt="${item.title}" class="content-poster">
                <div class="content-info">
                    <h3 class="content-title">${item.title}</h3>
                    <div class="content-actions">
                        <button class="edit-btn" onclick="editContent(${item.id})"><i class="fas fa-edit"></i> تعديل</button>
                        <button class="delete-btn" onclick="confirmDelete(${item.id})"><i class="fas fa-trash"></i> حذف</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('حدث خطأ أثناء عرض المحتوى:', error);
    }
};

// تأكيد الحذف
const confirmDelete = (id) => {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا المحتوى؟')) {
        deleteContent(id);
    }
};

// حذف محتوى
const deleteContent = async (id) => {
    try {
        const db = await openDB();
        const transaction = db.transaction('content', 'readwrite');
        const store = transaction.objectStore('content');
        store.delete(id);
        await updateContentGrid();
        alert('تم حذف المحتوى بنجاح!');
    } catch (error) {
        console.error('حدث خطأ أثناء الحذف:', error);
    }
};

// التحميل الأولي للمحتوى
(async () => {
    await updateContentGrid();
})();