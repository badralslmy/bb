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

// إضافة محتوى إلى IndexedDB
const addContentToDB = async (content) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('content', 'readwrite');
        const store = transaction.objectStore('content');
        const request = store.add(content);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// إضافة موسم جديد
const addSeason = (seasonName = '') => {
    const seasonDiv = document.createElement('div');
    seasonDiv.className = 'season';

    const seasonNameInput = document.createElement('input');
    seasonNameInput.type = 'text';
    seasonNameInput.className = 'seasonName';
    seasonNameInput.value = seasonName;
    seasonNameInput.placeholder = 'اسم الموسم';
    seasonDiv.appendChild(seasonNameInput);

    const episodesDiv = document.createElement('div');
    episodesDiv.className = 'episodes';

    // زر إضافة حلقة
    const addEpisodeBtn = document.createElement('button');
    addEpisodeBtn.type = 'button';
    addEpisodeBtn.className = 'addEpisodeBtn';
    addEpisodeBtn.textContent = '+ إضافة حلقة';
    addEpisodeBtn.onclick = () => addEpisode(episodesDiv);
    seasonDiv.appendChild(addEpisodeBtn);

    // زر حذف الموسم
    const removeSeasonBtn = document.createElement('button');
    removeSeasonBtn.type = 'button';
    removeSeasonBtn.className = 'removeSeasonBtn';
    removeSeasonBtn.textContent = 'حذف الموسم';
    removeSeasonBtn.onclick = () => seasonDiv.remove();
    seasonDiv.appendChild(removeSeasonBtn);

    // إضافة قسم الحلقات
    seasonDiv.appendChild(episodesDiv);

    // إضافة الموسم إلى الواجهة
    document.getElementById('seasonsContainer').appendChild(seasonDiv);
};

// إضافة حلقة جديدة
const addEpisode = (episodesDiv) => {
    const episodeInput = document.createElement('input');
    episodeInput.type = 'text';
    episodeInput.className = 'episodeUrl';
    episodeInput.placeholder = 'رابط الحلقة أو اسم الحلقة';
    episodesDiv.appendChild(episodeInput);
};

// جمع بيانات المواسم
const getSeasonsData = () => {
    const seasons = [];
    document.querySelectorAll('.season').forEach(season => {
        const seasonName = season.querySelector('.seasonName').value;
        const episodes = Array.from(season.querySelectorAll('.episodeUrl')).map(episode => episode.value);
        if (seasonName && episodes.length > 0) {
            seasons.push({ seasonName, episodes });
        }
    });
    return seasons;
};

// معاينة البوسترات
document.getElementById('posterPortrait').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('posterPortraitPreview').innerHTML = `<img src="${e.target.result}" alt="معاينة البوستر العمودي">`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('posterLandscape').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('posterLandscapePreview').innerHTML = `<img src="${e.target.result}" alt="معاينة البوستر الأفقي">`;
        };
        reader.readAsDataURL(file);
    }
});

// تحميل المحتوى المراد تعديله عند التحميل
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit');
if (editId) {
    loadContentForEdit(parseInt(editId));
}

// إضافة محتوى جديد
document.getElementById('contentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const categories = Array.from(document.getElementById('categoriesSelect').selectedOptions).map(option => option.value);
    const description = document.getElementById('description').value;
    const year = document.getElementById('year').value;
    const rating = document.getElementById('rating').value;
    const posterPortraitFile = document.getElementById('posterPortrait').files[0];
    const posterLandscapeFile = document.getElementById('posterLandscape').files[0];

    if (!title || !type || !description || !year || !rating || !posterPortraitFile || !posterLandscapeFile) {
        alert('يرجى ملء جميع الحقول المطلوبة.');
        return;
    }

    const readerPortrait = new FileReader();
    const readerLandscape = new FileReader();

    readerPortrait.onload = async (e) => {
        readerLandscape.onload = async (e2) => {
            const newContent = {
                id: Date.now(),
                title,
                type,
                categories,
                description,
                year,
                rating: parseFloat(rating),
                posterPortraitUrl: e.target.result,
                posterLandscapeUrl: e2.target.result,
                seasons: type === 'series' || type === 'anime' ? getSeasonsData() : null,
                dateAdded: new Date()
            };

            try {
                await addContentToDB(newContent);
                alert('تم إضافة المحتوى بنجاح!');
                window.location.href = 'edit.html';
            } catch (error) {
                console.error('حدث خطأ أثناء إضافة المحتوى:', error);
                alert('حدث خطأ أثناء إضافة المحتوى. يرجى المحاولة مرة أخرى.');
            }
        };
        readerLandscape.readAsDataURL(posterLandscapeFile);
    };
    readerPortrait.readAsDataURL(posterPortraitFile);
});

// إظهار/إخفاء قسم المواسم عند اختيار مسلسل أو أنمي
document.querySelectorAll('input[name="type"]').forEach(input => {
    input.addEventListener('change', () => {
        if (input.value === 'series' || input.value === 'anime') {
            document.getElementById('seasonGroup').style.display = 'block';
        } else {
            document.getElementById('seasonGroup').style.display = 'none';
        }
    });
});

// إضافة موسم افتراضي عند الضغط على زر إضافة موسم
document.querySelector('.addSeasonBtn').addEventListener('click', () => addSeason());

// قائمة التصنيفات الافتراضية
const defaultCategories = ["أكشن", "دراما", "كوميدي", "رعب", "رومانسي", "خيال علمي"];

// تحميل التصنيفات في القائمة المنسدلة
const loadCategories = () => {
    const categoriesSelect = document.getElementById('categoriesSelect');
    defaultCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoriesSelect.appendChild(option);
    });
};

// إضافة تصنيف جديد
document.getElementById('addCategoryBtn').addEventListener('click', () => {
    const newCategoryInput = document.getElementById('newCategory');
    const newCategory = newCategoryInput.value.trim();

    if (newCategory) {
        const categoriesSelect = document.getElementById('categoriesSelect');
        const option = document.createElement('option');
        option.value = newCategory;
        option.textContent = newCategory;
        categoriesSelect.appendChild(option);

        // تفريغ حقل الإدخال بعد الإضافة
        newCategoryInput.value = '';
    } else {
        alert('يرجى إدخال اسم تصنيف صحيح.');
    }
});

// تحميل التصنيفات عند بدء التشغيل
window.addEventListener('load', () => {
    loadCategories();
});