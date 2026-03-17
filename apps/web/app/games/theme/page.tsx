import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Theme Guide – Pen & Paper Games',
  description: 'Unified colour palette reference for all Pen & Paper Games.',
};

/**
 * Unified colour palette used across every game.
 * Each entry mirrors the CSS custom-property defined in globals.css.
 */
const PALETTE = [
  {
    name: 'Powder Blush',
    cssVar: '--powder-blush',
    tailwind: 'powder-blush',
    hex: '#ffadad',
    shades: {
      100: '#560000',
      200: '#ab0000',
      300: '#ff0202',
      400: '#ff5858',
      500: '#ffadad',
      600: '#ffbebe',
      700: '#ffcece',
      800: '#ffdede',
      900: '#ffefef',
    },
  },
  {
    name: 'Apricot Cream',
    cssVar: '--apricot-cream',
    tailwind: 'apricot-cream',
    hex: '#ffd6a5',
    shades: {
      100: '#542e00',
      200: '#a75c00',
      300: '#fb8a00',
      400: '#ffb050',
      500: '#ffd6a5',
      600: '#ffdeb6',
      700: '#ffe6c8',
      800: '#ffeeda',
      900: '#fff7ed',
    },
  },
  {
    name: 'Cream',
    cssVar: '--cream',
    tailwind: 'cream',
    hex: '#fdffb6',
    shades: {
      100: '#555800',
      200: '#aaaf00',
      300: '#f7ff08',
      400: '#faff60',
      500: '#fdffb6',
      600: '#fdffc6',
      700: '#feffd4',
      800: '#feffe2',
      900: '#fffff1',
    },
  },
  {
    name: 'Tea Green',
    cssVar: '--tea-green',
    tailwind: 'tea-green',
    hex: '#caffbf',
    shades: {
      100: '#0f5900',
      200: '#1eb100',
      300: '#34ff0b',
      400: '#7eff64',
      500: '#caffbf',
      600: '#d3ffca',
      700: '#deffd7',
      800: '#e9ffe4',
      900: '#f4fff2',
    },
  },
  {
    name: 'Electric Aqua',
    cssVar: '--electric-aqua',
    tailwind: 'electric-aqua',
    hex: '#9bf6ff',
    shades: {
      100: '#004b52',
      200: '#0096a3',
      300: '#00e0f5',
      400: '#47f0ff',
      500: '#9bf6ff',
      600: '#adf8ff',
      700: '#c2faff',
      800: '#d6fcff',
      900: '#ebfdff',
    },
  },
  {
    name: 'Baby Blue Ice',
    cssVar: '--baby-blue-ice',
    tailwind: 'baby-blue-ice',
    hex: '#a0c4ff',
    shades: {
      100: '#002053',
      200: '#003fa5',
      300: '#005ff8',
      400: '#4b90ff',
      500: '#a0c4ff',
      600: '#b1cfff',
      700: '#c5dbff',
      800: '#d8e7ff',
      900: '#ecf3ff',
    },
  },
  {
    name: 'Periwinkle',
    cssVar: '--periwinkle',
    tailwind: 'periwinkle',
    hex: '#bdb2ff',
    shades: {
      100: '#0d0057',
      200: '#1a00ad',
      300: '#2b05ff',
      400: '#745cff',
      500: '#bdb2ff',
      600: '#cbc2ff',
      700: '#d8d1ff',
      800: '#e5e0ff',
      900: '#f2f0ff',
    },
  },
  {
    name: 'Mauve',
    cssVar: '--mauve',
    tailwind: 'mauve',
    hex: '#ffc6ff',
    shades: {
      100: '#5b005b',
      200: '#b600b6',
      300: '#ff11ff',
      400: '#ff6cff',
      500: '#ffc6ff',
      600: '#ffd2ff',
      700: '#ffddff',
      800: '#ffe9ff',
      900: '#fff4ff',
    },
  },
  {
    name: 'Porcelain',
    cssVar: '--porcelain',
    tailwind: 'porcelain',
    hex: '#fffffc',
    shades: {
      100: '#656500',
      200: '#caca00',
      300: '#ffff30',
      400: '#ffff95',
      500: '#fffffc',
      600: '#fffffb',
      700: '#fffffc',
      800: '#fffffd',
      900: '#fffffe',
    },
  },
] as const;

export default function ThemeGuidePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
      {/* Header */}
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Theme Guide</h1>
        <p className="text-lg text-foreground/70">
          The unified colour palette used across every Pen&nbsp;&amp;&nbsp;Paper
          game. All colours are defined as CSS custom properties in{' '}
          <code className="rounded bg-foreground/5 px-1.5 py-0.5 text-sm font-mono">
            globals.css
          </code>{' '}
          and exposed as Tailwind utilities.
        </p>
      </header>

      {/* Palette Grid */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Colour Palette</h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PALETTE.map((colour) => (
            <div
              key={colour.name}
              className="overflow-hidden rounded-xl border border-foreground/10 bg-background shadow-sm"
            >
              {/* Main swatch */}
              <div
                className="h-24"
                style={{ backgroundColor: colour.hex }}
                aria-label={`${colour.name} swatch`}
              />

              {/* Shade strip */}
              <div className="flex h-6">
                {Object.entries(colour.shades).map(([shade, hex]) => (
                  <div
                    key={shade}
                    className="flex-1"
                    style={{ backgroundColor: hex }}
                    title={`${shade}: ${hex}`}
                  />
                ))}
              </div>

              {/* Info */}
              <div className="space-y-1 p-4">
                <p className="font-semibold">{colour.name}</p>
                <p className="font-mono text-sm text-foreground/60">
                  {colour.hex}
                </p>
                <p className="text-sm text-foreground/60">
                  CSS:&nbsp;
                  <code className="rounded bg-foreground/5 px-1 py-0.5 text-xs">
                    var({colour.cssVar})
                  </code>
                </p>
                <p className="text-sm text-foreground/60">
                  Tailwind:&nbsp;
                  <code className="rounded bg-foreground/5 px-1 py-0.5 text-xs">
                    bg-{colour.tailwind}
                  </code>
                  ,&nbsp;
                  <code className="rounded bg-foreground/5 px-1 py-0.5 text-xs">
                    text-{colour.tailwind}
                  </code>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Usage Examples</h2>

        {/* Background example */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Backgrounds</h3>
          <div className="flex flex-wrap gap-3">
            {PALETTE.map((c) => (
              <div
                key={c.tailwind}
                className="flex h-16 w-28 items-center justify-center rounded-lg border border-foreground/10 text-xs font-medium text-ink-black"
                style={{ backgroundColor: c.hex }}
              >
                bg-{c.tailwind}
              </div>
            ))}
          </div>
        </div>

        {/* Text colour example */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Text Colours</h3>
          <div className="flex flex-wrap gap-4">
            {PALETTE.map((c) => (
              <span
                key={c.tailwind}
                className="text-sm font-semibold"
                style={{ color: c.hex }}
              >
                text-{c.tailwind}
              </span>
            ))}
          </div>
        </div>

        {/* Code snippet */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Code Snippet</h3>
          <pre className="overflow-x-auto rounded-lg bg-foreground/5 p-4 text-sm font-mono leading-relaxed">
{`/* CSS variable usage */
.card {
  background: var(--powder-blush);
  color: var(--periwinkle);
}

/* Tailwind utility classes */
<div className="bg-powder-blush text-periwinkle border-mauve">
  Hello world
</div>`}
          </pre>
        </div>
      </section>

      {/* Accessibility */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Accessibility Notes</h2>
        <ul className="list-inside list-disc space-y-2 text-foreground/80">
          <li>
            All palette colours are pastel/light. Use dark text (
            <code className="rounded bg-foreground/5 px-1 py-0.5 text-xs font-mono">
              text-ink-black
            </code>
            ) on palette backgrounds for WCAG AA contrast.
          </li>
          <li>
            Avoid placing palette colours on top of each other without
            sufficient contrast.
          </li>
          <li>
            Player-selectable colours use checkmarks with{' '}
            <code className="rounded bg-foreground/5 px-1 py-0.5 text-xs font-mono">
              #000000
            </code>{' '}
            for reliable contrast against every swatch.
          </li>
        </ul>
      </section>
    </div>
  );
}
