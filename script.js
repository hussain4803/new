// Firebase configuration for online data sharing
const firebaseConfig = {
    apiKey: "AIzaSyA_SwZ_7WWgCvBy7evdn6ZbhXfsUZE_Px8",
    authDomain: "love-website-hussein-zainab.firebaseapp.com",
    projectId: "love-website-hussein-zainab",
    storageBucket: "love-website-hussein-zainab.firebasestorage.app",
    messagingSenderId: "676871231525",
    appId: "1:676871231525:web:ab554e9106c22b3201c7cc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variables
let pictures = [];
let musicList = [];
let todoList = [];

// DOM elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeLoveCounter();
    initializePictures();
    initializeMusic();
    initializeTodo();
    loadDataFromFirebase();
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showPage(targetId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// Show specific page
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Love Counter functionality
function initializeLoveCounter() {
    updateLoveCounter();
    setInterval(updateLoveCounter, 1000);
}

function updateLoveCounter() {
    const startDate = new Date('2023-11-13T00:00:00+03:00'); // Iraq timezone
    const now = new Date();
    
    // Convert to Iraq timezone
    const iraqTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Baghdad"}));
    
    const difference = iraqTime - startDate;
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Firebase Data Functions
async function loadDataFromFirebase() {
    try {
        // Load pictures
        const picturesSnapshot = await db.collection('pictures').orderBy('timestamp', 'desc').get();
        pictures = picturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Load music
        const musicSnapshot = await db.collection('music').orderBy('timestamp', 'desc').get();
        musicList = musicSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Load todos
        const todosSnapshot = await db.collection('todos').orderBy('timestamp', 'desc').get();
        todoList = todosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Render all data
        renderPictures();
        renderMusic();
        renderTodo();
        
        // Set up real-time listeners
        setupRealtimeListeners();
        
    } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to local storage if Firebase fails
        loadDataFromLocalStorage();
    }
}

function setupRealtimeListeners() {
    // Real-time pictures updates
    db.collection('pictures').orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            pictures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderPictures();
        });
    
    // Real-time music updates
    db.collection('music').orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            musicList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderMusic();
        });
    
    // Real-time todos updates
    db.collection('todos').orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            todoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderTodo();
        });
}

// Fallback to local storage
function loadDataFromLocalStorage() {
    pictures = JSON.parse(localStorage.getItem('pictures')) || [];
    musicList = JSON.parse(localStorage.getItem('musicList')) || [];
    todoList = JSON.parse(localStorage.getItem('todoList')) || [];
    
    renderPictures();
    renderMusic();
    renderTodo();
}

// Pictures functionality
function initializePictures() {
    const addPictureBtn = document.getElementById('addPictureBtn');
    const pictureInput = document.getElementById('pictureInput');
    const pictureDescription = document.getElementById('pictureDescription');
    
    addPictureBtn.addEventListener('click', async function() {
        const file = pictureInput.files[0];
        const description = pictureDescription.value.trim();
        
        if (file) {
            try {
                // Show loading state
                addPictureBtn.textContent = 'جاري الإضافة...';
                addPictureBtn.disabled = true;
                
                const picture = {
                    description: description,
                    date: new Date().toLocaleDateString('ar-EG'),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    addedBy: 'حسين' // You can change this or make it dynamic
                };
                
                // Upload to Firebase
                const docRef = await db.collection('pictures').add(picture);
                
                // Clear form
                pictureInput.value = '';
                pictureDescription.value = '';
                
                // Reset button
                addPictureBtn.textContent = 'إضافة صورة';
                addPictureBtn.disabled = false;
                
                // Show success message
                showNotification('تم إضافة الصورة بنجاح!', 'success');
                
            } catch (error) {
                console.error("Error adding picture:", error);
                showNotification('حدث خطأ أثناء إضافة الصورة', 'error');
                addPictureBtn.textContent = 'إضافة صورة';
                addPictureBtn.disabled = false;
            }
        } else {
            showNotification('الرجاء اختيار صورة', 'warning');
        }
    });
}

function renderPictures() {
    const gallery = document.getElementById('picturesGallery');
    gallery.innerHTML = '';
    
    pictures.forEach(picture => {
        const pictureItem = document.createElement('div');
        pictureItem.className = 'picture-item';
        pictureItem.innerHTML = `
            <div class="picture-placeholder">
                <i class="fas fa-image"></i>
                <p>صورة من ${picture.addedBy || 'مستخدم'}</p>
            </div>
            <div class="picture-info">
                <p class="picture-description">${picture.description || 'لا يوجد وصف'}</p>
                <p class="picture-date">${picture.date}</p>
                <p class="picture-author">أضيفت بواسطة: ${picture.addedBy || 'مستخدم'}</p>
                <div class="picture-actions">
                    <button class="btn-edit" onclick="editPicture('${picture.id}')">تعديل</button>
                    <button class="btn-delete" onclick="deletePicture('${picture.id}')">حذف</button>
                </div>
            </div>
        `;
        gallery.appendChild(pictureItem);
    });
}

async function editPicture(id) {
    const picture = pictures.find(p => p.id === id);
    if (picture) {
        const newDescription = prompt('أدخل الوصف الجديد:', picture.description);
        if (newDescription !== null) {
            try {
                await db.collection('pictures').doc(id).update({
                    description: newDescription,
                    lastEdited: firebase.firestore.FieldValue.serverTimestamp()
                });
                showNotification('تم تحديث الوصف بنجاح!', 'success');
            } catch (error) {
                console.error("Error updating picture:", error);
                showNotification('حدث خطأ أثناء التحديث', 'error');
            }
        }
    }
}

async function deletePicture(id) {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
        try {
            await db.collection('pictures').doc(id).delete();
            showNotification('تم حذف الصورة بنجاح!', 'success');
        } catch (error) {
            console.error("Error deleting picture:", error);
            showNotification('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

// Music functionality
function initializeMusic() {
    const addMusicBtn = document.getElementById('addMusicBtn');
    const musicTitle = document.getElementById('musicTitle');
    const musicLink = document.getElementById('musicLink');
    const musicDescription = document.getElementById('musicDescription');
    
    addMusicBtn.addEventListener('click', async function() {
        const title = musicTitle.value.trim();
        const link = musicLink.value.trim();
        const description = musicDescription.value.trim();
        
        if (title && link) {
            try {
                addMusicBtn.textContent = 'جاري الإضافة...';
                addMusicBtn.disabled = true;
                
                const music = {
                    title: title,
                    link: link,
                    description: description,
                    date: new Date().toLocaleDateString('ar-EG'),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    addedBy: 'حسين'
                };
                
                await db.collection('music').add(music);
                
                // Clear form
                musicTitle.value = '';
                musicLink.value = '';
                musicDescription.value = '';
                
                addMusicBtn.textContent = 'إضافة موسيقى';
                addMusicBtn.disabled = false;
                
                showNotification('تم إضافة الموسيقى بنجاح!', 'success');
                
            } catch (error) {
                console.error("Error adding music:", error);
                showNotification('حدث خطأ أثناء إضافة الموسيقى', 'error');
                addMusicBtn.textContent = 'إضافة موسيقى';
                addMusicBtn.disabled = false;
            }
        } else {
            showNotification('الرجاء إدخال العنوان والرابط', 'warning');
        }
    });
}

function renderMusic() {
    const musicContainer = document.getElementById('musicList');
    musicContainer.innerHTML = '';
    
    musicList.forEach(music => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';
        musicItem.innerHTML = `
            <h3 class="music-title">${music.title}</h3>
            <p class="music-description">${music.description || 'لا يوجد وصف'}</p>
            <a href="${music.link}" target="_blank" class="music-link">استمع الآن</a>
            <p class="music-date">${music.date}</p>
            <p class="music-author">أضيفت بواسطة: ${music.addedBy || 'مستخدم'}</p>
            <button class="btn-delete" onclick="deleteMusic('${music.id}')">حذف</button>
        `;
        musicContainer.appendChild(musicItem);
    });
}

async function deleteMusic(id) {
    if (confirm('هل أنت متأكد من حذف هذه الموسيقى؟')) {
        try {
            await db.collection('music').doc(id).delete();
            showNotification('تم حذف الموسيقى بنجاح!', 'success');
        } catch (error) {
            console.error("Error deleting music:", error);
            showNotification('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

// Todo functionality
function initializeTodo() {
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoInput = document.getElementById('todoInput');
    
    addTodoBtn.addEventListener('click', async function() {
        const text = todoInput.value.trim();
        if (text) {
            try {
                addTodoBtn.textContent = 'جاري الإضافة...';
                addTodoBtn.disabled = true;
                
                const todo = {
                    text: text,
                    completed: false,
                    date: new Date().toLocaleDateString('ar-EG'),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    addedBy: 'حسين'
                };
                
                await db.collection('todos').add(todo);
                
                // Clear input
                todoInput.value = '';
                
                addTodoBtn.textContent = 'إضافة';
                addTodoBtn.disabled = false;
                
                showNotification('تم إضافة المهمة بنجاح!', 'success');
                
            } catch (error) {
                console.error("Error adding todo:", error);
                showNotification('حدث خطأ أثناء إضافة المهمة', 'error');
                addTodoBtn.textContent = 'إضافة';
                addTodoBtn.disabled = false;
            }
        } else {
            showNotification('الرجاء إدخال نص المهمة', 'warning');
        }
    });
    
    // Enter key support
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodoBtn.click();
        }
    });
}

function renderTodo() {
    const todoContainer = document.getElementById('todoList');
    todoContainer.innerHTML = '';
    
    todoList.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo('${todo.id}', this.checked)">
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <span class="todo-date">${todo.date}</span>
            <span class="todo-author">بواسطة: ${todo.addedBy || 'مستخدم'}</span>
            <button class="todo-delete" onclick="deleteTodo('${todo.id}')">حذف</button>
        `;
        todoContainer.appendChild(todoItem);
    });
}

async function toggleTodo(id, completed) {
    try {
        await db.collection('todos').doc(id).update({
            completed: completed,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        const status = completed ? 'مكتملة' : 'غير مكتملة';
        showNotification(`تم تحديث المهمة: ${status}`, 'success');
        
    } catch (error) {
        console.error("Error updating todo:", error);
        showNotification('حدث خطأ أثناء تحديث المهمة', 'error');
    }
}

async function deleteTodo(id) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        try {
            await db.collection('todos').doc(id).delete();
            showNotification('تم حذف المهمة بنجاح!', 'success');
        } catch (error) {
            console.error("Error deleting todo:", error);
            showNotification('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Close lightbox
document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('close-lightbox')) {
        this.classList.remove('active');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes lightbox
    if (e.key === 'Escape') {
        document.getElementById('lightbox').classList.remove('active');
    }
    
    // Ctrl/Cmd + Enter adds todo
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'todoInput') {
            document.getElementById('addTodoBtn').click();
        }
    }
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Add some cyberpunk effects
function addCyberpunkEffects() {
    // Add glitch effect to titles
    const titles = document.querySelectorAll('.page-title, .hero-title');
    titles.forEach(title => {
        title.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 30px var(--neon-pink), 0 0 40px var(--neon-pink)';
        });
        
        title.addEventListener('mouseleave', function() {
            this.style.textShadow = '';
        });
    });
}

// Initialize cyberpunk effects
setTimeout(addCyberpunkEffects, 2000);
