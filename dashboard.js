// API Keys
const TMDB_API_KEY = '20fd5728c4cc777d323ce53d34299c39';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMGZkNTcyOGM0Y2M3NzdkMzIzY2U1M2QzNDI5OWMzOSIsInN1YiI6IjY3NzU4YjM0MDliODBmOWJiMzEyODI1MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.niUZYHKjlGkW-cQUdkwvaZtxYRm6a-K82t57bGkLOdU';
const FANART_API_KEY = '2adb3d3494a5992ebbaf2ada4c313189';
const DOODSTREAM_API_KEY = '484294yyf6qj9dcxgf57n3';

// فتح قاعدة بيانات IndexedDB
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ContentDatabase', 3); // زيادة الإصدار إلى 3

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('content')) {
                db.createObjectStore('content', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('sections')) {
                db.createObjectStore('sections', { keyPath: 'id' });
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

// تحديث محتوى في IndexedDB
const updateContentInDB = async (content) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('content', 'readwrite');
        const store = transaction.objectStore('content');
        const request = store.put(content);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// حذف محتوى من IndexedDB
const deleteContentFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('content', 'readwrite');
        const store = transaction.objectStore('content');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// استرجاع جميع الأقسام من IndexedDB
const getAllSectionsFromDB = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('sections', 'readonly');
        const store = transaction.objectStore('sections');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// إضافة قسم إلى IndexedDB
const addSectionToDB = async (section) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('sections', 'readwrite');
        const store = transaction.objectStore('sections');
        const request = store.add(section);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// حذف قسم من IndexedDB
const deleteSectionFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('sections', 'readwrite');
        const store = transaction.objectStore('sections');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// المحتوى المضاف (محاكاة قاعدة البيانات)
let contentDatabase = [];

// تحميل المحتوى من IndexedDB عند التحميل الأولي
(async () => {
    try {
        contentDatabase = await getAllContentFromDB();
        updateContentGrid();
        updateSectionsList();
        updateDashboardStats();
    } catch (error) {
        console.error('حدث خطأ أثناء تحميل المحتوى:', error);
    }
})();

// عناصر DOM
const contentForm = document.getElementById('contentForm');
const contentGrid = document.getElementById('contentGrid');
const posterPortraitInput = document.getElementById('posterPortrait');
const posterLandscapeInput = document.getElementById('posterLandscape');
const posterPortraitPreview = document.getElementById('posterPortraitPreview');
const posterLandscapePreview = document.getElementById('posterLandscapePreview');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const notification = document.getElementById('notification');
const seasonGroup = document.getElementById('seasonGroup');
const seasonsContainer = document.getElementById('seasonsContainer');
const sectionForm = document.getElementById('sectionForm');
const sectionsList = document.getElementById('sectionsList');
const doodstreamEmbedInput = document.getElementById('doodstreamEmbed'); // حقل DoodStream Embed

// معاينة البوسترين
if (posterPortraitInput) {
    posterPortraitInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                posterPortraitPreview.innerHTML = `<img src="${e.target.result}" alt="معاينة البوستر العمودي">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

if (posterLandscapeInput) {
    posterLandscapeInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                posterLandscapePreview.innerHTML = `<img src="${e.target.result}" alt="معاينة البوستر الأفقي">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// إظهار/إخفاء قسم المواسم عند اختيار مسلسل
if (document.querySelectorAll('input[name="type"]')) {
    document.querySelectorAll('input[name="type"]').forEach(input => {
        input.addEventListener('change', () => {
            if (input.value === 'series') {
                seasonGroup.style.display = 'block';
            } else {
                seasonGroup.style.display = 'none';
            }
        });
    });
}

// إضافة موسم جديد
function addSeason() {
    const seasonDiv = document.createElement('div');
    seasonDiv.className = 'season';

    const seasonNameInput = document.createElement('input');
    seasonNameInput.type = 'text';
    seasonNameInput.className = 'seasonName';
    seasonNameInput.placeholder = 'اسم الموسم';
    seasonDiv.appendChild(seasonNameInput);

    const episodesDiv = document.createElement('div');
    episodesDiv.className = 'episodes';

    const addEpisodeBtn = document.createElement('button');
    addEpisodeBtn.type = 'button';
    addEpisodeBtn.className = 'addEpisodeBtn';
    addEpisodeBtn.textContent = '+ إضافة حلقة';
    addEpisodeBtn.onclick = () => addEpisode(episodesDiv);
    episodesDiv.appendChild(addEpisodeBtn);

    seasonDiv.appendChild(episodesDiv);

    const removeSeasonBtn = document.createElement('button');
    removeSeasonBtn.type = 'button';
    removeSeasonBtn.className = 'removeSeasonBtn';
    removeSeasonBtn.textContent = 'حذف الموسم';
    removeSeasonBtn.onclick = () => seasonDiv.remove();
    seasonDiv.appendChild(removeSeasonBtn);

    seasonsContainer.appendChild(seasonDiv);
}

// إضافة حلقة جديدة
function addEpisode(episodesDiv) {
    const episodeInput = document.createElement('input');
    episodeInput.type = 'text';
    episodeInput.className = 'episodeUrl';
    episodeInput.placeholder = 'رابط الحلقة';
    episodesDiv.insertBefore(episodeInput, episodesDiv.lastChild);
}

// إضافة موسم افتراضي عند التحميل
if (document.querySelector('.addSeasonBtn')) {
    document.querySelector('.addSeasonBtn').addEventListener('click', addSeason);
}

// إضافة محتوى جديد
if (contentForm) {
    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // جمع البيانات من النموذج
        const title = document.getElementById('title').value;
        const type = document.querySelector('input[name="type"]:checked').value;
        const categories = Array.from(document.querySelectorAll('.categories-group input:checked'))
            .map(input => input.value);
        const description = document.getElementById('description').value;
        const year = document.getElementById('year').value;
        const rating = document.getElementById('rating').value;
        const doodstreamEmbed = document.getElementById('doodstreamEmbed').value; // DoodStream Embed
        const posterPortraitFile = posterPortraitInput.files[0];
        const posterLandscapeFile = posterLandscapeInput.files[0];

        // التحقق من ملء جميع الحقول
        if (!title || !type || !description || !year || !rating || !posterPortraitFile || !posterLandscapeFile || !doodstreamEmbed) {
            showNotification('يرجى ملء جميع الحقول المطلوبة.', 'error');
            return;
        }

        // جمع بيانات المواسم والحلقات (للمسلسلات فقط)
        let seasons = [];
        if (type === 'series') {
            const seasonElements = document.querySelectorAll('.season');
            seasonElements.forEach(season => {
                const seasonName = season.querySelector('.seasonName').value;
                const episodes = Array.from(season.querySelectorAll('.episodeUrl')).map(episode => episode.value);
                if (seasonName && episodes.length > 0) {
                    seasons.push({ seasonName, episodes });
                }
            });
        }

        // إنشاء كائن المحتوى
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
                    doodstreamEmbed, // إضافة DoodStream Embed
                    posterPortraitUrl: e.target.result,
                    posterLandscapeUrl: e2.target.result,
                    seasons: type === 'series' ? seasons : null,
                    dateAdded: new Date()
                };

                try {
                    // إضافة المحتوى للقاعدة
                    await addContentToDB(newContent);
                    contentDatabase.push(newContent);

                    // تحديث العرض
                    updateContentGrid();
                    updateDashboardStats();

                    // مسح النموذج
                    contentForm.reset();
                    posterPortraitPreview.innerHTML = '';
                    posterLandscapePreview.innerHTML = '';
                    seasonsContainer.innerHTML = '';
                    addSeason();

                    // رسالة نجاح
                    showNotification('تم إضافة المحتوى بنجاح!', 'success');
                } catch (error) {
                    console.error('حدث خطأ أثناء إضافة المحتوى:', error);
                    showNotification('حدث خطأ أثناء إضافة المحتوى. يرجى المحاولة مرة أخرى.', 'error');
                }
            };
            if (posterLandscapeFile) {
                readerLandscape.readAsDataURL(posterLandscapeFile);
            }
        };

        if (posterPortraitFile) {
            readerPortrait.readAsDataURL(posterPortraitFile);
        }
    });
}

// تحديث عرض المحتوى
function updateContentGrid(filter = 'all', searchQuery = '', sortBy = 'dateAdded') {
    let filteredContent = contentDatabase;

    // التصفية حسب النوع
    if (filter !== 'all') {
        filteredContent = contentDatabase.filter(item => item.type === filter);
    }

    // البحث حسب العنوان
    if (searchQuery) {
        filteredContent = filteredContent.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // الترتيب
    if (sortBy === 'rating') {
        filteredContent.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'year') {
        filteredContent.sort((a, b) => b.year - a.year);
    } else {
        filteredContent.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    if (contentGrid) {
        contentGrid.innerHTML = filteredContent.map(item => `
            <div class="content-item" data-type="${item.type}">
                <img src="${item.posterPortraitUrl}" alt="${item.title}" class="content-poster">
                <div class="content-info">
                    <h3 class="content-title">${item.title}</h3>
                    <span class="content-type">${item.type === 'movie' ? 'فيلم' : 'مسلسل'}</span>
                    <p class="content-description">${item.description}</p>
                    <div class="content-rating">
                        <span>التقييم: </span>
                        ${item.rating}/10
                    </div>
                    ${item.type === 'series' ? `
                    <div class="content-seasons">
                        <h4>الموسم</h4>
                        <ul>
                            ${item.seasons.map(season => `
                                <li>${season.seasonName} (${season.episodes.length} حلقات)</li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    <div class="content-actions">
                        <button class="edit-btn" onclick="editContent(${item.id})"><i class="fas fa-edit"></i> تعديل</button>
                        <button class="delete-btn" onclick="deleteContent(${item.id})"><i class="fas fa-trash"></i> حذف</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// تفعيل التصفية
if (filterButtons) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            updateContentGrid(filter, searchInput.value, sortSelect.value);
        });
    });
}

// البحث
if (searchInput) {
    searchInput.addEventListener('input', () => {
        updateContentGrid(
            document.querySelector('.filter-btn.active').getAttribute('data-filter'),
            searchInput.value,
            sortSelect.value
        );
    });
}

// الترتيب
if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        updateContentGrid(
            document.querySelector('.filter-btn.active').getAttribute('data-filter'),
            searchInput.value,
            sortSelect.value
        );
    });
}

// التعديل
const editContent = async (id) => {
    const content = contentDatabase.find(item => item.id === id);
    if (content) {
        // تعبئة النموذج ببيانات المحتوى المحدد
        document.getElementById('title').value = content.title;
        document.querySelector(`input[name="type"][value="${content.type}"]`).checked = true;
        document.querySelectorAll('.categories-group input').forEach(input => {
            input.checked = content.categories.includes(input.value);
        });
        document.getElementById('description').value = content.description;
        document.getElementById('year').value = content.year;
        document.getElementById('rating').value = content.rating;
        document.getElementById('doodstreamEmbed').value = content.doodstreamEmbed || ''; // تعبئة DoodStream Embed
        posterPortraitPreview.innerHTML = `<img src="${content.posterPortraitUrl}" alt="معاينة البوستر العمودي">`;
        posterLandscapePreview.innerHTML = `<img src="${content.posterLandscapeUrl}" alt="معاينة البوستر الأفقي">`;

        if (content.type === 'series') {
            seasonGroup.style.display = 'block';
            seasonsContainer.innerHTML = '';
            content.seasons.forEach(season => {
                const seasonDiv = document.createElement('div');
                seasonDiv.className = 'season';

                const seasonNameInput = document.createElement('input');
                seasonNameInput.type = 'text';
                seasonNameInput.className = 'seasonName';
                seasonNameInput.value = season.seasonName;
                seasonDiv.appendChild(seasonNameInput);

                const episodesDiv = document.createElement('div');
                episodesDiv.className = 'episodes';

                season.episodes.forEach(episode => {
                    const episodeInput = document.createElement('input');
                    episodeInput.type = 'text';
                    episodeInput.className = 'episodeUrl';
                    episodeInput.value = episode;
                    episodesDiv.appendChild(episodeInput);
                });

                const addEpisodeBtn = document.createElement('button');
                addEpisodeBtn.type = 'button';
                addEpisodeBtn.className = 'addEpisodeBtn';
                addEpisodeBtn.textContent = '+ إضافة حلقة';
                addEpisodeBtn.onclick = () => addEpisode(episodesDiv);
                episodesDiv.appendChild(addEpisodeBtn);

                const removeSeasonBtn = document.createElement('button');
                removeSeasonBtn.type = 'button';
                removeSeasonBtn.className = 'removeSeasonBtn';
                removeSeasonBtn.textContent = 'حذف الموسم';
                removeSeasonBtn.onclick = () => seasonDiv.remove();
                seasonDiv.appendChild(removeSeasonBtn);

                seasonsContainer.appendChild(seasonDiv);
            });
        } else {
            seasonGroup.style.display = 'none';
        }

        // تغيير نص زر الإضافة إلى "تحديث"
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = 'تحديث المحتوى';
        submitBtn.onclick = async () => {
            // حفظ التعديلات
            const updatedContent = {
                id: content.id,
                title: document.getElementById('title').value,
                type: document.querySelector('input[name="type"]:checked').value,
                categories: Array.from(document.querySelectorAll('.categories-group input:checked')).map(input => input.value),
                description: document.getElementById('description').value,
                year: document.getElementById('year').value,
                rating: parseFloat(document.getElementById('rating').value),
                doodstreamEmbed: document.getElementById('doodstreamEmbed').value, // تحديث DoodStream Embed
                posterPortraitUrl: content.posterPortraitUrl,
                posterLandscapeUrl: content.posterLandscapeUrl,
                seasons: content.type === 'series' ? content.seasons : null,
                dateAdded: content.dateAdded
            };

            try {
                // تحديث المحتوى في القاعدة
                const index = contentDatabase.findIndex(item => item.id === content.id);
                contentDatabase[index] = updatedContent;
                await updateContentInDB(updatedContent);

                // تحديث العرض
                updateContentGrid();
                updateDashboardStats();

                // مسح النموذج
                contentForm.reset();
                posterPortraitPreview.innerHTML = '';
                posterLandscapePreview.innerHTML = '';
                seasonsContainer.innerHTML = '';
                addSeason();

                // إعادة نص زر الإضافة إلى حالته الأصلية
                submitBtn.textContent = 'إضافة المحتوى';
                submitBtn.onclick = () => contentForm.dispatchEvent(new Event('submit'));

                // رسالة نجاح
                showNotification('تم تعديل المحتوى بنجاح!', 'success');
            } catch (error) {
                console.error('حدث خطأ أثناء التعديل:', error);
                showNotification('حدث خطأ أثناء التعديل. يرجى المحاولة مرة أخرى.', 'error');
            }
        };
    }
};

// الحذف
const deleteContent = async (id, showAlert = true) => {
    try {
        contentDatabase = contentDatabase.filter(item => item.id !== id);
        await deleteContentFromDB(id);
        updateContentGrid();
        updateDashboardStats();
        if (showAlert) {
            showNotification('تم حذف المحتوى بنجاح!', 'success');
        }
    } catch (error) {
        console.error('حدث خطأ أثناء الحذف:', error);
        showNotification('حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.', 'error');
    }
};

// عرض الإشعارات
function showNotification(message, type = 'success') {
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// وظيفة للبحث في TMDB
async function searchTMDB(query) {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    return data.results;
}

// وظيفة لجلب الصور من fanart.tv
async function getFanartImages(tmdbId, type) {
    const url = `https://webservice.fanart.tv/v3/${type}/${tmdbId}?api_key=${FANART_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// وظيفة لجلب التصنيفات من TMDB
async function getTMDBGenres(type) {
    const url = `https://api.themoviedb.org/3/genre/${type}/list?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.genres;
}

// عرض نتائج البحث من TMDB
async function displayTMDBResults(results) {
    const tmdbResults = document.getElementById('tmdbResults');
    if (tmdbResults) {
        tmdbResults.innerHTML = '';

        for (const result of results) {
            const fanartImages = await getFanartImages(result.id, result.media_type === 'movie' ? 'movies' : 'tv');
            const posterUrl = fanartImages.movieposter ? fanartImages.movieposter[0].url : `https://image.tmdb.org/t/p/w500${result.poster_path}`;
            const backdropUrl = fanartImages.moviebackground ? fanartImages.moviebackground[0].url : `https://image.tmdb.org/t/p/w500${result.backdrop_path}`;

            const tmdbItem = document.createElement('div');
            tmdbItem.className = 'tmdb-item';
            tmdbItem.innerHTML = `
                <img src="${posterUrl}" alt="${result.title || result.name}" class="tmdb-poster">
                <div class="tmdb-info">
                    <h3 class="tmdb-title">${result.title || result.name}</h3>
                    <p class="tmdb-type">${result.media_type === 'movie' ? 'فيلم' : 'مسلسل'}</p>
                    <button class="add-tmdb-btn" onclick="addContentFromTMDB(${JSON.stringify(result).replace(/"/g, '&quot;')})">إضافة إلى المحتوى</button>
                </div>
            `;
            tmdbResults.appendChild(tmdbItem);
        }
    }
}

// إضافة محتوى من TMDB إلى قاعدة البيانات المحلية
async function addContentFromTMDB(result) {
    try {
        const fanartImages = await getFanartImages(result.id, result.media_type === 'movie' ? 'movies' : 'tv');
        const posterPortraitUrl = fanartImages.movieposter ? fanartImages.movieposter[0].url : `https://image.tmdb.org/t/p/w500${result.poster_path}`;
        const posterLandscapeUrl = fanartImages.moviebackground ? fanartImages.moviebackground[0].url : `https://image.tmdb.org/t/p/w500${result.backdrop_path}`;

        // جلب التصنيفات من TMDB
        const genres = await getTMDBGenres(result.media_type === 'movie' ? 'movie' : 'tv');
        const categories = result.genre_ids.map(id => genres.find(genre => genre.id === id).name);

        const content = {
            id: Date.now(),
            title: result.title || result.name,
            type: result.media_type === 'movie' ? 'movie' : 'series',
            categories: categories, // إضافة التصنيفات
            description: result.overview,
            year: result.release_date ? new Date(result.release_date).getFullYear() : new Date(result.first_air_date).getFullYear(),
            rating: result.vote_average, // استخدام تقييم TMDB مباشرة
            doodstreamEmbed: null, // يمكن إضافة DoodStream Embed يدويًا لاحقًا
            posterPortraitUrl: posterPortraitUrl,
            posterLandscapeUrl: posterLandscapeUrl,
            seasons: result.media_type === 'tv' ? [] : null, // يمكن إضافة المواسم يدويًا لاحقًا
            dateAdded: new Date()
        };

        // إضافة المحتوى إلى قاعدة البيانات المحلية
        await addContentToDB(content);
        contentDatabase.push(content);

        // تحديث العرض
        updateContentGrid();
        updateDashboardStats();

        // رسالة نجاح
        showNotification('تم إضافة المحتوى بنجاح!', 'success');
    } catch (error) {
        console.error('حدث خطأ أثناء إضافة المحتوى:', error);
        showNotification('حدث خطأ أثناء إضافة المحتوى. يرجى المحاولة مرة أخرى.', 'error');
    }
}

// البحث في TMDB عند النقر على زر البحث
if (document.getElementById('tmdbSearchBtn')) {
    document.getElementById('tmdbSearchBtn').addEventListener('click', async () => {
        const query = document.getElementById('tmdbSearchInput').value;
        if (query) {
            try {
                const results = await searchTMDB(query);
                displayTMDBResults(results);
            } catch (error) {
                console.error('حدث خطأ أثناء البحث:', error);
                showNotification('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.', 'error');
            }
        } else {
            showNotification('يرجى إدخال كلمة بحث.', 'error');
        }
    });
}

// إضافة قسم جديد
if (sectionForm) {
    sectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sectionName = document.getElementById('sectionName').value;

        if (!sectionName) {
            showNotification('يرجى إدخال اسم القسم.', 'error');
            return;
        }

        const section = {
            id: Date.now(),
            name: sectionName
        };

        try {
            // إضافة القسم إلى قاعدة البيانات
            await addSectionToDB(section);

            // تحديث عرض الأقسام
            updateSectionsList();

            // مسح النموذج
            document.getElementById('sectionName').value = '';

            // رسالة نجاح
            showNotification('تم إضافة القسم بنجاح!', 'success');
        } catch (error) {
            console.error('حدث خطأ أثناء إضافة القسم:', error);
            showNotification('حدث خطأ أثناء إضافة القسم. يرجى المحاولة مرة أخرى.', 'error');
        }
    });
}

// تحديث عرض الأقسام
const updateSectionsList = async () => {
    try {
        const sections = await getAllSectionsFromDB();
        if (sectionsList) {
            sectionsList.innerHTML = sections.map(section => `
                <div class="section-item">
                    <span>${section.name}</span>
                    <button onclick="deleteSection(${section.id})">حذف</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('حدث خطأ أثناء تحديث عرض الأقسام:', error);
    }
};

// حذف قسم
const deleteSection = async (id) => {
    try {
        await deleteSectionFromDB(id);
        updateSectionsList();
        showNotification('تم حذف القسم بنجاح!', 'success');
    } catch (error) {
        console.error('حدث خطأ أثناء حذف القسم:', error);
        showNotification('حدث خطأ أثناء حذف القسم. يرجى المحاولة مرة أخرى.', 'error');
    }
};

// التحميل الأولي للأقسام
(async () => {
    await updateSectionsList();
})();

// تحديث إحصائيات المحتوى في لوحة التحكم
function updateDashboardStats() {
    const totalMovies = contentDatabase.filter(item => item.type === 'movie').length;
    const totalSeries = contentDatabase.filter(item => item.type === 'series').length;
    const totalAnime = contentDatabase.filter(item => item.type === 'anime').length;

    if (document.getElementById('totalMovies')) {
        document.getElementById('totalMovies').textContent = totalMovies;
    }
    if (document.getElementById('totalSeries')) {
        document.getElementById('totalSeries').textContent = totalSeries;
    }
    if (document.getElementById('totalAnime')) {
        document.getElementById('totalAnime').textContent = totalAnime;
    }
}

// رفع ملف إلى DoodStream
async function uploadToDoodStream(file) {
    const formData = new FormData();
    formData.append('api_key', DOODSTREAM_API_KEY);
    formData.append('file', file);

    const response = await fetch('https://doodstream.com/api/upload/server?key=' + DOODSTREAM_API_KEY, {
        method: 'POST',
        body: formData
    });

    const data = await response