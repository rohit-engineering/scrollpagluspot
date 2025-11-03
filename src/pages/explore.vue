<template>
  <section class="explore-page" @scroll.passive="onPageScroll">
    <!-- Header -->
    <header class="explore-header">
      <h1 class="gradient-text">✨ Explore The Vibe</h1>
      <p class="subtitle">Aesthetic stickers & desi Gen-Z confessions, memes & fashion feels 🔥</p>
    </header>
    <p class="disclaimer">⚠️ All content is for entertainment only for Scroll Paglus.</p>

    <!-- Tabs -->
    <div class="tab-bar" role="tablist" aria-label="Explore tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab-btn', { active: currentTab === tab }]"
        @click="switchTab(tab)"
        :aria-selected="currentTab === tab"
        role="tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- AESTHETIC: mixed stickers + aesthetic images -->
    <div v-if="currentTab === 'Aesthetic'" class="explore-grid" ref="imageGrid">
      <div
        v-for="(item, i) in mixedAestheticFeed"
        :key="item.id"
        class="sticker-card"
        @click="copySticker(item)"
        :title="'Tap to copy link — ' + (item.caption || '')"
      >
        <div v-if="!item.loaded" class="skeleton" />
        <img
          :data-src="item.url"
          :alt="item.caption || 'aesthetic image'"
          class="sticker-img"
          loading="lazy"
          :class="{ 'is-loaded': item.loaded }"
          @load="onStickerLoad(item)"
          @error="handleStickerError(item)"
        />
        <div class="sticker-overlay">
          <span>{{ item.type === 'photo' ? 'Copy image link' : 'Copy sticker link' }}</span>
        </div>
      </div>

      <!-- Load More -->
      <div class="load-more-container">
        <button
          v-if="!loadingStickers"
          class="load-more-btn"
          @click="loadMoreMixed"
          aria-label="Load more images"
        >
          🌸 Load More Vibes
        </button>
        <div v-else class="loader small">Loading...</div>
      </div>
    </div>

    <!-- TRENDY: text + meme + jokes feed -->
    <div v-if="currentTab === 'Trendy'" class="trend-feed" ref="trendFeed">
      <transition-group name="list" tag="div">
        <article
          v-for="post in trendyFeed"
          :key="post.id"
          class="trend-post"
          :data-post-id="post.id"
        >
          <div class="post-top">
            <div class="avatar"><img :src="post.avatar" alt="" /></div>
            <div class="meta">
              <div class="meta-title">
                <strong>{{ post.author }}</strong>
                <span class="dot">·</span>
                <small class="time">{{ post.time || '' }}</small>
              </div>
              <div class="tag-badge">#{{ post.tag }}</div>
            </div>
          </div>

          <div v-if="post.image" class="micro-meme" @click.stop="openItem(post.image)">
            <img :src="post.image" alt="meme" loading="lazy" @error="handleImageError(post)" />
          </div>

          <p class="trend-text" v-html="formatText(post.text)"></p>

          <div class="post-actions">
            <button
              class="like-btn"
              :class="{ liked: isLiked(post.id) }"
              @click="toggleLike(post)"
              :aria-pressed="isLiked(post.id)"
              :aria-label="'Like post by ' + post.author"
            >
              <span class="heart" aria-hidden="true">❤</span>
              <span class="count">{{ post.likes }}</span>
            </button>

            <button class="share-btn" @click="sharePost(post)" title="Share post">🔗</button>

            <div class="views">👀 <span>{{ post.views }}</span></div>
            <button class="reshuffle" @click="reshufflePost(post.id)" title="Shuffle this post">🔀</button>
          </div>
        </article>
      </transition-group>

      <div v-if="!trendyFeed.length && !loadingTrendy" class="empty-feed">
        😅 No vibes right now — try switching tab or refresh.
      </div>

      <div v-if="loadingTrendy" class="loader"><i class="bi bi-stars"></i> Loading more vibes...</div>
    </div>

    <!-- Sticky Shuffle + Move-to-Top -->
    <button class="shuffle-btn" @click="shuffleAll" title="Shuffle feed">🔀</button>
    <button v-show="showTopBtn" class="scroll-top" @click="scrollToTop" aria-label="Scroll to top">⬆️</button>

    <!-- Toast -->
    <div v-if="showToast" class="toast">{{ toastMessage }}</div>

    <!-- Entertainment notice at bottom -->
    <div class="entertainment-note">
      ⚠️ This content is for entertainment purposes only — curated Gen-Z vibes.
    </div>
  </section>
</template>

<script setup>
/* eslint-disable no-console */
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'

/* --------------------- Tabs --------------------- */
const tabs = ['Aesthetic', 'Trendy']
const currentTab = ref('Aesthetic')
const switchTab = (tab) => {
  currentTab.value = tab
  if (tab === 'Trendy' && trendyFeed.value.length === 0) {
    loadInitialTrendy()
  }
}

/* --------------------- AESTHETIC: stickers + photos --------------------- */
const stickerFeed = ref([])
const aestheticFeed = ref([]) // photos
const loadingStickers = ref(false)
const stickerPage = ref(0)

const vibeKeywords = [
  'kawaii sticker','anime sticker pastel','cute aesthetic sticker','soft girl sticker','y2k sticker','coquette sticker'
]
const photoThemes = [
  'pastel aesthetic room',
  'soft girl outfit',
  'cottagecore vibes',
  'pink sunset aesthetic',
  'vintage fashion aesthetic',
  'minimal desk setup aesthetic',
  'aesthetic flatlay',
  'soft pastel flowers'
]

// preload for quick initial UX
const preloadStickers = [
  'https://images.unsplash.com/photo-1604079628040-94301bb21b91',
  'https://images.unsplash.com/photo-1614286646019-bccf19b0b147',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba',
  'https://images.unsplash.com/photo-1621784563168-9b8b1eb2bb7d',
  'https://images.unsplash.com/photo-1601758125946-6ec2ef642b4f'
]
const preloadPhotos = [
  'https://images.unsplash.com/photo-1503264116251-35a269479413',
  'https://images.unsplash.com/photo-1504198458649-3128b932f49b',
  'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d',
  'https://images.unsplash.com/photo-1549880338-65ddcdfd017b',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e'
]

const loadInitialStickers = () => {
  stickerFeed.value = preloadStickers.map((url, idx) => ({
    id: 'st_'+idx,
    url: `${url}?auto=format&fit=crop&w=400&q=80`,
    caption: 'Sticker Vibe ✨',
    type: 'sticker',
    loaded: true
  }))
  stickerPage.value = 1
}

const loadInitialPhotos = () => {
  aestheticFeed.value = preloadPhotos.map((url, idx) => ({
    id: 'ae_'+idx,
    url: `${url}?auto=format&fit=crop&w=400&q=80`,
    caption: 'Aesthetic Photo',
    type: 'photo',
    loaded: true
  }))
}

/* lazy observer to load data-src into src */
let imageObserver = null
const setupImageObserver = async () => {
  await nextTick()
  if ('IntersectionObserver' in window) {
    imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src
          if (src) {
            img.src = src
            imageObserver.unobserve(img)
          }
        }
      })
    }, { rootMargin: '120px' })
    document.querySelectorAll('.sticker-img[data-src]').forEach(img => imageObserver.observe(img))
  } else {
    document.querySelectorAll('.sticker-img[data-src]').forEach(img => img.src = img.dataset.src)
  }
}

/* load more stickers (keeps previous behavior, creates 5) */
const loadMoreStickers = async (count = 5) => {
  const batch = Array.from({ length: count }).map((_, idx) => {
    const q = vibeKeywords[Math.floor(Math.random() * vibeKeywords.length)]
    const s = Math.random().toString(36).slice(2, 8)
    return {
      id: 'st_' + (stickerFeed.value.length + idx),
      url: `https://source.unsplash.com/400x400/?${encodeURIComponent(q)}&sig=${s}`,
      caption: q,
      type: 'sticker',
      loaded: false
    }
  })
  stickerFeed.value.push(...batch)
  stickerPage.value++
}

/* load aesthetic photos (creates same number as stickers to keep 50/50) */
const loadAestheticImages = async (count = 5) => {
  const batch = Array.from({ length: count }).map((_, i) => {
    const q = photoThemes[Math.floor(Math.random() * photoThemes.length)]
    const sig = Math.random().toString(36).slice(2, 8)
    return {
      id: 'ae_' + (aestheticFeed.value.length + i),
      url: `https://source.unsplash.com/400x400/?${encodeURIComponent(q)}&sig=${sig}`,
      caption: q,
      type: 'photo',
      loaded: false
    }
  })

  /* 🌸 Pixabay API */
  const PIXABAY_KEY = '53072388-5e7820b81347d15e1b50c46a5'
  try {
    if (Math.random() > 0.5) {
      const q = photoThemes[Math.floor(Math.random() * photoThemes.length)]
      const res = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(q)}&image_type=photo&per_page=${count}`
      )
      const data = await res.json()
      const pixabayBatch = (data.hits || []).map((p, i) => ({
        id: 'px_' + (aestheticFeed.value.length + i),
        url: p.webformatURL,
        caption: p.tags,
        type: 'photo',
        loaded: false
      }))
      batch.push(...pixabayBatch)
    }
  } catch (err) {
    console.warn('Pixabay fetch failed:', err)
  }

  /* 🌸 Pexels API */
  const PEXELS_KEY = '5yR8J2Sr4gOZkk8rSAceKrSQfJDOmp88d3FWbbwBc0xcy7RI7WZh62R1'
  try {
    if (Math.random() > 0.4) {
      const q = photoThemes[Math.floor(Math.random() * photoThemes.length)]
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${count}`,
        { headers: { Authorization: PEXELS_KEY } }
      )
      const data = await res.json()
      const pexelsBatch = (data.photos || []).map((p, i) => ({
        id: 'pe_' + (aestheticFeed.value.length + i),
        url: p.src.medium,
        caption: p.photographer,
        type: 'photo',
        loaded: false
      }))
      batch.push(...pexelsBatch)
    }
  } catch (err) {
    console.warn('Pexels fetch failed:', err)
  }

  /* 🖼️ Lorem Picsum (random placeholders) */
  try {
    if (Math.random() > 0.3) {
      const loremBatch = Array.from({ length: Math.ceil(count / 2) }).map((_, i) => ({
        id: 'lp_' + (aestheticFeed.value.length + i),
        url: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 9999)}`,
        caption: 'Lorem aesthetic placeholder',
        type: 'photo',
        loaded: false
      }))
      batch.push(...loremBatch)
    }
  } catch (err) {
    console.warn('Lorem Picsum fetch failed:', err)
  }

  /* ✨ Tenor aesthetic GIFs */
  const TENOR_KEY = 'LIVDSRZULELA'
  try {
    if (Math.random() > 0.6) {
      const q = 'aesthetic vibes'
      const res = await fetch(
        `https://g.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=${count}`
      )
      const data = await res.json()
      const tenorBatch = (data.results || []).map((g, i) => ({
        id: 'gif_' + (aestheticFeed.value.length + i),
        url: g.media_formats?.tinygif?.url || g.media_formats?.gif?.url,
        caption: g.title || 'GIF Vibe ✨',
        type: 'photo',
        loaded: false
      }))
      batch.push(...tenorBatch)
    }
  } catch (err) {
    console.warn('Tenor fetch failed:', err)
  }

  aestheticFeed.value.push(...batch)
}

// ✅ Put this inside an async function like loadMoreStickers() or loadAestheticImages()
const loadFashionAndStickers = async (count = 10) => {
  const batch = []
  const sig = Math.random().toString(36).substring(2, 8)

  /* 🌸 1️⃣ Unsplash Stickers */
  const unsplashBatch = Array.from({ length: count }).map((_, i) => ({
    id: 'us_' + (stickerFeed.value.length + i),
    url: `https://source.unsplash.com/400x400/?aesthetic,sticker&sig=${sig}-${i}`,
    caption: 'Aesthetic Sticker 🌸',
    type: 'sticker',
    loaded: false
  }))
  batch.push(...unsplashBatch)

  /* 🌸 2️⃣ Waifu API */
  try {
    if (Math.random() > 0.5) {
      const results = await Promise.all(
        Array.from({ length: Math.ceil(count / 2) }).map(() =>
          fetch('https://api.waifu.pics/sfw/waifu').then(r => r.json())
        )
      )
      const waifuBatch = results.map((w, i) => ({
        id: 'waifu_' + (stickerFeed.value.length + i),
        url: w.url,
        caption: 'Anime Aesthetic ✨',
        type: 'sticker',
        loaded: false
      }))
      batch.push(...waifuBatch)
    }
  } catch (err) {
    console.warn('Waifu fetch failed:', err)
  }

  /* 👗 3️⃣ Unsplash Fashion */
  try {
    if (Math.random() > 0.4) {
      const fashionQuery = ['fashion model', 'runway', 'fashion show', 'street style', 'female model']
      const fq = fashionQuery[Math.floor(Math.random() * fashionQuery.length)]
      const fashionBatch = Array.from({ length: Math.ceil(count / 2) }).map((_, i) => ({
        id: 'uf_' + (stickerFeed.value.length + i),
        url: `https://source.unsplash.com/400x400/?${encodeURIComponent(fq)}&sig=${sig}-f${i}`,
        caption: fq,
        type: 'sticker',
        loaded: false
      }))
      batch.push(...fashionBatch)
    }
  } catch (err) {
    console.warn('Unsplash fashion failed:', err)
  }

  /* 👠 4️⃣ Pexels Fashion */
  try {
    if (Math.random() > 0.5) {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent('fashion model runway female')}&per_page=${count}`,
        { headers: { Authorization: '5yR8J2Sr4gOZkk8rSAceKrSQfJDOmp88d3FWbbwBc0xcy7RI7WZh62R1' } }
      )
      const data = await res.json()
      const pexelsFashion = (data.photos || []).map((p, i) => ({
        id: 'pf_' + (stickerFeed.value.length + i),
        url: p.src.medium,
        caption: p.photographer || 'Fashion Model',
        type: 'sticker',
        loaded: false
      }))
      batch.push(...pexelsFashion)
    }
  } catch (err) {
    console.warn('Pexels fashion failed:', err)
  }

  /* 💃 5️⃣ Pixabay Fashion */
  try {
    if (Math.random() > 0.5) {
      const res = await fetch(
        `https://pixabay.com/api/?key=53072388-5e7820b81347d15e1b50c46a5&q=${encodeURIComponent('fashion model woman runway')}&image_type=photo&per_page=${count}`
      )
      const data = await res.json()
      const pixabayFashion = (data.hits || []).map((p, i) => ({
        id: 'fx_' + (stickerFeed.value.length + i),
        url: p.webformatURL,
        caption: p.tags || 'Fashion Image',
        type: 'sticker',
        loaded: false
      }))
      batch.push(...pixabayFashion)
    }
  } catch (err) {
    console.warn('Pixabay fashion failed:', err)
  }

  /* 🧸 6️⃣ DummyJSON Products */
  try {
    if (Math.random() > 0.4) {
      const res = await fetch('https://dummyjson.com/products?limit=5')
      const data = await res.json()
      const dummyBatch = (data.products || []).map((p, i) => ({
        id: 'dm_' + (stickerFeed.value.length + i),
        url: p.thumbnail,
        caption: p.title,
        type: 'sticker',
        loaded: false
      }))
      batch.push(...dummyBatch)
    }
  } catch (err) {
    console.warn('DummyJSON fetch failed:', err)
  }

  // ✅ Push all fetched batches into feed
  stickerFeed.value.push(...batch)
  stickerPage.value++
}

/* 🔄 Mixed loader: ensures ~50/50 ratio */
const loadMoreMixed = async () => {
  if (loadingStickers.value) return
  loadingStickers.value = true
  await Promise.all([loadMoreStickers(5), loadAestheticImages(5)])
  loadingStickers.value = false
  await nextTick()
  setupImageObserver()
}


/* image error fallback */
const handleStickerError = (it) => {
  it.url = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 9999)}`
  it.loaded = true
}
const onStickerLoad = (it) => {
  it.loaded = true
}

/* shuffle combined feed but ensure 50/50 proportion by loading equal counts */
const shuffleArray = arr => arr.map(v => ({ v, s: Math.random() })).sort((a,b)=>a.s-b.s).map(({v})=>v)
const mixedAestheticFeed = computed(() => shuffleArray([...stickerFeed.value, ...aestheticFeed.value]))

/* --------------------- TRENDY FEED --------------------- */
const trendyFeed = ref([])
const loadingTrendy = ref(false)

/* small utilities */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const formatText = t => (t || '').toString().replace(/</g,'&lt;').replace(/>/g,'&gt;')

/* ---- APIs (same as before) ---- */
const fetchJokes = async (count = 2) => {
  try {
    const res = await fetch(`https://sv443.net/jokeapi/v2/joke/Any?amount=${count}&safe-mode`)
    const data = await res.json()
    const jokes = Array.isArray(data) ? data : (data.jokes || [data])
    return jokes.map(j => ({
      id: 'joke_'+Math.random().toString(36).slice(2),
      author: 'JokeAPI 😄',
      text: j.type === 'twopart' ? `${j.setup} — ${j.delivery}` : j.joke,
      tag: 'joke',
      avatar: `https://i.pravatar.cc/40?img=${randInt(1,70)}`,
      likes: randInt(50, 800),
      views: randInt(200, 5000)
    }))
  } catch (e) {
    console.warn('Joke fetch error', e)
    return []
  }
}

const fetchMemes = async (count = 5) => {
  try {
    const res = await fetch(`https://meme-api.com/gimme/${count}`)
    const data = await res.json()
    const memes = data.memes || []
    return memes
      .filter(m => m.url && !/nsfw|porn|sex|adult|hentai|kill|dead/i.test(m.title))
      .map(m => ({
        id: 'meme_' + Math.random().toString(36).slice(2),
        author: m.subreddit || 'r/memes',
        text: m.title,
        image: m.url,
        tag: 'meme',
        avatar: `https://i.pravatar.cc/40?img=${randInt(1, 70)}`,
        likes: randInt(100, 1200),
        views: randInt(800, 8000),
      }))
  } catch (e) {
    console.warn('Meme fetch error', e)
    return []
  }
}

const fetchQuotes = async () => {
  try {
    const proxy = 'https://api.allorigins.win/raw?url='
    const res = await fetch(proxy + encodeURIComponent('https://zenquotes.io/api/quotes'))
    const data = await res.json()
    return (data || []).slice(0, 6).map(q => ({
      id: 'quote_' + Math.random().toString(36).slice(2),
      author: q.a || 'Anonymous 💫',
      text: q.q + ' — vibe hai ✨',
      tag: 'quote',
      avatar: `https://i.pravatar.cc/40?img=${randInt(1, 70)}`,
      likes: randInt(50, 700),
      views: randInt(400, 5000),
    }))
  } catch (e) {
    console.warn('Quote fetch error', e)
    return []
  }
}

const fetchAnimePosts = async () => {
  try {
    const res = await fetch('https://api.jikan.moe/v4/random/anime')
    const data = await res.json()
    if (!data?.data) return []
    return [{
      id: 'anime_'+data.data.mal_id,
      author: data.data.title || 'AnimeWorld 💫',
      text: `“${data.data.title_english || data.data.title}” — ${data.data.synopsis?.slice(0,140) || 'Epic vibes from anime land 💥'}`,
      image: data.data.images?.jpg?.large_image_url || '',
      tag: 'anime',
      avatar: `https://i.pravatar.cc/40?img=${randInt(1,70)}`,
      likes: randInt(100,1500),
      views: randInt(1500,10000)
    }]
  } catch(e) {
    console.warn('Anime fetch error', e)
    return []
  }
}

const NEWS_API_KEY = 'pub_813a0a5ec88c4b1790f72fca31e1abd6' // replace if needed
const fetchGossip = async () => {
  try {
    const res = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=celebrity OR fashion OR gossip OR beauty OR lifestyle&language=en`)
    const data = await res.json()
    if (!data?.results) return []
    const clean = data.results.filter(n =>
      n.title && n.image_url && !/sex|violence|murder|killed|adult|nude|nsfw/i.test(n.title + (n.description||''))
    )
    return clean.slice(0,4).map(n => ({
      id: 'news_'+Math.random().toString(36).slice(2),
      author: n.source_id || 'DesiBuzz 📰',
      text: `${n.title} — ${n.description || ''}`,
      image: n.image_url,
      tag: 'gossip',
      avatar: `https://i.pravatar.cc/40?img=${randInt(1,70)}`,
      likes: randInt(60,800),
      views: randInt(1000,9000)
    }))
  } catch (e) {
    console.warn('News fetch error', e)
    return []
  }
}

const GIPHY_API_KEY = 'glcjmuobQ7FftTY7u8HPO7h1w6QM5NTQ' // get from developers.giphy.com
const fetchGifs = async (limit = 5) => {
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`
    )
    const data = await res.json()
    return data.data.map(g => ({
      id: 'gif_' + g.id,
      author: g.username || 'Giphy 🎞️',
      text: g.title || 'Giphy vibe ✨',
      image: g.images.original.webp || g.images.original.url,
      tag: 'gif',
      avatar: `https://i.pravatar.cc/40?img=${randInt(1,70)}`,
      likes: randInt(200, 1000),
      views: randInt(1000, 10000)
    }))
  } catch (e) {
    console.warn('Giphy fetch error', e)
    return []
  }
}

/* ---- 🎵 Fetch Trending / New Music from iTunes ---- */
const fetchMusic = async (limit = 8) => {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=popular&entity=song&limit=${limit}`);
    const data = await res.json();
    if (!data?.results) return [];

    return data.results.map((t) => ({
      id: 'music_' + t.trackId,
      author: t.artistName + ' 🎤',
      text: `Now Trending: “${t.trackName}” — ${t.collectionName}`,
      image: t.artworkUrl100.replace('100x100bb', '300x300bb'),
      tag: 'music',
      avatar: `https://i.pravatar.cc/40?img=${randInt(1,70)}`,
      likes: randInt(80, 1200),
      views: randInt(1000, 10000),
      preview: t.previewUrl // 30-second preview link
    }));
  } catch (e) {
    console.warn('Music fetch error', e);
    return [];
  }
};

/* ---- 🎬 Fetch Movies from OMDb ---- */
const API_KEY = "98b48412"; // 🔑 Replace this

const fetchMovies = async (searchTerm = "2024", limit = 8) => {
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie`);
    const data = await res.json();

    if (data.Response === "False") return [];

    return data.Search.slice(0, limit).map((movie) => ({
      id: 'movie_' + movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      type: movie.Type,
      image: movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster",
      description: `${movie.Title} (${movie.Year})`,
      imdb: `https://www.imdb.com/title/${movie.imdbID}`,
      tag: 'movies'
    }));
  } catch (err) {
    console.error("Movie fetch error:", err);
    return [];
  }
};


/* ---- Combine sources into one mixed batch ---- */
const buildTrendyBatch = async () => {
  const [memes, jokes, quotes, gossip, anime, gifs, music, movies] = await Promise.allSettled([
    fetchMemes(3),
    fetchJokes(2),
    fetchQuotes(),
    fetchGossip(),
    fetchAnimePosts(),
    fetchGifs(3),
    fetchMusic(4), // 👈 new 
    fetchMovies("new movie", 6) // 👈 Added this
  ])
  const resolved = []
  if (memes.status === 'fulfilled') resolved.push(...(memes.value || []))
  if (jokes.status === 'fulfilled') resolved.push(...(jokes.value || []))
  if (quotes.status === 'fulfilled') resolved.push(...(quotes.value || []))
  if (gossip.status === 'fulfilled') resolved.push(...(gossip.value || []))
  if (anime.status === 'fulfilled') resolved.push(...(anime.value || []))
  if (gifs.status === 'fulfilled') resolved.push(...(gifs.value || []))
if (music.status === 'fulfilled') resolved.push(...(music.value || []));



  const baseTrendy = [
    { author: 'Anu 💖', text: 'Bestie bolti “study kar”, me bolti “fashion pe focus kar” 😭', tag: 'funny' },
    { author: 'Tanya ✨', text: 'Playlist: sad songs, mood: stylish 🖤', tag: 'mood' },
    { author: 'Riya 💅', text: 'Nails slay, grades delay 😭', tag: 'confession' },
    { author: 'Mehak 🌸', text: 'Cuteness level: filter + fairy lights 💫', tag: 'vibe' }
  ]
  const locals = Array.from({ length: 2 }).map(() => ({
    id: 'local_'+Math.random().toString(36).slice(2),
    ...baseTrendy[Math.floor(Math.random()*baseTrendy.length)],
    avatar: `https://i.pravatar.cc/40?img=${randInt(1,70)}`,
    likes: randInt(50,900),
    views: randInt(300,7000)
  }))

  const batch = [...resolved, ...locals]
  return shuffleArray(batch).slice(0, 10)
}

const loadInitialTrendy = async () => {
  loadingTrendy.value = true
  trendyFeed.value = await buildTrendyBatch()
  loadingTrendy.value = false
}
const loadMoreTrendy = async () => {
  if (loadingTrendy.value) return
  loadingTrendy.value = true
  const newBatch = await buildTrendyBatch()
  trendyFeed.value.push(...newBatch)
  loadingTrendy.value = false
}

/* ---- Likes persisted in localStorage ---- */
const LS_LIKES = 'explore_likes_v4'
let savedLikes = JSON.parse(localStorage.getItem(LS_LIKES) || '{}')
const isLiked = id => !!savedLikes[id]
const toggleLike = (post) => {
  const id = post.id
  if (savedLikes[id]) {
    delete savedLikes[id]
    post.likes = Math.max(0, (post.likes || 0) - 1)
  } else {
    savedLikes[id] = true
    post.likes = (post.likes || 0) + 1
  }
  localStorage.setItem(LS_LIKES, JSON.stringify(savedLikes))
}

/* ---- Single-post reshuffle ---- */
const reshufflePost = async (id) => {
  const idx = trendyFeed.value.findIndex(p => p.id === id)
  if (idx === -1) return
  const newP = (await buildTrendyBatch())[0]
  if (newP) trendyFeed.value.splice(idx, 1, newP)
}

/* ---- Shuffle all trendy feed ---- */
const shuffleAll = () => {
  trendyFeed.value = shuffleArray(trendyFeed.value)
}

/* ---- Scroll handling: debounced infinite scroll ---- */
let scrollTimeout = null
const showTopBtn = ref(false)
const onScrollCheck = () => {
  showTopBtn.value = window.scrollY > 400
  if (currentTab.value === 'Trendy') {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
      loadMoreTrendy()
    }
  } else if (currentTab.value === 'Aesthetic') {
    // for Aesthetic infinite load, trigger mixed load when near bottom
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
      loadMoreMixed()
    }
  }
}
const handlePageScroll = () => {
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(onScrollCheck, 180)
}
const onPageScroll = () => handlePageScroll()
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

/* ---- Utility: share/copy/open ---- */
const showToast = ref(false)
const toastMessage = ref('')

const toast = (msg = '', ms = 1400) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => (showToast.value = false), ms)
}

const copySticker = async (st) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(st.url)
      toast('✨ Link copied!')
    } else {
      const el = document.createElement('textarea')
      el.value = st.url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      el.remove()
      toast('✨ Link copied!')
    }
  } catch (e) {
    console.warn('copy failed', e)
    toast('Copy failed 😭')
  }
}

const sharePost = async (post) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: post.author,
        text: (post.text || '').slice(0,120),
        url: post.image || window.location.href
      })
    } catch (e) {
      console.warn('Share failed', e)
      toast('Could not share')
    }
  } else {
    try {
      const payload = post.image || post.text || window.location.href
      await navigator.clipboard.writeText(payload)
      toast('Link copied to clipboard for sharing!')
    } catch {
      toast('Share not available')
    }
  }
}

const openItem = (url) => window.open(url, '_blank')

/* ---- Image error fallback for post images ---- */
const handleImageError = (post) => {
  if (post && post.image) post.image = `https://picsum.photos/600/400?random=${Math.floor(Math.random()*9999)}`
}

/* ---- Lifecycle ---- */
onMounted(async () => {
  loadInitialStickers()
  loadInitialPhotos()
  await nextTick()
  setupImageObserver()
  loadInitialTrendy()
  window.addEventListener('scroll', handlePageScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handlePageScroll)
  if (imageObserver) imageObserver.disconnect()
})
</script>

<style scoped>
/* ---------- Basic page ---------- */
.explore-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff8fb, #fff4fe);
  padding: 2rem 1rem;
  font-family: 'Poppins', sans-serif;
  animation: fadeSlideIn .45s ease;
}
@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }

.explore-header { text-align: center; margin-bottom: 1rem; }
.gradient-text {
  font-size: 2.2rem; font-weight: 800;
  background: linear-gradient(90deg, #ff8ec7, #b77bff);
  -webkit-background-clip: text; color: transparent;
  text-shadow: 0 0 10px rgba(255,142,199,0.22), 0 0 20px rgba(183,123,255,0.12);
  animation: glowPulse 3s ease-in-out infinite;
}
@keyframes glowPulse {
  0%,100% { text-shadow: 0 0 8px rgba(255,142,199,0.2) }
  50% { text-shadow: 0 0 20px rgba(255,142,199,0.45) }
}
.subtitle { color: #666; font-size: 0.95rem; margin-top: 6px; }
.disclaimer { text-align:center; margin-top:1rem; color:#999; font-size:0.85rem; }

/* ---------- Tabs ---------- */
.tab-bar { display:flex; justify-content:center; gap:0.6rem; margin: 1rem 0; }
.tab-btn {
  padding: 0.45rem 0.9rem; border-radius: 999px; border: none; cursor: pointer;
  background: rgba(183,123,255,0.08); font-weight: 700; color: #5a189a;
  transition: all .18s ease;
}
.tab-btn.active {
  background: linear-gradient(90deg,#b77bff,#ff8ec7);
  color: #fff; box-shadow: 0 6px 18px rgba(183,123,255,0.12);
}
.tab-btn:active { transform: scale(.98) }

/* ---------- Aesthetic Grid ---------- */
.explore-grid {
  column-count: 4; column-gap: 1rem;
  width: min(1200px, 96%); margin: 0 auto;
}
@media (max-width: 1024px) { .explore-grid { column-count: 3 } }
@media (max-width: 768px) { .explore-grid { column-count: 2 } }

/* Sticker / photo card */
.sticker-card {
  break-inside: avoid; margin-bottom: 1rem; border-radius: 14px; overflow: hidden;
  cursor: pointer; background: rgba(255,255,255,0.75);
  transition: transform .18s ease, box-shadow .18s ease;
  border: 1px solid rgba(183,123,255,0.06); position: relative;
}
.sticker-card:hover { transform: translateY(-6px); box-shadow: 0 8px 30px rgba(183,123,255,0.06); }
.sticker-img {
  width: 100%; height: auto; display:block; object-fit: cover; background: #fff;
  padding: 0.6rem; border-radius: 12px; opacity: 0; transition: opacity .28s ease;
}
.sticker-img.is-loaded { opacity: 1; }

/* skeleton */
.skeleton {
  width:100%; padding-top:100%; border-radius:12px;
  background: linear-gradient(90deg,#f7eef9 25%, #fff 50%, #f7eef9 75%);
  background-size: 200% 100%; animation: shimmer 1.4s linear infinite;
}
@keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }

/* sticker overlay on hover */
.sticker-overlay {
  position: absolute; inset: 0; display:flex; align-items:flex-end; justify-content:center;
  padding: 0.6rem; pointer-events: none; opacity: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.06) 100%);
  transition: opacity .18s ease;
  color: #fff; font-weight:700;
}
.sticker-card:hover .sticker-overlay { opacity: 1 }

/* Load more */
.load-more-container { text-align: center; margin: 1rem 0; }
.load-more-btn {
  padding: .6rem 1rem; border-radius: 999px; border:none; cursor:pointer;
  background: linear-gradient(90deg,#b77bff,#ff8ec7); color:#fff; font-weight:700;
}
.loader.small { color:#b77bff; font-weight:700; }

/* ---------- Trendy feed ---------- */
.trend-feed { max-width: 780px; margin: 0 auto; display:flex; flex-direction:column; gap:1rem; padding-bottom: 6rem; }

/* post card */
.trend-post {
  background: linear-gradient(180deg,#fff,#fffaf6);
  border-radius: 14px; padding: 1rem; border: 1px solid rgba(183,123,255,0.08);
  box-shadow: 0 6px 20px rgba(183,123,255,0.04);
  transition: transform .15s ease, box-shadow .15s ease;
}
.trend-post:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(183,123,255,0.06); }

/* post top */
.post-top { display:flex; gap:.75rem; align-items:center; margin-bottom:.45rem; }
.avatar { width:44px; height:44px; border-radius:50%; overflow:hidden; border:2px solid rgba(255,107,203,.08) }
.avatar img { width:100%; height:100%; object-fit:cover; display:block; }
.meta { flex:1; }
.meta-title { display:flex; gap:.4rem; align-items:center; color:#333; font-weight:700 }
.tag-badge {
  display:inline-block; background: linear-gradient(90deg,#b77bff22,#ff8ec722);
  color:#b77bff; font-weight:600; font-size:.78rem; padding:2px 8px; border-radius:8px; margin-top:6px;
}

/* micro-meme */
.micro-meme { margin: .6rem 0; border-radius: 10px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); cursor: pointer; }
.micro-meme img { width:100%; height:auto; display:block; }

/* text */
.trend-text { font-size:1rem; line-height:1.5; color:#333; margin-top:.25rem; white-space:pre-wrap; }

/* actions */
.post-actions { display:flex; align-items:center; gap:0.6rem; margin-top:.8rem; }
.like-btn {
  display:flex; align-items:center; gap:.45rem; background: linear-gradient(90deg,#fff,#fff);
  border:1px solid rgba(183,123,255,0.08); padding:.36rem .62rem; border-radius:999px; cursor:pointer;
  transition: transform .15s ease, box-shadow .15s ease;
}
.like-btn:hover { transform: translateY(-3px) }
.like-btn .heart { color:#ff6b9f; font-size:1rem; transform-origin:center; transition: transform .18s ease; }
.like-btn.liked { box-shadow: 0 8px 22px rgba(255,107,203,0.14); }
.like-btn.liked .heart { transform: scale(1.24); animation: heartPop .36s ease; }
@keyframes heartPop { 0% { transform: scale(.9) } 50% { transform: scale(1.4) } 100% { transform: scale(1.2) } }
.like-btn .count { font-weight:700; color:#5a189a; font-size:.95rem; }

/* share & reshuffle */
.share-btn { background:transparent; border:none; cursor:pointer; font-size:1.05rem }
.views { color:#6b6b6b; font-weight:700; font-size:.95rem; }
.reshuffle { margin-left:auto; background:transparent; border:none; cursor:pointer; font-size:1.05rem }

/* loader */
.loader { text-align:center; color:#b77bff; font-weight:700; margin-top:1rem; }

/* ---------- Sticky buttons ---------- */
.shuffle-btn {
  position: fixed; bottom: 2rem; left: 1.4rem;
  width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer;
  background: linear-gradient(90deg,#b77bff,#ff8ec7); color: #fff; font-size: 1.3rem;
  box-shadow: 0 8px 24px rgba(183,123,255,0.18); z-index: 60;
  transition: transform .18s ease;
}
.shuffle-btn:hover { transform: translateY(-6px) scale(1.05); }

.scroll-top {
  position: fixed; bottom: 2rem; right: 1.6rem;
  width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer;
  background: linear-gradient(90deg,#ff8ec7,#b77bff); color: #fff; font-size: 1.3rem;
  box-shadow: 0 8px 24px rgba(183,123,255,0.18); z-index: 60;
  transition: transform .18s ease;
}
.scroll-top:hover { transform: translateY(-6px) scale(1.05); }

/* toast */
.toast {
  position: fixed; bottom: 6.5rem; left: 50%; transform: translateX(-50%);
  background: linear-gradient(90deg,#b77bff,#ff8ec7); color: #fff; padding: 0.6rem 1.2rem;
  border-radius: 999px; font-weight: 600; box-shadow: 0 6px 20px rgba(183,123,255,0.25); z-index: 100;
}

/* entertainment note */
.entertainment-note {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: 0; width: 100%; max-width: 900px; padding: .55rem 1rem;
  background: linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,250,255,0.95));
  border-top-left-radius: 14px; border-top-right-radius: 14px;
  text-align: center; color: #6b6b6b; font-weight: 700; font-size: 0.9rem;
  box-shadow: 0 -6px 20px rgba(183,123,255,0.04); z-index: 50;
}

/* animations for list items */
.list-enter-active, .list-leave-active { transition: all .35s ease; }
.list-enter-from { opacity: 0; transform: translateY(8px) scale(.995); }
.list-enter-to { opacity: 1; transform: translateY(0) scale(1); }

/* responsive */
@media (max-width: 900px) {
  .explore-grid { column-count: 2; }
  .trend-feed { padding: 0 .6rem; }
}
@media (max-width: 520px) {
  .explore-grid { column-count: 1; } /* ✅ now single column on small screens */
  .shuffle-btn { left: 0.8rem; bottom: 3.8rem; }
  .scroll-top { right: 0.8rem; bottom: 3.8rem; }
  .entertainment-note {
    font-size: 0.82rem;
    padding: 0.45rem 0.6rem;
    bottom: 0;
    max-width: 100%;
  }
}
@media (max-width: 520px) {
  /* Aesthetic sticker image rounding — Pinterest feel */
  .sticker-img {
    border-radius: 18px;   /* smoother corners */
    padding: 0;            /* remove inner white padding for clean edge-to-edge */
  }

  .sticker-card {
    border-radius: 18px;   /* match card rounding */
    overflow: hidden;
  }
}


@media (min-width: 1025px) {
  .trend-feed {
    max-width: 640px; /* smaller container (was 780px) */
  }
  .trend-post {
    padding: 0.8rem 1rem; /* less padding */
    border-radius: 10px;
  }
  .trend-text {
    font-size: 0.92rem; /* slightly smaller text */
    line-height: 1.45;
  }
  .avatar {
    width: 38px;
    height: 38px;
  }
  .post-actions {
    gap: 0.4rem;
  }
}


/* small empty feed message style */
.empty-feed { text-align: center; color: #aaa; font-weight: 600; margin-top: 2rem; }
</style>
