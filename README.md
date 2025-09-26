# vite-plugin-favicon-generator

<p align="center">
<img src="https://static.isap.me/vite-plugin-favicon-generator.png" width="1280" title="vite-plugin-favicon-generator">
</p>

A Vite plugin that automatically generates favicons from a source image using the powerful [favicons](https://github.com/itgalaxy/favicons) library.

## Features

- 🎯 Generate multiple favicon formats from a single source image
- 🔧 Fully configurable favicon options
- 🚀 Automatic HTML injection into `index.html`
- 📁 Custom output directory and public path
- 🔄 Development server support with in-memory serving
- 📝 Optional HTML tags file generation
- 🎨 Support for Android, Apple, and standard favicons

## Installation

```bash
npm install vite-plugin-favicon-generator --save-dev
# or
yarn add vite-plugin-favicon-generator --dev
# or
pnpm add vite-plugin-favicon-generator --save-dev
```

## Usage

### Basic Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import faviconPlugin from 'vite-plugin-favicon-generator'

export default defineConfig({
  plugins: [
    faviconPlugin({
      source: 'src/assets/favicon.png', // Source favicon image
      appName: 'My App',
      theme_color: '#1a1065',
      background: '#ffffff',
    })
  ]
})
```

### Advanced Configuration

```js
// vite.config.js
import { defineConfig } from 'vite'
import faviconPlugin from 'vite-plugin-favicon-generator'

export default defineConfig({
  plugins: [
    faviconPlugin({
      // Source image
      source: 'src/assets/favicon.png',
      
      // Output configuration
      outputDir: 'icons', // Output directory (relative to dist)
      publicPath: '/icons', // Public path for HTML links
      htmlOutput: 'src/favicon-tags.html', // Generate HTML tags file
      injectHtml: true, // Auto-inject into index.html
      
      // Favicon configuration (same as favicons library)
      appName: 'My Awesome App',
      appShortName: 'MyApp',
      appDescription: 'My awesome application description',
      developerName: 'Your Name',
      developerURL: 'https://yoursite.com',
      lang: 'en-US',
      theme_color: '#1a1065',
      background: '#ffffff',
      
      // Icon types to generate
      icons: {
        android: true,              // Android homescreen icon
        appleIcon: true,           // Apple touch icons
        appleStartup: false,       // Apple startup images
        favicons: true,            // Regular favicons
        windows: false,            // Windows 8 tile icons
        yandex: false,             // Yandex browser icon
      },
      
      // Platform-specific options
      android: {
        offset: 10,
        background: '#ffffff'
      },
      appleIcon: {
        offset: 10,
        background: '#ffffff'
      }
    })
  ]
})
```

## Configuration Options

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | `string` | `'src/favicon.png'` | Path to the source favicon image |
| `outputDir` | `string` | `'favicons'` | Output directory for generated favicons (relative to build output) |
| `publicPath` | `string` | `'/favicons'` | Public path for favicons in HTML |
| `htmlOutput` | `string` | `undefined` | Output file for HTML tags (relative to project root) |
| `injectHtml` | `boolean` | `true` | Whether to inject HTML tags into index.html |

### Favicon Options

All options from the [favicons library](https://github.com/itgalaxy/favicons#usage) are supported:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | `null` | Your application's name |
| `appShortName` | `string` | `appName` | Your application's short name |
| `appDescription` | `string` | `null` | Your application's description |
| `developerName` | `string` | `null` | Your name |
| `developerURL` | `string` | `null` | Your website |
| `lang` | `string` | `'en-US'` | Primary language for name and short_name |
| `background` | `string` | `'#fff'` | Background color for flattened icons |
| `theme_color` | `string` | `'#fff'` | Theme color user agents should use |
| `icons` | `object` | See below | Platform-specific icon settings |

### Icons Configuration

```js
icons: {
  android: true,              // Create Android homescreen icon
  appleIcon: true,           // Create Apple touch icons  
  appleStartup: false,       // Create Apple startup images
  favicons: true,            // Create regular favicons
  windows: false,            // Create Windows 8 tile icons
  yandex: false,             // Create Yandex browser icon
}
```

Each icon type can also accept an object with `offset` and `background` properties:

```js
icons: {
  android: {
    offset: 10,
    background: '#ffffff'
  },
  appleIcon: {
    offset: 15,
    background: 'transparent'
  }
}
```

## Examples

### React + TypeScript

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import faviconPlugin from 'vite-plugin-favicon-generator'

export default defineConfig({
  plugins: [
    react(),
    faviconPlugin({
      source: 'src/assets/logo.png',
      appName: 'React App',
      appDescription: 'My React application',
      theme_color: '#646cff',
      background: '#ffffff',
      icons: {
        android: true,
        appleIcon: true,
        favicons: true,
      }
    })
  ]
})
```

### Vue.js

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import faviconPlugin from 'vite-plugin-favicon-generator'

export default defineConfig({
  plugins: [
    vue(),
    faviconPlugin({
      source: 'src/assets/favicon.png',
      appName: 'Vue App',
      theme_color: '#4fc08d',
      background: '#ffffff',
    })
  ]
})
```
### Laravel

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import faviconPlugin from 'vite-plugin-favicon-generator'

export default defineConfig({
  plugins: [
    laravel(),
    faviconPlugin({
        source: 'resources/images/favicon.png',
        outputDir: 'public/favicons',
        publicPath: '/favicons',
        htmlOutput: 'resources/views/favicons.blade.php',
        injectHtml: false,
        icons: {
            android: true,
            appleIcon: true,
            appleStartup: false,
            favicons: true,
            windows: false,
            yandex: false,
        },
    })
  ]
})
```

```blade
{{-- layout.blade.php --}}
@if(file_exists(resource_path('views/favicons.blade.php')))
    @include('favicons')
@endif
```

### Custom Output and HTML Generation

```js
faviconPlugin({
  source: 'assets/icon.png',
  outputDir: 'static/icons',
  publicPath: '/static/icons',
  htmlOutput: 'public/favicon-meta.html',
  injectHtml: false, // Don't auto-inject, use the HTML file instead
  appName: 'My Custom App',
})
```

## Development vs Production

- **Development**: Favicons are generated in memory and served via middleware
- **Production**: Favicons are generated as static files in the build output directory

## Requirements

- Node.js >= 16
- Vite >= 5.0.0

## Contributing

Please, submit bugs or feature requests via the [Github issues](https://github.com/isap-ou/vite-plugin-favicon-generator/issues).

Pull requests are welcomed!

Thanks!

## License

This project is open-sourced software licensed under the [MIT License](https://opensource.org/licenses/MIT).

You are free to use, modify, and distribute it in your projects, as long as you comply with the terms of the license.

---

Maintained by [ISAPP](https://isapp.be).  
Check out our software development services at [isapp.be](https://isapp.be).