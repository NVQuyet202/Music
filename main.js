/*
    1.Render songs => OK
    2.Scroll top => OK
    3.Play / Pause / Seek(Tua) => OK
    4.CD rotate => OK
    5.Next / Prev => OK
    6.Random => OK
    7.Next / Repeat when ended => OK
    8.Active / Repeat when ended => OK
    9.Scroll active song into view => OK
    10.Play song when click => OK
*/ 
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd');
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const btnRandom = $('.btn-random')
const repeatBtn =$('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] =  value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    songs: [
          {
            name: 'Ghệ iu dấu của em ơi',
            singer: 'Tlinh',
            path: './music/gheiudau.mp3',
            image:'./img/image1.jpg'
          },
          {
            name: 'Tại vì sao',
            singer: 'MCK',
            path: './music/TaiViSao.mp3',
            image:'./img/image2.jpg'
          },
          {
            name: 'Chỉ 1 đêm nữa thôi',
            singer: 'MCK',
            path: './music/ChiMotDemNuaThoi.mp3',
            image:'./img/image3.jpg'
          },
          {
            name: 'Đưa em về nhà',
            singer: 'Grey D & Chillies',
            path: './music/DuaEmVeNha.mp3',
            image:'./img/image4.jpg'
          },
          {
            name: 'Ngủ một mình',
            singer: 'HIEUTHUHAI & Negav',
            path: './music/NguMotMinh.mp3',
            image:'./img/image5.jpg'
          },
          {
            name: 'À Lôi',
            singer: 'Double2T & Masew',
            path: './music/ALoi.mp3',
            image:'./img/image6.jpg'
          },
          {
            name: 'Seven',
            singer: 'JungKook',
            path: './music/seven.mp3',
            image:'./img/image7.jpg'
          }
    ],
    render: function() {
        const htmls = this.songs.map((song,index) => {
            return `
            <div class="song ${index === this.currentIndex ?'active': ''} "data-index = "${index}" >
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
          </div>
            `
        });
        $('.playlist').innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        //Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000 , //10 seconds
            interations: Infinity
        })

        cdThumbAnimate.pause()

        //Xử lý phóng to or thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newcdWidth = cdWidth - scrollTop
            cd.style.width = newcdWidth > 0 ? newcdWidth +'px' : 0
            cd.style.opacity = newcdWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if ( _this.isPlaying){
                audio.pause()
            } else {
                audio.play()
            }            
        }

        //Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //Khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua song 
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }           
            audio.play() 
            _this.render()
            _this.scrollToActiveSong()

        }

        //Khi pre song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }

            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Khi random bai hat
        btnRandom.onclick = function() {
            //Cách 1
            // if(_this.isRandom){
            //     btnRandom.classList.remove('active')
            //     _this.isRandom = false
            // } else {
            //     btnRandom.classList.add('active')
            //     _this.isRandom = true
            // }
            //Cách 2
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            btnRandom.classList.toggle('active',_this.isRandom)
        }

        //Xử lý lặp lài bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        //Khi audio kết thúc
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            
            if (songNode || e.target.closest('.option') ) {
                //Xử lý khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //Xử Lý khi click vào song option
                if(!e.target.closest('.option')){

                }
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            if(this.currentIndex < 3) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }
            
        },500) 
    },

    loadCurrentSong: function () {

 
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path


    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length -1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        //Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        //Lắng nghe / Xử lý các sự kiện (DOM events)
        this.handleEvents()

        //Taỉ thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //Render playlist
        this.render()

        //Hiển thị trạng thái ban đầu của các nút
        btnRandom.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}

app.start()
