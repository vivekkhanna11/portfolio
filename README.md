# Vivek Khanna, Urban Planning Portfolio


## What's included

- `index.html`, homepage with the four project "plates" (portfolio cards)
- `approach.html`, methodology page
- `about.html`, bio page
- `assets/css/style.css`, full design system (graphite, steel, off-white, sage)
- `assets/js/main.js`, nav toggle and scroll reveal, no dependencies
- `pdfs/`, put your real report PDFs here (see below)

## 1. Add your PDF reports

Add your actual report files into the `pdfs/` folder using exactly these
names (or update the `href` in `index.html` if you'd rather rename them):

| File to add                                     | Project                                              |
|--------------------------------------------------|-------------------------------------------------------|
| `pdfs/bridletowne-circle-mobility.pdf`           | Rebalancing Mobility at Bridletowne Circle (UBS 304)   |
| `pdfs/forest-hill-south-community-planning.pdf`  | Forest Hill South (UBS 201)                            |
| `pdfs/seneca-newnham-urban-design.pdf`           | Contextual Urban Design, Seneca Newnham (UBS 305)      |
| `pdfs/perth-cycling-network.pdf`                 | Local Cycling Network Connections, Perth (UBS 304)     |

## 2. Publish with GitHub Pages

You can do this entirely from github.com without a terminal:

1. Create a new public repository.
2. Upload every file and folder from this project (drag and drop preserves
   subfolders in most browsers).
3. Go to Settings, then Pages, then set Source to "Deploy from a branch,"
   branch `main`, folder `/(root)`, and save.
4. Your site goes live at `https://<your-username>.github.io/<your-repo>/`.

## 3. Personalize

- Update the bio and skills list in `about.html`.
- Each project's SVG diagram in `index.html` is abstract line art standing
  in for a real map or plan graphic. Swap in an exported plan, a GIS
  screenshot, or a photo per project by replacing the `<svg>...</svg>` block
  inside `.plate-media` with an `<img>` tag pointing at
  `assets/img/your-image.jpg`.
- Adjust the accent colors (`--sage`, `--graphite`) in
  `assets/css/style.css` if you want to shift the palette.

## Design system

- Colors: graphite `#17191b`, steel `#5c6670`, off-white `#f2f0ea`, sage `#7c9473`
- Type: Space Grotesk (display), Inter (body), IBM Plex Mono (labels and data)
- Motif: each project is presented as a numbered survey "plate" with
  drafting-style corner ticks, a north arrow, and coordinate-style labels,
  echoing the plan-drawing conventions used throughout the source reports.
