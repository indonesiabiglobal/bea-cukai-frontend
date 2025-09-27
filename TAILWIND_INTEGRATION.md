# Integrasi Tailwind CSS dengan Bulma

Project ini telah dikonfigurasi untuk menggunakan Tailwind CSS bersama dengan Bulma CSS framework yang sudah ada. Kedua framework ini dapat bekerja bersama dengan harmonis.

## Konfigurasi

### 1. Tailwind Configuration
File konfigurasi Tailwind telah dibuat di `tailwind.config.js` dengan pengaturuan berikut:
- **Prefix**: `` - Semua class Tailwind menggunakan prefix `` untuk menghindari konflik dengan Bulma
- **Preflight disabled**: Core reset dari Tailwind dinonaktifkan untuk tidak mengganggu styling Bulma
- **Custom colors**: Warna-warna dari CSS variables project telah ditambahkan ke Tailwind

### 2. PostCSS Configuration
File `postcss.config.js` telah dikonfigurasi untuk memproses Tailwind CSS.

### 3. Import Tailwind
Tailwind CSS diimpor dalam `src/scss/tailwind.scss` dan kemudian diimpor ke `main.scss`.

## Cara Penggunaan

### Menggunakan Tailwind bersama Bulma

#### 1. Kombinasi Classes
```vue
<!-- Bulma card dengan Tailwind utilities -->
<div class="card transition-transform duration-300 hover:scale-105">
  <div class="card-content">
    <h3 class="title is-5 text-gray-800">Title</h3>
    <p class="text-gray-600">Content dengan styling campuran</p>
  </div>
</div>
```

#### 2. Layout dengan Tailwind Grid
```vue
<!-- Menggunakan Tailwind grid untuk layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="card">
    <!-- Bulma card content -->
  </div>
</div>
```

#### 3. Responsive Design
```vue
<!-- Responsive utilities dari Tailwind -->
<div class="flex flex-col sm:flex-row gap-4">
  <button class="button is-primary flex-1">Bulma Button</button>
  <button class="btn-secondary flex-1">Tailwind Button</button>
</div>
```

### Custom Components dalam Tailwind

File `src/scss/tailwind.scss` berisi custom components yang bisa digunakan:

- `.card` - Card component dengan Tailwind styling
- `.btn-primary`, `.btn-secondary` - Button components
- `.input` - Input styling
- `.dashboard-grid` - Grid layout untuk dashboard
- `.dashboard-container` - Container untuk dashboard

### Warna yang Tersedia

**1. Warna Tailwind Default (tanpa prefix):**
```vue
<!-- Semua warna Tailwind default tersedia -->
<div class="bg-blue-500 text-white">Blue background</div>
<div class="text-red-600 border-green-300">Red text, green border</div>
<div class="bg-gradient-to-r from-purple-500 to-pink-500">Gradient</div>

<!-- Semua shade tersedia (50, 100, 200, ..., 900) -->
<div class="bg-gray-50">Lightest gray</div>
<div class="bg-gray-900">Darkest gray</div>
```

**2. Warna Project dari CSS Variables:**
```vue
<!-- Warna yang sudah dikonfigurasi dari project -->
<div class="text-bulma-primary">Primary project color</div>
<div class="text-dark-text bg-card-bg">Custom project colors</div>
<div class="border-bulma-success">Success border</div>
```

**Warna Tailwind yang tersedia:**
- `gray`, `red`, `yellow`, `green`, `blue`, `indigo`, `purple`, `pink`
- `slate`, `zinc`, `neutral`, `stone` (gray variations)
- `orange`, `amber`, `lime`, `emerald`, `teal`, `cyan`, `sky`, `violet`, `fuchsia`, `rose`
- Semua dengan shade: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900`

## Best Practices

### 1. Kapan Menggunakan Bulma vs Tailwind

**Gunakan Bulma untuk:**
- Komponen UI yang sudah tersedia (buttons, cards, navbar, dll.)
- Typography system yang sudah established
- Form elements yang sudah styled

**Gunakan Tailwind untuk:**
- Layout dan spacing (flexbox, grid, margins, padding)
- Custom styling dan micro-interactions
- Responsive design utilities
- Color utilities dan variations
- Animation dan transitions

### 2. Penggunaan Class (Tanpa Prefix)

Dengan konfigurasi saat ini, Anda bisa menggunakan class Tailwind tanpa prefix:
```vue
<!-- ✅ Correct - Tailwind tanpa prefix -->
<div class="card shadow-lg transition-all bg-blue-500 text-white">
  Bulma card dengan Tailwind utilities
</div>

<!-- ✅ Juga bisa kombinasi -->
<div class="button is-primary hover:scale-105 transition-transform">
  Bulma button dengan Tailwind animation  
</div>
```

**Catatan:** Jika terjadi konflik class, Anda bisa mengaktifkan prefix dengan mengubah `prefix: ''` di `tailwind.config.js`

### 3. Kombinasi yang Baik

```vue
<!-- Layout dengan Tailwind, Components dengan Bulma -->
<div class="container mx-auto px-4">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="card transition-transform hover:scale-105">
      <div class="card-content">
        <h3 class="title is-5 mb-4">Bulma Title</h3>
        <p class="text-gray-600 leading-relaxed">
          Text dengan Tailwind utility
        </p>
        <button class="button is-primary mt-4 w-full">
          Bulma button dengan Tailwind width
        </button>
      </div>
    </div>
  </div>
</div>
```

## Dark Mode Support

Dark mode sudah dikonfigurasi dalam Tailwind. Gunakan class `dark:` untuk styling dark mode:

```vue
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content yang responsive terhadap dark mode
</div>
```

## Contoh Implementasi

Lihat file `src/components/examples/TailwindBulmaExample.vue` untuk contoh lengkap penggunaan Tailwind CSS bersama Bulma dalam komponen Vue.

## Troubleshooting

### Jika Tailwind classes tidak bekerja:
1. Pastikan development server sudah restart setelah konfigurasi
2. Periksa bahwa prefix `` digunakan
3. Pastikan file `tailwind.scss` sudah diimpor dalam `main.scss`

### Jika terjadi konflik styling:
1. Gunakan prefix `` konsisten
2. Periksa specificity CSS
3. Gunakan `!important` jika diperlukan dengan `!important`

### Build Issues:
1. Pastikan PostCSS dan Tailwind terkonfigurasi dengan benar di Vite
2. Periksa bahwa semua dependencies terinstall
3. Clear cache dengan `npm run build -- --force`