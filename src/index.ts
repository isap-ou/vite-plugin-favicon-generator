import {FaviconOptions, favicons} from 'favicons';
import path from 'path';
import {promises as fs} from 'fs';
import type {Plugin} from 'vite';

export interface ViteFaviconOptions extends Partial<FaviconOptions> {
    /**
     * Path to the source favicon image
     * @default 'src/favicon.png'
     */
    source?: string;

    /**
     * Output directory for generated favicons (relative to build output)
     * @default 'favicons'
     */
    outputDir?: string;

    /**
     * Public path for favicons in HTML
     * @default '/favicons'
     */
    publicPath?: string;

    /**
     * Output file for HTML tags (relative to project root)
     * @default undefined (no HTML file generated)
     */
    htmlOutput?: string;

    /**
     * Whether to inject HTML tags into index.html
     * @default true
     */
    injectHtml?: boolean;
}

const DEFAULT_OPTIONS: Required<Pick<ViteFaviconOptions, 'source' | 'outputDir' | 'publicPath' | 'injectHtml'>> = {
    source: 'src/favicon.png',
    outputDir: 'favicons',
    publicPath: '/favicons',
    injectHtml: true,
};

export default function viteFaviconPlugin(options: ViteFaviconOptions = {}): Plugin {
    const {
        source = DEFAULT_OPTIONS.source,
        outputDir = DEFAULT_OPTIONS.outputDir,
        publicPath = DEFAULT_OPTIONS.publicPath,
        htmlOutput,
        injectHtml = DEFAULT_OPTIONS.injectHtml,
        ...faviconOptions
    } = options;

    let generatedHtml: string[] = [];
    let isBuilding = false;

    const defaultFaviconOptions: Partial<FaviconOptions> = {
        path: publicPath,
        icons: {
            android: true,
            appleIcon: true,
            appleStartup: false,
            favicons: true,
            windows: false,
            yandex: false,
        },
    };

    const mergedFaviconOptions = {
        ...defaultFaviconOptions,
        ...faviconOptions,
        path: publicPath, // Ensure path is always set to publicPath
    };

    return {
        name: 'vite-favicon-generator',

        configResolved(config) {
            isBuilding = config.command === 'build';
        },

        async buildStart() {
            try {
                const sourcePath = path.resolve(source);

                // Check if source file exists
                try {
                    await fs.access(sourcePath);
                } catch {
                    this.warn(`Favicon source file not found: ${sourcePath}`);
                    return;
                }

                const response = await favicons(sourcePath, mergedFaviconOptions);
                generatedHtml = response.html;

                if (isBuilding) {
                    // Generate favicon files during build
                    const destPath = path.resolve('dist', outputDir);

                    // Create output directory
                    await fs.mkdir(destPath, {recursive: true});

                    // Write favicon images
                    await Promise.all(
                        response.images.map(async (image) => {
                            await fs.writeFile(path.join(destPath, image.name), image.contents);
                        })
                    );

                    // Write favicon files (like manifest.json, browserconfig.xml)
                    await Promise.all(
                        response.files.map(async (file) => {
                            await fs.writeFile(path.join(destPath, file.name), file.contents);
                        })
                    );

                    console.log(`✓ Generated ${response.images.length} favicon images and ${response.files.length} favicon files`);
                }

                // Write HTML file if specified
                if (htmlOutput) {
                    const htmlPath = path.resolve(htmlOutput);
                    await fs.writeFile(htmlPath, generatedHtml.join('\n'));
                    console.log(`✓ Generated HTML tags file: ${htmlOutput}`);
                }

            } catch (error) {
                this.error(`Failed to generate favicons: ${error}`);
            }
        },

        transformIndexHtml: {
            order: 'pre',
            handler(html) {
                if (!injectHtml || generatedHtml.length === 0) {
                    return html;
                }

                // Find the closing </head> tag and insert favicon HTML before it
                const headCloseTag = html.lastIndexOf('</head>');
                if (headCloseTag === -1) {
                    this.warn('Could not find </head> tag in index.html to inject favicon tags');
                    return html;
                }

                const faviconHtmlString = generatedHtml.join('\n  ');
                return html.slice(0, headCloseTag) +
                    '  ' + faviconHtmlString + '\n' +
                    html.slice(headCloseTag);
            },
        },

        configureServer(server) {
            if (!isBuilding) {
                // Serve favicon files from memory during development
                server.middlewares.use(async (req, res, next) => {
                    if (req.url && req.url.startsWith(publicPath)) {
                        try {
                            const sourcePath = path.resolve(source);
                            const response = await favicons(sourcePath, mergedFaviconOptions);

                            const fileName = req.url.replace(publicPath + '/', '');
                            const file = [...response.images, ...response.files].find(f => f.name === fileName);

                            if (file) {
                                res.setHeader('Content-Type', getContentType(fileName));
                                res.end(file.contents);
                                return;
                            }
                        } catch (error) {
                            console.error('Error serving favicon:', error);
                        }
                    }
                    next();
                });
            }
        },
    };
}

function getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.webapp': 'application/x-web-app-manifest+json',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}