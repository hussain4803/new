// Global variables
let pictures = JSON.parse(localStorage.getItem('pictures')) || [];
let musicList = JSON.parse(localStorage.getItem('musicList')) || [];
let todoList = JSON.parse(localStorage.getItem('todoList')) || [];

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
    loadData();
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

// Pictures functionality
function initializePictures() {
    const addPictureBtn = document.getElementById('addPictureBtn');
    const pictureInput = document.getElementById('pictureInput');
    const pictureDescription = document.getElementById('pictureDescription');
    
    addPictureBtn.addEventListener('click', function() {
        const file = pictureInput.files[0];
        const description = pictureDescription.value.trim();
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const picture = {
                    id: Date.now(),
                    src: e.target.result,
                    description: description,
                    date: new Date().toLocaleDateString('ar-EG')
                };
                
                pictures.push(picture);
                savePictures();
                renderPictures();
                
                // Clear form
                pictureInput.value = '';
                pictureDescription.value = '';
            };
            reader.readAsDataURL(file);
        } else {
            alert('الرجاء اختيار صورة');
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
            <img src="${picture.src}" alt="صورة" onclick="openLightbox('${picture.src}', '${picture.description}')">
            <div class="picture-info">
                <p class="picture-description">${picture.description || 'لا يوجد وصف'}</p>
                <p class="picture-date">${picture.date}</p>
                <div class="picture-actions">
                    <button class="btn-edit" onclick="editPicture(${picture.id})">تعديل</button>
                    <button class="btn-delete" onclick="deletePicture(${picture.id})">حذف</button>
                </div>
            </div>
        `;
        gallery.appendChild(pictureItem);
    });
}

function editPicture(id) {
    const picture = pictures.find(p => p.id === id);
    if (picture) {
        const newDescription = prompt('أدخل الوصف الجديد:', picture.description);
        if (newDescription !== null) {
            picture.description = newDescription;
            savePictures();
            renderPictures();
        }
    }
}

function deletePicture(id) {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
        pictures = pictures.filter(p => p.id !== id);
        savePictures();
        renderPictures();
    }
}

function openLightbox(src, description) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxDescription = document.getElementById('lightbox-description');
    
    lightboxImg.src = src;
    lightboxDescription.textContent = description || 'لا يوجد وصف';
    lightbox.classList.add('active');
}

// Close lightbox
document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('close-lightbox')) {
        this.classList.remove('active');
    }
});

// Music functionality
function initializeMusic() {
    const addMusicBtn = document.getElementById('addMusicBtn');
    const musicTitle = document.getElementById('musicTitle');
    const musicLink = document.getElementById('musicLink');
    const musicDescription = document.getElementById('musicDescription');
    
    addMusicBtn.addEventListener('click', function() {
        const title = musicTitle.value.trim();
        const link = musicLink.value.trim();
        const description = musicDescription.value.trim();
        
        if (title && link) {
            const music = {
                id: Date.now(),
                title: title,
                link: link,
                description: description,
                date: new Date().toLocaleDateString('ar-EG')
            };
            
            musicList.push(music);
            saveMusic();
            renderMusic();
            
            // Clear form
            musicTitle.value = '';
            musicLink.value = '';
            musicDescription.value = '';
        } else {
            alert('الرجاء إدخال العنوان والرابط');
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
            <button class="btn-delete" onclick="deleteMusic(${music.id})">حذف</button>
        `;
        musicContainer.appendChild(musicItem);
    });
}

function deleteMusic(id) {
    if (confirm('هل أنت متأكد من حذف هذه الموسيقى؟')) {
        musicList = musicList.filter(m => m.id !== id);
        saveMusic();
        renderMusic();
    }
}

// Todo functionality
function initializeTodo() {
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoInput = document.getElementById('todoInput');
    
    addTodoBtn.addEventListener('click', function() {
        const text = todoInput.value.trim();
        if (text) {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                date: new Date().toLocaleDateString('ar-EG')
            };
            
            todoList.push(todo);
            saveTodo();
            renderTodo();
            
            // Clear input
            todoInput.value = '';
        } else {
            alert('الرجاء إدخال نص المهمة');
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
                   onchange="toggleTodo(${todo.id})">
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <span class="todo-date">${todo.date}</span>
            <button class="todo-delete" onclick="deleteTodo(${todo.id})">حذف</button>
        `;
        todoContainer.appendChild(todoItem);
    });
}

function toggleTodo(id) {
    const todo = todoList.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodo();
        renderTodo();
    }
}

function deleteTodo(id) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        todoList = todoList.filter(t => t.id !== id);
        saveTodo();
        renderTodo();
    }
}

// Data persistence functions
function savePictures() {
    localStorage.setItem('pictures', JSON.stringify(pictures));
}

function saveMusic() {
    localStorage.setItem('musicList', JSON.stringify(musicList));
}

function saveTodo() {
    localStorage.setItem('todoList', JSON.stringify(todoList));
}

function loadData() {
    renderPictures();
    renderMusic();
    renderTodo();
}

// Add some sample data for demonstration
function addSampleData() {
    if (pictures.length === 0) {
        pictures.push({
            id: 1,
            src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2OWI0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfkqE8L3RleHQ+PC9zdmc+',
            description: 'صورة تجريبية - أضف صورك الخاصة!',
            date: new Date().toLocaleDateString('ar-EG')
        });
    }
    
    if (musicList.length === 0) {
        musicList.push({
            id: 1,
            title: 'أغنية الحب الأولى',
            link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'أضف الموسيقى المفضلة لديك!',
            date: new Date().toLocaleDateString('ar-EG')
        });
    }
    
    if (todoList.length === 0) {
        todoList.push({
            id: 1,
            text: 'أضف مهامك الأولى هنا!',
            completed: false,
            date: new Date().toLocaleDateString('ar-EG')
        });
    }
    
    savePictures();
    saveMusic();
    saveTodo();
    loadData();
}

// Add sample data when page loads
setTimeout(addSampleData, 1000);

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

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
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
