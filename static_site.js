// Audio player class for managing audio playback
class AudioPlayer {
    constructor(containerId, audioUrl) {
        this.container = document.getElementById(containerId);
        this.audio = new Audio(audioUrl);
        this.isPlaying = false;
        this.createPlayerUI();
        this.bindEvents();
    }

    createPlayerUI() {
        this.container.innerHTML = `
            <div class="audio-player">
                <div class="audio-controls">
                    <button class="play-pause-btn p-2 rounded-full hover:bg-gray-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path class="play-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                            <path class="pause-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </button>
                    <div class="audio-progress">
                        <div class="audio-progress-bar"></div>
                    </div>
                    <span class="time text-sm text-gray-600">0:00 / 0:00</span>
                    <button class="volume-btn p-2 rounded-full hover:bg-gray-100">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const playPauseBtn = this.container.querySelector('.play-pause-btn');
        const progressBar = this.container.querySelector('.audio-progress');
        const volumeBtn = this.container.querySelector('.volume-btn');
        const playIcon = this.container.querySelector('.play-icon');
        const pauseIcon = this.container.querySelector('.pause-icon');

        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        progressBar.addEventListener('click', (e) => this.seekTo(e));
        volumeBtn.addEventListener('click', () => this.toggleMute());

        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleEnded());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());

        // Update play/pause icon
        this.audio.addEventListener('play', () => {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        });
        this.audio.addEventListener('pause', () => {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        });
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
    }

    seekTo(event) {
        const progressBar = this.container.querySelector('.audio-progress');
        const rect = progressBar.getBoundingClientRect();
        const pos = (event.clientX - rect.left) / rect.width;
        this.audio.currentTime = pos * this.audio.duration;
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        const volumeBtn = this.container.querySelector('.volume-btn svg');
        volumeBtn.classList.toggle('text-gray-400', this.audio.muted);
    }

    updateProgress() {
        const progressBar = this.container.querySelector('.audio-progress-bar');
        const timeDisplay = this.container.querySelector('.time');
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
        timeDisplay.textContent = `${this.formatTime(this.audio.currentTime)} / ${this.formatTime(this.audio.duration)}`;
    }

    updateDuration() {
        const timeDisplay = this.container.querySelector('.time');
        timeDisplay.textContent = `0:00 / ${this.formatTime(this.audio.duration)}`;
    }

    handleEnded() {
        this.isPlaying = false;
        this.audio.currentTime = 0;
        const playIcon = this.container.querySelector('.play-icon');
        const pauseIcon = this.container.querySelector('.pause-icon');
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    destroy() {
        this.audio.pause();
        this.audio.src = '';
        this.container.innerHTML = '';
    }
}

// Main application class
class StoryLibrary {
    constructor() {
        this.stories = [];
        this.filteredStories = [];
        this.currentAudioPlayer = null;
        this.setupEventListeners();
        this.loadStories();
    }

    setupEventListeners() {
        // Filter event listeners
        document.getElementById('ageGroupFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('storyTypeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        
        // Modal event listeners
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('storyModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('storyModal')) {
                this.closeModal();
            }
        });
    }

    async loadStories() {
        try {
            this.stories = stories;
            this.filteredStories = [...this.stories];
            this.updateStoryCount();
            this.displayStories();
        } catch (error) {
            console.error('Error loading stories:', error);
            this.showError('Failed to load stories. Please try again later.');
        }
    }

    applyFilters() {
        const ageGroup = document.getElementById('ageGroupFilter').value;
        const storyType = document.getElementById('storyTypeFilter').value;
        const category = document.getElementById('categoryFilter').value;

        this.filteredStories = this.stories.filter(story => {
            const ageMatch = !ageGroup || story.ageGroup === ageGroup;
            const typeMatch = !storyType || story.type === storyType;
            const categoryMatch = !category || story.category === category;
            return ageMatch && typeMatch && categoryMatch;
        });

        this.updateStoryCount();
        this.displayStories();
    }

    clearFilters() {
        document.getElementById('ageGroupFilter').value = '';
        document.getElementById('storyTypeFilter').value = '';
        document.getElementById('categoryFilter').value = '';
        this.filteredStories = [...this.stories];
        this.updateStoryCount();
        this.displayStories();
    }

    displayStories() {
        const grid = document.getElementById('storiesGrid');
        grid.innerHTML = '';

        if (this.filteredStories.length === 0) {
            document.getElementById('noStoriesMessage').classList.remove('hidden');
            return;
        }

        document.getElementById('noStoriesMessage').classList.add('hidden');
        this.filteredStories.forEach(story => {
            const card = this.createStoryCard(story);
            grid.appendChild(card);
        });
    }

    createStoryCard(story) {
        const card = document.createElement('div');
        card.className = 'story-card bg-white rounded-lg shadow-lg overflow-hidden';
        
        const hasAudio = story.audioFile ? true : false;
        const hasIllustration = story.illustrationFile ? true : false;

        card.innerHTML = `
            <div class="p-4">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${story.title}</h3>
                <div class="flex items-center gap-2 mb-3">
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">${story.ageGroup}</span>
                    <span class="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">${story.type}</span>
                    <span class="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">${story.category}</span>
                </div>
                <p class="text-gray-600 mb-4 line-clamp-3">${story.summary}</p>
                <div class="flex justify-between items-center">
                    <button class="read-story-btn px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Read Story
                    </button>
                    ${hasAudio ? `
                        <button class="play-audio-btn px-4 py-2 text-blue-500 hover:text-blue-600 transition-colors">
                            🎵 Play Audio
                        </button>
                    ` : ''}
                </div>
            </div>
            ${hasIllustration ? `
                <div class="illustration-preview h-48 bg-gray-100">
                    <img src="${story.illustrationFile}" 
                         alt="${story.title} illustration"
                         class="w-full h-full object-cover">
                </div>
            ` : ''}
        `;

        // Add event listeners
        card.querySelector('.read-story-btn').addEventListener('click', () => this.openStoryModal(story));
        if (hasAudio) {
            card.querySelector('.play-audio-btn').addEventListener('click', () => this.playStoryAudio(story));
        }

        return card;
    }

    async openStoryModal(story) {
        const modal = document.getElementById('storyModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        const audioPlayerContainer = document.getElementById('modalAudioPlayer');
        const illustrationContainer = document.getElementById('modalIllustration');

        modalTitle.textContent = story.title;
        
        // Load story content
        try {
            modalContent.innerHTML = marked.parse(story.content);
        } catch (error) {
            console.error('Error loading story content:', error);
            modalContent.innerHTML = '<p class="text-red-500">Error loading story content.</p>';
        }

        // Setup audio player if available
        if (story.audioFile) {
            audioPlayerContainer.innerHTML = '';
            this.currentAudioPlayer = new AudioPlayer('modalAudioPlayer', `${story.audioFile}`);
        } else {
            audioPlayerContainer.innerHTML = '';
        }

        // Setup illustration if available
        if (story.illustrationFile) {
            illustrationContainer.innerHTML = `
                <div class="text-center">
                    <img src="${story.illustrationFile}" 
                         alt="${story.title} illustration"
                         class="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                         style="max-height: 400px;">
                </div>
            `;
        } else {
            illustrationContainer.innerHTML = '';
        }

        modal.classList.remove('hidden');
    }

    playStoryAudio(story) {
        if (this.currentAudioPlayer) {
            this.currentAudioPlayer.destroy();
        }
        this.currentAudioPlayer = new AudioPlayer('modalAudioPlayer', `${story.audioFile}`);
        this.openStoryModal(story);
    }

    closeModal() {
        const modal = document.getElementById('storyModal');
        if (this.currentAudioPlayer) {
            this.currentAudioPlayer.destroy();
            this.currentAudioPlayer = null;
        }
        modal.classList.add('hidden');
    }

    updateStoryCount() {
        document.getElementById('totalStories').textContent = this.stories.length;
        document.getElementById('storyCount').textContent = this.filteredStories.length;
    }

    showError(message) {
        // Implement error display logic
        console.error(message);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoryLibrary();
}); 