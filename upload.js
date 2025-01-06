// DoodStream API Key
const DOODSTREAM_API_KEY = '484294yyf6qj9dcxgf57n3'; // استبدل بمفتاح API الخاص بك

// دالة لرفع الملف إلى DoodStream
async function uploadToDoodStream(file) {
    const formData = new FormData();
    formData.append('484294yyf6qj9dcxgf57n3', DOODSTREAM_API_KEY);
    formData.append('file', file);

    try {
        // الخطوة 1: الحصول على رابط الرفع
        const uploadResponse = await fetch(`https://doodstream.com/api/upload/server?key=${DOODSTREAM_API_KEY}`);
        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
            throw new Error(uploadData.msg || 'فشل في الحصول على رابط الرفع');
        }

        const uploadUrl = uploadData.result;

        // الخطوة 2: رفع الملف إلى DoodStream
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.msg || 'فشل في رفع الملف إلى DoodStream');
        }

        // الخطوة 3: جلب رابط التضمين (Embed)
        const fileCode = data.result[0].filecode;
        const embedUrl = `https://doodstream.com/e/${fileCode}`;

        return embedUrl;
    } catch (error) {
        console.error('حدث خطأ أثناء الرفع:', error);
        throw error;
    }
}

// دالة لعرض الإشعارات
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000); // الإشعار يختفي بعد 5 ثواني
    }
}

// دالة للتعامل مع الرفع
async function handleUpload(file) {
    try {
        // رفع الملف إلى DoodStream
        const embedUrl = await uploadToDoodStream(file);

        // إظهار رسالة نجاح
        showNotification(`تم الرفع بنجاح! رابط التضمين: ${embedUrl}`, 'success');

        // يمكنك هنا إضافة الكود لتحديث قاعدة البيانات أو الإحصائيات
        console.log('رابط التضمين:', embedUrl);
    } catch (error) {
        // إظهار رسالة خطأ تفصيلية
        showNotification(`حدث خطأ أثناء الرفع: ${error.message}`, 'error');
    }
}

// استخدام الدالة عند النقر على زر الرفع
if (document.getElementById('uploadForm')) {
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        if (!file) {
            showNotification('يرجى اختيار ملف للرفع.', 'error');
            return;
        }

        // التعامل مع الرفع
        await handleUpload(file);
    });
}